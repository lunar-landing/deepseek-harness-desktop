const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

// 获取当前操作系统
const platform = os.platform();

// 根据操作系统选择构建平台
let buildPlatform;
let archiveName;
if (platform === 'win32') {
  buildPlatform = 'win32';
  archiveName = 'DeepSeek-Harness-Desktop-Windows-x64.zip';
} else if (platform === 'darwin') {
  buildPlatform = 'darwin';
  archiveName = 'DeepSeek-Harness-Desktop-macOS-x64.zip';
} else {
  console.error('Unsupported platform:', platform);
  process.exit(1);
}

console.log(`Building for platform: ${buildPlatform}`);

// 执行构建命令
try {
  execSync(`npm run build:${buildPlatform === 'win32' ? 'win' : 'mac'}`, {
    stdio: 'inherit'
  });
  console.log('Build completed successfully!');
  
  // 压缩构建产物
  const distDir = path.join(__dirname, 'dist');
  const buildDir = path.join(distDir, `DeepSeek-Harness-Desktop-${buildPlatform}-x64`);
  
  if (fs.existsSync(buildDir)) {
    console.log(`Creating archive: ${archiveName}`);
    
    // 使用 PowerShell 压缩文件夹（Windows）或 zip 命令（macOS/Linux）
    if (platform === 'win32') {
      execSync(`powershell -Command "Compress-Archive -Path '${buildDir}' -DestinationPath '${path.join(distDir, archiveName)}' -Force"`, {
        stdio: 'inherit'
      });
    } else {
      execSync(`cd "${distDir}" && zip -r "${archiveName}" "DeepSeek-Harness-Desktop-${buildPlatform}-x64"`, {
        stdio: 'inherit'
      });
    }
    
    console.log(`Archive created: ${archiveName}`);
  } else {
    console.error('Build directory not found:', buildDir);
    process.exit(1);
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}