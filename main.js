const { app, BrowserWindow } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow
let dshProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#FFFFFF',
      symbolColor: '#000000',
      height: 30
    },
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载本地文件或URL
  mainWindow.loadURL('http://127.0.0.1:3080')
  
  // 注入CSS和HTML以适配隐藏的标题栏
  mainWindow.webContents.on('did-finish-load', () => {
    const css = `
      body {
        padding-top: 30px; /* 为标题栏留出空间 */
        margin: 0;
        box-sizing: border-box;
      }
      /* 确保内容不会被标题栏覆盖 */
      * {
        box-sizing: border-box;
      }
      /* 创建可拖动的标题栏区域 */
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
      /* 确保按钮仍然可以点击 */
      .titlebar-drag-region button,
      .titlebar-drag-region a,
      .titlebar-drag-region input,
      .titlebar-drag-region select,
      .titlebar-drag-region textarea {
        -webkit-app-region: no-drag;
        pointer-events: auto;
      }
    `
    
    const html = `
      <div class="titlebar-drag-region"></div>
    `
    
    mainWindow.webContents.insertCSS(css)
    mainWindow.webContents.executeJavaScript(`
      document.body.insertAdjacentHTML('afterbegin', ${JSON.stringify(html.trim())});
    `)
  })

  // 打开开发者工具（可选）
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3080', (res) => {
      console.log('Server is already running')
      resolve(true)
    })
    
    req.on('error', (err) => {
      console.log('Server is not running')
      resolve(false)
    })
    
    req.end()
  })
}

function startDshServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting DeepSeek Harness server...')
    
    // 启动dsh web服务器
    dshProcess = spawn('npx', ['@deepseek-ai/dsh', 'web', '--port', '3080'], {
      stdio: 'pipe',
      shell: true
    })

    dshProcess.stdout.on('data', (data) => {
      console.log(`dsh stdout: ${data}`)
      // 检查服务器是否启动
      if (data.toString().includes('Listening on')) {
        resolve()
      }
    })

    dshProcess.stderr.on('data', (data) => {
      console.error(`dsh stderr: ${data}`)
    })

    dshProcess.on('close', (code) => {
      console.log(`dsh process exited with code ${code}`)
    })

    // 设置超时
    setTimeout(() => {
      reject(new Error('Server startup timeout'))
    }, 15000)

    // 也检查端口是否可用
    const checkPort = () => {
      const req = http.get('http://127.0.0.1:3080', (res) => {
        console.log('Server is responding')
        resolve()
      })
      
      req.on('error', (err) => {
        console.log('Server not ready yet, waiting...')
        setTimeout(checkPort, 1000)
      })
      
      req.end()
    }
    
    setTimeout(checkPort, 2000)
  })
}

app.whenReady().then(async () => {
  try {
    // 检查服务器是否已经在运行
    const isRunning = await checkServerRunning()
    
    if (!isRunning) {
      // 如果服务器没有运行，则启动它
      await startDshServer()
      console.log('Server started, creating window...')
    } else {
      console.log('Server already running, creating window...')
    }
    
    createWindow()
  } catch (error) {
    console.error('Failed to start server:', error)
    app.quit()
  }
})

app.on('window-all-closed', function () {
  // 关闭dsh服务器（只有在我们启动的情况下才关闭）
  if (dshProcess) {
    dshProcess.kill()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

// 处理应用程序退出
app.on('before-quit', () => {
  if (dshProcess) {
    dshProcess.kill()
  }
})