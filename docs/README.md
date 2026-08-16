# DeepSeek Harness Desktop 下载页面

这是一个静态下载页面，展示 DeepSeek Harness Desktop 的最新版本信息和下载按钮。

## 功能

- ✅ 展示最新版本号和发布日期
- ✅ 提供 Windows 安装版下载按钮
- ✅ 提供 Windows 便携版下载按钮
- ✅ 提供 macOS 便携版下载按钮
- ✅ 显示总下载次数
- ✅ 显示各平台下载次数
- ✅ 自动从 GitHub API 获取数据

## 部署方式

### 方式一：GitHub Pages（推荐）

1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `docs` 目录作为源
3. 访问 `https://lunar-landing.github.io/deepseek-harness-desktop/`

### 方式二：其他静态托管

将 `docs` 目录部署到任何静态托管服务：
- Vercel
- Netlify
- Cloudflare Pages

## 自定义

修改 `docs/index.html` 中的配置：

```javascript
const REPO_OWNER = 'lunar-landing';  // GitHub 用户名
const REPO_NAME = 'deepseek-harness-desktop';  // 仓库名
```

## 技术栈

- 纯 HTML/CSS/JavaScript
- 使用 GitHub API 获取版本信息
- 响应式设计，支持移动端
