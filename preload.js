const { contextBridge, ipcRenderer } = require('electron')

// 暴露API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 示例：获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 示例：打开外部链接
  openExternalLink: (url) => ipcRenderer.send('open-external-link', url),
  
  // 示例：发送消息到主进程
  sendMessage: (channel, data) => {
    // 白名单频道
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  
  // 示例：从主进程接收消息
  receiveMessage: (channel, func) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})