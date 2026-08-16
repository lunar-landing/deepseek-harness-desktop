# DeepSeek Harness Desktop

[![Build and Release](https://github.com/YOUR_USERNAME/deepseek-harness-desktop/actions/workflows/build.yml/badge.svg)](https://github.com/YOUR_USERNAME/deepseek-harness-desktop/actions/workflows/build.yml)

**注意：请将 `YOUR_USERNAME` 替换为您的 GitHub 用户名。**

一个基于 Electron 的桌面客户端，用于封装 DeepSeek Harness 的 Web 界面。

## 设置说明

1. Fork 本项目到您的 GitHub 账户
2. 将 `YOUR_USERNAME` 替换为您的 GitHub 用户名
3. 推送到您的仓库
4. 自动构建触发条件：
   - **推送代码**：每次推送到 `main` 或 `master` 分支时自动构建
   - **创建标签**：推送版本标签（如 `v1.0.0`）时自动构建并发布
   - **Pull Request**：向 `main` 或 `master` 分支提交 PR 时自动构建
   - **手动触发**：在 GitHub Actions 页面手动运行工作流

### 发布新版本
```bash
# 更新版本号
npm version patch

# 推送标签到GitHub
git push origin main --tags
```

## 功能特性

- 自动检测并连接到现有的 DeepSeek Harness 服务器（端口 3080）
- 如果服务器未运行，自动启动服务器
- 支持 Windows 和 Mac 平台
- 跨平台兼容性
- 无边框窗口设计，隐藏标题栏
- 白色边框和背景颜色
- 可拖动的标题栏区域

## 下载

### 最新版本

访问 [GitHub Releases](https://github.com/YOUR_USERNAME/deepseek-harness-desktop/releases) 页面下载最新版本。

### 安装说明

1. 下载对应平台的压缩包（Windows: `DeepSeek-Harness-Desktop-Windows-x64.zip`，macOS: `DeepSeek-Harness-Desktop-macOS-x64.zip`）
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.exe`（Windows）或 `DeepSeek-Harness-Desktop.app`（macOS）

### 平台支持

| 平台 | 文件格式 | 说明 |
|------|----------|------|
| Windows | `.zip` | 便携版压缩包，解压后直接运行 |
| macOS | `.zip` | 便携版压缩包，解压后直接运行 |

## 开发

### 前置要求

- Node.js 22 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 运行开发版本

```bash
npm start
```

### 构建

#### 构建当前平台
```bash
npm run build
```

#### 构建特定平台
```bash
# Windows
npm run build:win

# macOS
npm run build:mac
```

### 发布

#### 自动发布（推荐）
1. 更新版本号：
   ```bash
   npm version patch
   ```

2. 推送标签到 GitHub：
   ```bash
   git push origin main --tags
   ```

3. GitHub Actions 会自动构建并发布到 Releases。

#### 手动发布
```bash
npm run release
```

## 项目结构

```
deepseek-harness-desktop/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions 工作流
├── build/
│   └── icons/                 # 应用程序图标
├── src/                       # 源代码（未来）
├── main.js                    # Electron 主进程
├── preload.js                 # 预加载脚本
├── package.json               # 项目配置
├── .gitignore                 # Git 忽略文件
└── README.md                  # 项目说明
```

## 配置说明

### 服务器配置
- 默认端口：3080
- 默认主机：127.0.0.1

### 构建配置
构建配置位于 `package.json` 文件的 `build` 部分。

## 自动更新

应用程序支持自动更新功能。当有新版本发布时，应用程序会自动检查更新并提示用户安装。

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

ISC License

## 联系方式

- 项目链接: https://github.com/YOUR_USERNAME/deepseek-harness-desktop
- 问题反馈: https://github.com/YOUR_USERNAME/deepseek-harness-desktop/issues