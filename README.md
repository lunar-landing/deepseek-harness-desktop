<h1 align="center">
  <img src="logo.svg" width="64" alt="DeepSeek Harness Desktop logo" valign="middle" />
  DeepSeek Harness Desktop
</h1>

<p align="center">
  基于 <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a> 构建的跨平台桌面客户端
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" /></a>
  <img alt="macOS" src="https://img.shields.io/badge/macOS-Apple%20Silicon%20%7C%20Intel-blue.svg" />
  <img alt="Windows" src="https://img.shields.io/badge/Windows-x64-blue.svg" />
  <a href="https://github.com/lunar-landing/deepseek-harness-desktop/actions/workflows/build.yml"><img src="https://github.com/lunar-landing/deepseek-harness-desktop/actions/workflows/build.yml/badge.svg" alt="Build Status" /></a>
</p>

<p align="center">
  <a href="https://lunar-landing.github.io/deepseek-harness-desktop/">官网</a> · <a href="https://github.com/lunar-landing/deepseek-harness-desktop/releases">下载</a> · <a href="https://github.com/lunar-landing/deepseek-harness-desktop/issues">反馈</a>
</p>

![DeepSeek Harness Desktop 界面截图](docs/images/desktop-screenshot.png)

<p align="center"><strong>无需配置，开箱即用的 DeepSeek Harness 桌面客户端，支持 Windows 和 macOS 平台。</strong></p>

DeepSeek Harness Desktop 将 DeepSeek Harness 的 Web 体验打包为桌面应用程序。它会自动启动本地 Harness 实例，管理端口，持久化配置文件、插件和会话数据，并在 Harness 准备就绪后立即打开完整界面。

> [!NOTE]
> 这是由社区维护的开源项目，并非 DeepSeek 官方产品。

## 功能特性

- 🚀 **开箱即用** - 自动检测并连接到现有的 DeepSeek Harness 服务器，无需复杂配置
- 💻 **跨平台支持** - 同时支持 Windows 和 macOS 平台（Apple Silicon 和 Intel）
- 📦 **多种安装方式** - Windows 提供安装版（NSIS）和便携版，macOS 提供便携版
- 🎨 **简洁界面** - 无边框窗口设计，白色主题，清爽的视觉体验
- ⚡ **轻量高效** - 启动快速，运行流畅，资源占用低
- 🔒 **安全可靠** - 沙箱化渲染进程，禁用 Node.js 权限，启用上下文隔离

## 下载

从 [GitHub Releases](https://github.com/lunar-landing/deepseek-harness-desktop/releases) 下载最新版本。

### Windows

| 版本 | 格式 | 说明 |
|------|------|------|
| 安装版 | `.exe` | NSIS 安装程序，支持自定义安装目录、创建快捷方式（推荐） |
| 便携版 | `.zip` | 解压即用，适合免安装使用场景 |

### macOS

| 版本 | 格式 | 说明 |
|------|------|------|
| 通用版 | `.zip` | 支持 Apple Silicon 和 Intel 芯片 |

## 安装说明

### Windows 安装版

1. 下载 `DeepSeek-Harness-Desktop-Setup-*.exe`
2. 运行安装程序，按提示完成安装
3. 从桌面快捷方式或开始菜单启动

### Windows 便携版

1. 下载 `DeepSeek-Harness-Desktop-Windows-x64-Portable.zip`
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.exe`

### macOS

1. 下载 `DeepSeek-Harness-Desktop-macOS-x64.zip`
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.app`
4. 如果提示"无法验证开发者"，请在 **系统偏好设置 → 安全性与隐私** 中允许运行

## 为什么需要这个项目

DeepSeek Harness 已经提供了完整的代理运行时和 Web UI。DeepSeek Harness Desktop 并不重新实现 Harness，而是提供桌面产品所需的宿主能力：

- 无需手动启动 CLI 或管理本地端口
- 启动时自动创建应用专属的 Harness 启动目录
- 通过 Harness 内置的目录选择器添加和管理工作区
- 统一管理 Harness 子进程、就绪检查、日志和关闭流程
- 将配置文件、插件和会话存储在应用安装目录之外，升级不会丢失用户数据
- 提供 macOS 和 Windows 的打包入口

## 技术架构

```text
DeepSeek Harness Desktop (Electron Main)
├── 应用专属启动目录
├── Harness 子进程生命周期管理
├── 随机本地端口和就绪检查
├── 原生日志和恢复操作
└── 加固的 BrowserWindow
     └── http://127.0.0.1:<random>  DeepSeek Harness Web UI

Electron userData
├── launch-root/
├── logs/harness.log
└── harness/
    ├── profiles/
    ├── sessions/
    └── 插件和用户数据
```

## 开发

### 环境要求

- Node.js 22 或更高版本
- npm
- macOS（Apple Silicon 或 Intel）或 Windows x64

### 本地开发

```bash
git clone https://github.com/lunar-landing/deepseek-harness-desktop.git
cd deepseek-harness-desktop
npm install
npm start
```

### 构建

```bash
# 生成图标
npm run create-icons

# 构建当前平台
npm run build

# 构建 Windows 便携版
npm run build:win

# 构建 Windows 安装版
npm run build:win:installer

# 构建 macOS 版本
npm run build:mac
```

## 项目结构

```text
deepseek-harness-desktop/
├── .github/
│   └── workflows/
│       ├── build.yml          # 构建和发布工作流
│       └── pages.yml          # GitHub Pages 部署
├── build/
│   └── icons/                 # 应用程序图标
├── docs/
│   ├── index.html             # 下载页面
│   └── images/                # 文档图片
├── main.js                    # Electron 主进程
├── preload.js                 # 预加载脚本
├── create-icons.js            # 图标生成脚本
├── build.js                   # 本地构建脚本
├── logo.svg                   # 应用 Logo
└── package.json               # 项目配置
```

## 发布新版本

### 方式一：使用 npm version（推荐）

```bash
# 1. 更新版本号（自动修改 package.json、创建 commit 和 tag）
npm version patch    # 1.0.0 → 1.0.1（修复 bug）
npm version minor    # 1.0.0 → 1.1.0（新增功能）
npm version major    # 1.0.0 → 2.0.0（重大更新）

# 2. 推送代码和标签到 GitHub
git push origin master --tags
```

### 方式二：手动操作

```bash
# 1. 修改 package.json 中的版本号
# 将 "version": "1.0.0" 改为 "version": "1.0.1"

# 2. 提交更改
git add .
git commit -m "Bump version to 1.0.1"

# 3. 创建标签
git tag v1.0.1

# 4. 推送代码和标签
git push origin master --tags
```

> [!IMPORTANT]
> 标签格式必须以 `v` 开头，如 `v1.0.1`，否则 GitHub Actions 不会触发发布流程。

GitHub Actions 会自动构建并发布到 [Releases](https://github.com/lunar-landing/deepseek-harness-desktop/releases)。

详细发布说明请查看 [RELEASE.md](RELEASE.md)。

## 社区

- [GitHub Issues](https://github.com/lunar-landing/deepseek-harness-desktop/issues) - 反馈问题和建议
- [GitHub Discussions](https://github.com/lunar-landing/deepseek-harness-desktop/discussions) - 讨论和交流

## 相关项目

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) - 官方 DeepSeek Harness 项目
- [DSH Market](https://github.com/dsh-market/dsh-market) - DeepSeek Harness 插件市场

## 贡献

欢迎提交 Issue 和 Pull Request。在提交更改之前，请确保：

```bash
npm test
npm run typecheck
npm run build
```

不要在 Issue、日志、截图或测试数据中包含真实的 API 密钥。

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

DeepSeek Harness 及其依赖项仍受其各自的上游许可证和商标政策约束。DeepSeek Harness Desktop 是一个独立的社区桌面包装器。

---

<p align="center">
  <sub>由社区维护的开源项目，并非 DeepSeek 官方产品</sub>
</p>