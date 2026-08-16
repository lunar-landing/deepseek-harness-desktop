# DeepSeek Harness Desktop 发布指南

## 快速发布流程

### 方式一：使用 npm version 命令（推荐）

```bash
# 1. 更新版本号（自动修改 package.json）
npm version patch    # 1.0.1 → 1.0.2（修复 bug）
npm version minor    # 1.0.1 → 1.1.0（新增功能）
npm version major    # 1.0.1 → 2.0.0（重大更新）

# 2. 推送代码和标签到 GitHub
git push origin master --tags
```

### 方式二：手动操作

```bash
# 1. 修改 package.json 中的版本号
# 将 "version": "1.0.1" 改为 "version": "1.0.2"

# 2. 提交更改
git add .
git commit -m "Bump version to 1.0.2"

# 3. 创建标签
git tag v1.0.2

# 4. 推送代码和标签
git push origin master --tags
```

## 发布后会发生什么

推送版本标签后，GitHub Actions 会自动执行以下步骤：

### 1. 构建阶段（并行执行）
- **Windows Runner**：
  - 检出代码
  - 安装依赖
  - 构建 Windows 版本
  - 压缩为 `DeepSeek-Harness-Desktop-Windows-x64.zip`
  - 上传到 Artifacts

- **macOS Runner**：
  - 检出代码
  - 安装依赖
  - 构建 macOS 版本
  - 压缩为 `DeepSeek-Harness-Desktop-macOS-x64.zip`
  - 上传到 Artifacts

### 2. 发布阶段（标签推送时）
- 创建 GitHub Release
- 上传 Windows 和 macOS 安装包到 Release

## 下载安装包

### 方式一：从 Artifacts 下载（每次构建都有）

1. 访问 GitHub 仓库：`https://github.com/lunar-landing/deepseek-harness-desktop`
2. 点击 **Actions** 标签
3. 选择最新的构建记录
4. 在页面底部 **Artifacts** 部分下载：
   - `release-windows-latest-node22` → Windows 安装包
   - `release-macos-latest-node22` → macOS 安装包

### 方式二：从 Releases 下载（正式版本）

1. 访问 GitHub 仓库：`https://github.com/lunar-landing/deepseek-harness-desktop`
2. 点击 **Releases** 标签
3. 选择对应版本
4. 下载：
   - `DeepSeek-Harness-Desktop-Windows-x64.zip`
   - `DeepSeek-Harness-Desktop-macOS-x64.zip`

## 安装说明

### Windows 用户
1. 下载 `DeepSeek-Harness-Desktop-Windows-x64.zip`
2. 解压缩到任意目录（如 `C:\Program Files\DeepSeek Harness Desktop`）
3. 运行 `DeepSeek-Harness-Desktop.exe`
4. （可选）创建桌面快捷方式

### macOS 用户
1. 下载 `DeepSeek-Harness-Desktop-macOS-x64.zip`
2. 解压缩到任意目录
3. 运行 `DeepSeek-Harness-Desktop.app`
4. 如果提示"无法验证开发者"，请在 **系统偏好设置 → 安全性与隐私** 中允许运行

## 版本号规范

使用语义化版本号（Semantic Versioning）：

```
v主版本号.次版本号.修订号
```

- **主版本号（Major）**：不兼容的 API 修改
- **次版本号（Minor）**：向下兼容的功能性新增
- **修订号（Patch）**：向下兼容的问题修正

### 示例

| 版本号 | 说明 | 示例 |
|--------|------|------|
| 1.0.0 | 首个正式版本 | 初始发布 |
| 1.0.1 | 修复 bug | 修复登录问题 |
| 1.1.0 | 新增功能 | 添加主题切换 |
| 2.0.0 | 重大更新 | 全新界面设计 |

## 常见问题

### Q: 推送标签后没有触发构建？
**A:** 检查以下几点：
1. 标签格式是否正确（必须以 `v` 开头，如 `v1.0.2`）
2. 是否推送到 `master` 分支
3. GitHub Actions 是否已启用

### Q: 构建失败怎么办？
**A:** 
1. 查看 Actions 页面的构建日志
2. 常见问题：
   - 依赖安装失败：检查 `package.json`
   - 图标缺失：运行 `npm run create-icons`
   - 权限问题：检查 GitHub Token 设置

### Q: 如何回滚版本？
**A:**
```bash
# 删除本地标签
git tag -d v1.0.2

# 删除远程标签
git push origin --delete v1.0.2

# 推送修复后的代码
git push origin master
```

### Q: 如何跳过发布，只构建？
**A:** 推送到 `master` 分支（不带标签）即可触发构建，但不会创建 Release：
```bash
git push origin master
```

## 工作流配置说明

当前 GitHub Actions 配置：

```yaml
# 触发条件
on:
  push:
    branches: [main, master]  # 推送到主分支时构建
    tags: ['v*']              # 推送版本标签时构建并发布
  pull_request:
    branches: [main, master]  # PR 时构建
  workflow_dispatch:          # 手动触发

# 构建平台
strategy:
  matrix:
    os: [windows-latest, macos-latest]
    node-version: [22]
```

## 目录结构

```
deepseek-harness-desktop/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions 工作流
├── build/
│   └── icons/                 # 应用程序图标
├── dist/                      # 构建产物（本地）
├── main.js                    # Electron 主进程
├── preload.js                 # 预加载脚本
├── package.json               # 项目配置
├── create-icons.js            # 图标生成脚本
├── build.js                   # 本地构建脚本
└── README.md                  # 项目说明
```

## 联系方式

- 项目地址：https://github.com/lunar-landing/deepseek-harness-desktop
- 问题反馈：https://github.com/lunar-landing/deepseek-harness-desktop/issues
