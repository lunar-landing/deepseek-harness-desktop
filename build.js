const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 获取当前操作系统
const platform = os.platform();

console.log(`Building for platform: ${platform}`);

// 执行构建命令
try {
  execSync(`npm run build:${platform === 'win32' ? 'win' : 'mac'}`, {
    stdio: 'inherit'
  });
  console.log('Build completed successfully!');
  
  // electron-builder 输出目录
  const distDir = path.join(__dirname, 'dist');
  
  // 列出构建产物
  console.log('\nBuild artifacts:');
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}