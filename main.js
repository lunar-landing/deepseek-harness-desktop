const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow
let dshProcess

// ============================================
// 创建主窗口（启动时先显示 loading.html）
// ============================================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,                          // 先隐藏，等加载完毕再显示
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#FFFFFF',
      symbolColor: '#000000',
      height: 30
    },
    backgroundColor: '#0a0c10',
    borderColor: '#0a0c10',
    webPreferences: {
      nodeIntegration: true,              // loading.html 需要
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 先加载本地 loading 页面
  mainWindow.loadFile(path.join(__dirname, 'loading.html'))

  // loading.html 加载完毕后显示窗口（此时服务还没就绪，用户看到的就是 loading 界面）
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 注入标题栏拖动区域（切到远程页面后生效）
  mainWindow.webContents.on('did-finish-load', () => {
    const url = mainWindow.webContents.getURL()
    // 只在远程页面注入，不在本地 loading 页面注入
    if (url.startsWith('http')) {
      mainWindow.webContents.insertCSS(`
        body {
          padding-top: 30px;
          margin: 0;
          box-sizing: border-box;
        }
        * { box-sizing: border-box; }
        .titlebar-drag-region {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 30px;
          -webkit-app-region: drag;
          z-index: 9999;
          pointer-events: auto;
          background: transparent;
        }
        .titlebar-drag-region button,
        .titlebar-drag-region a,
        .titlebar-drag-region input,
        .titlebar-drag-region select,
        .titlebar-drag-region textarea {
          -webkit-app-region: no-drag;
          pointer-events: auto;
        }
      `)
      mainWindow.webContents.executeJavaScript(`
        document.body.insertAdjacentHTML('afterbegin', '<div class="titlebar-drag-region"></div>');
      `)
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// ============================================
// IPC: loading.html 的重试和退出按钮
// ============================================
ipcMain.on('loading:retry', () => {
  bootApp()
})

ipcMain.on('loading:exit', () => {
  app.quit()
})

// 向 loading.html 发送状态更新
function updateLoadingStatus(msg) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('loading:status', msg)
  }
}

function showLoadingError(msg) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('loading:error', msg)
  }
}

// ============================================
// 检测服务是否已运行
// ============================================
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3080', (res) => {
      console.log('Server is already running')
      resolve(true)
    })
    req.on('error', () => {
      console.log('Server is not running')
      resolve(false)
    })
    req.end()
  })
}

// ============================================
// 启动 dsh 服务并轮询直到就绪
// ============================================
function startDshServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting DeepSeek Harness server...')
    updateLoadingStatus('正在启动 DeepSeek Harness 服务…')

    dshProcess = spawn('npx', ['@deepseek-ai/dsh', 'web', '--port', '3080'], {
      stdio: 'pipe',
      shell: true
    })

    dshProcess.stdout.on('data', (data) => {
      console.log(`dsh stdout: ${data}`)
      if (data.toString().includes('Listening on')) {
        resolve()
      }
    })

    dshProcess.stderr.on('data', (data) => {
      console.error(`dsh stderr: ${data}`)
      const msg = data.toString()
      if (msg.includes('installed') || msg.includes('Downloading')) {
        updateLoadingStatus('正在下载依赖，请耐心等待…')
      }
    })

    dshProcess.on('close', (code) => {
      console.log(`dsh process exited with code ${code}`)
      if (code !== 0 && code !== null) {
        reject(new Error(`服务异常退出，错误码: ${code}`))
      }
    })

    // 90 秒超时
    setTimeout(() => {
      reject(new Error('服务启动超时，请检查网络连接'))
    }, 90000)

    // 轮询端口
    let attempts = 0
    const checkPort = () => {
      attempts++
      const req = http.get('http://127.0.0.1:3080', () => {
        console.log('Server is responding')
        resolve()
      })
      req.on('error', () => {
        console.log(`Waiting for server... (${attempts})`)
        if (attempts % 5 === 0) {
          updateLoadingStatus(`正在等待服务响应… (${attempts}s)`)
        }
        setTimeout(checkPort, 1000)
      })
      req.end()
    }
    setTimeout(checkPort, 2000)
  })
}

// ============================================
// 主启动流程
// ============================================
async function bootApp() {
  try {
    const isRunning = await checkServerRunning()

    if (!isRunning) {
      await startDshServer()
      console.log('Server started')
    } else {
      console.log('Server already running')
    }

    // 服务已就绪，同一个窗口切换到远程地址
    updateLoadingStatus('服务已就绪，正在加载…')
    mainWindow.loadURL('http://127.0.0.1:3080')

  } catch (error) {
    console.error('Failed to start server:', error)
    showLoadingError(error.message || '服务启动失败')
  }
}

app.whenReady().then(() => {
  createWindow()
  bootApp()
})

app.on('window-all-closed', () => {
  if (dshProcess) {
    dshProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (dshProcess) {
    dshProcess.kill()
  }
})
