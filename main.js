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
  return new Promise((resolve) => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#0a0c10',
      borderColor: '#0a0c10',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })

    // loading.html 加载完毕后再启动 boot 流程
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.show()
      resolve()
    })

    mainWindow.loadFile(path.join(__dirname, 'loading.html')).catch(err => {
      console.error('Failed to load loading.html:', err)
      mainWindow.show()
      resolve()
    })

    mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
      console.error('Page load failed:', code, desc)
      mainWindow.show()
    })

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  })
}

// 向 loading.html 发送状态更新
function updateLoadingStatus(msg) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('loading:status', msg)
  }
}

// 窗口控制 IPC
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close()
})

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
    })

    dshProcess.stderr.on('data', (data) => {
      console.error(`dsh stderr: ${data}`)
    })

    dshProcess.on('close', (code) => {
      console.log(`dsh process exited with code ${code}`)
      if (code !== 0 && code !== null) {
        reject(new Error(`服务异常退出，错误码: ${code}`))
      }
    })

    // 30 秒超时
    setTimeout(() => {
      reject(new Error('服务启动超时'))
    }, 30000)

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
        updateLoadingStatus(`正在等待服务响应… (${attempts}s)`)
        setTimeout(checkPort, 1000)
      })
      req.end()
    }
    setTimeout(checkPort, 1000)
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

    // 远程页面加载完毕后注入标题栏和窗口控制按钮
    mainWindow.webContents.once('did-finish-load', () => {
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
        /* 窗口控制按钮 */
        .window-controls {
          position: fixed;
          top: 0;
          right: 0;
          display: flex;
          z-index: 10000;
          -webkit-app-region: no-drag;
        }
        .window-controls button {
          width: 46px;
          height: 30px;
          border: none;
          background: transparent;
          color: #e8eaf0;
          font-size: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s;
        }
        .window-controls button:hover {
          background: rgba(255,255,255,0.1);
        }
        .window-controls button.close:hover {
          background: #e81123;
          color: #fff;
        }
      `)
      mainWindow.webContents.executeJavaScript(`
        // 定义窗口控制函数
        window.minimize = function() { require('electron').ipcRenderer.send('window:minimize'); };
        window.maximize = function() { require('electron').ipcRenderer.send('window:maximize'); };
        window.close = function() { require('electron').ipcRenderer.send('window:close'); };
        
        // 注入标题栏和控制按钮
        document.body.insertAdjacentHTML('afterbegin', 
          '<div class="titlebar-drag-region"></div>'
          + '<div class="window-controls">'
          + '  <button class="minimize" onclick="window.minimize()">'
          + '    <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>'
          + '  </button>'
          + '  <button class="maximize" onclick="window.maximize()">'
          + '    <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="10" fill="none" stroke="currentColor" stroke-width="1"/></svg>'
          + '  </button>'
          + '  <button class="close" onclick="window.close()">'
          + '    <svg width="10" height="10" viewBox="0 0 10 10"><line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" stroke-width="1"/><line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="1"/></svg>'
          + '  </button>'
          + '</div>'
        );
      `)
    })

  } catch (error) {
    console.error('Failed to start server:', error)
    updateLoadingStatus(error.message || '服务启动失败')
  }
}

app.whenReady().then(async () => {
  await createWindow()   // 等 loading.html 加载完毕
  bootApp()              // 再启动服务检测
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
