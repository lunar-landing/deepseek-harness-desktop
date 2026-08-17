const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow
let loadingWindow
let dshProcess

// ============================================
// Loading Window - 立即显示
// ============================================
function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 420,
    height: 320,
    frame: false,
    transparent: false,
    resizable: false,
    backgroundColor: '#0a0c10',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  const loadingHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "PingFang SC", sans-serif;
      background: #0a0c10;
      color: #e8eaf0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-app-region: drag;
      overflow: hidden;
      position: relative;
    }
    /* 网格背景 */
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    /* 顶部光晕 */
    body::after {
      content: "";
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      height: 300px;
      background: radial-gradient(ellipse at center, rgba(79,140,255,0.15), transparent 65%);
      pointer-events: none;
    }
    .loading-logo {
      width: 48px;
      height: 48px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    .loading-title {
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 6px;
      position: relative;
      z-index: 1;
    }
    .loading-sub {
      font-size: 13px;
      color: #9aa1b2;
      margin-bottom: 32px;
      position: relative;
      z-index: 1;
    }
    /* 旋转加载器 */
    .spinner {
      position: relative;
      z-index: 1;
      width: 36px;
      height: 36px;
      margin-bottom: 16px;
    }
    .spinner-ring {
      width: 100%;
      height: 100%;
      border: 2.5px solid rgba(255,255,255,0.08);
      border-top-color: #4f8cff;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading-status {
      font-size: 13px;
      color: #5d6577;
      position: relative;
      z-index: 1;
      min-height: 20px;
      transition: color 0.2s;
    }
    /* 错误状态 */
    .error-icon {
      display: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      align-items: center;
      justify-content: center;
      font-size: 22px;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    .error-actions {
      display: none;
      gap: 12px;
      position: relative;
      z-index: 1;
      margin-top: 8px;
    }
    .error-actions button {
      -webkit-app-region: no-drag;
      padding: 8px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-retry {
      background: #e8eaf0;
      color: #0a0c10;
    }
    .btn-retry:hover { background: #fff; }
    .btn-exit {
      background: rgba(255,255,255,0.05);
      color: #9aa1b2;
      border: 1px solid rgba(255,255,255,0.1) !important;
    }
    .btn-exit:hover { background: rgba(255,255,255,0.1); color: #e8eaf0; }
    /* 状态切换 */
    body.state-error .spinner { display: none; }
    body.state-error .loading-logo { display: none; }
    body.state-error .error-icon { display: flex; }
    body.state-error .error-actions { display: flex; }
    body.state-error .loading-status { color: #f87171; }
  </style>
</head>
<body>
  <img src="data:image/svg+xml;base64,${require('fs').readFileSync(path.join(__dirname, 'logo.svg')).toString('base64')}" class="loading-logo" alt="Logo">
  <div class="loading-title">DeepSeek Harness 桌面端</div>
  <div class="loading-sub">正在启动，请稍候…</div>
  <div class="spinner"><div class="spinner-ring"></div></div>
  <div class="loading-status">正在连接服务…</div>
  <div class="error-icon">✕</div>
  <div class="error-actions">
    <button class="btn-retry" onclick="retry()">重试</button>
    <button class="btn-exit" onclick="exit()">退出</button>
  </div>
  <script>
    const { ipcRenderer } = require('electron');
    function retry() { ipcRenderer.send('loading:retry'); }
    function exit() { ipcRenderer.send('loading:exit'); }
    ipcRenderer.on('loading:status', (_, msg) => {
      document.querySelector('.loading-status').textContent = msg;
    });
    ipcRenderer.on('loading:error', (_, msg) => {
      document.body.classList.add('state-error');
      document.querySelector('.loading-status').textContent = msg || '服务启动失败';
    });
  </script>
</body>
</html>
  `

  loadingWindow.loadURL(`data:text/html,${encodeURIComponent(loadingHTML)}`)

  loadingWindow.on('closed', () => {
    loadingWindow = null
  })
}

function updateLoadingStatus(msg) {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.webContents.send('loading:status', msg)
  }
}

function showLoadingError(msg) {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    loadingWindow.webContents.send('loading:error', msg)
  }
}

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

  // 主窗口就绪后关闭加载窗口
  mainWindow.webContents.on('did-finish-load', () => {
    if (loadingWindow && !loadingWindow.isDestroyed()) {
      loadingWindow.close()
    }
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
    updateLoadingStatus('正在启动 DeepSeek Harness 服务…')
    
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
      // npx 下载包时的进度信息也显示出来
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

    // 设置超时（90秒，给 npx 足够的下载时间）
    setTimeout(() => {
      reject(new Error('服务启动超时，请检查网络连接'))
    }, 90000)

    // 轮询端口是否可用
    let attempts = 0
    const checkPort = () => {
      attempts++
      const req = http.get('http://127.0.0.1:3080', (res) => {
        console.log('Server is responding')
        resolve()
      })
      
      req.on('error', (err) => {
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
// IPC: 加载窗口的重试和退出
// ============================================
ipcMain.on('loading:retry', () => {
  if (loadingWindow && !loadingWindow.isDestroyed()) {
    // 重置 UI 状态
    loadingWindow.webContents.reload()
  }
  setTimeout(() => bootApp(), 300)
})

ipcMain.on('loading:exit', () => {
  app.quit()
})

// ============================================
// 主启动流程
// ============================================
async function bootApp() {
  try {
    const isRunning = await checkServerRunning()
    
    if (isRunning) {
      console.log('Server already running, creating window...')
      updateLoadingStatus('服务已就绪，正在加载…')
      // 服务已就绪，短暂展示后切换
      setTimeout(() => createWindow(), 300)
    } else {
      await startDshServer()
      console.log('Server started, creating window...')
      updateLoadingStatus('服务已就绪，正在加载…')
      setTimeout(() => createWindow(), 300)
    }
  } catch (error) {
    console.error('Failed to start server:', error)
    showLoadingError(error.message || '服务启动失败')
  }
}

app.whenReady().then(() => {
  // 立刻显示加载窗口，不等服务
  createLoadingWindow()
  // 然后在后台启动服务
  bootApp()
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