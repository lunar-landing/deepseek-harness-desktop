# DeepSeek Harness Desktop

<div align="center">

![Logo](logo.svg)

**基于官方 DeepSeek Harness 构建的桌面客户端**

[![Build and Release](https://github.com/lunar-landing/deepseek-harness-desktop/actions/workflows/build.yml/badge.svg)](https://github.com/lunar-landing/deepseek-harness-desktop/actions/workflows/build.yml)

</div>

## 功能特性

- 🚀 **开箱即用** - 自动检测并连接到现有的 DeepSeek Harness 服务器
- 💻 **跨平台支持** - 同时支持 Windows 和 macOS 平台
- 📦 **多种安装方式** - Windows 提供便携版和安装版
- 🎨 **简洁界面** - 无边框窗口设计，白色主题
- ⚡ **轻量高效** - 启动快速，运行流畅
- 🔒 **开源安全** - 完全开源，社区维护

## 下载

访问 [GitHub Releases](https://github.com/lunar-landing/deepseek-harness-desktop/releases) 下载最新版本。

### Windows
- **安装版** (推荐): `DeepSeek-Harness-Desktop-Setup-*.exe`
- **便携版**: `DeepSeek-Harness-Desktop-Windows-x64-Portable.zip`

### macOS
- **便携版**: `DeepSeek-Harness-Desktop-macOS-x64.zip`

## 安装说明

### Windows 安装版
1. 下载 `.exe` 安装程序
2. 运行安装程序，按提示完成安装
3. 从桌面或开始菜单启动

### Windows 便携版
1. 下载 `.zip` 压缩包
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.exe`

### macOS
1. 下载 `.zip` 压缩包
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.app`

## 开发

```bash
# 安装依赖
npm install

# 生成图标
npm run create-icons

# 构建当前平台
npm run build

# 构建 Windows 安装版
npm run build:win:installer
```

## 许可证

MIT License

## 免责声明

这是由社区维护的开源项目，并非 DeepSeek 官方产品。