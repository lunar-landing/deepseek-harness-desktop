const { execSync } = require('child_process');
const os = require('os');

// 获取当前操作系统
const platform = os.platform();

// 根据操作系统选择构建平台
let buildPlatform;
if (platform === 'win32') {
  buildPlatform = 'win32';
} else if (platform === 'darwin') {
  buildPlatform = 'darwin';
} else {
  console.error('Unsupported platform:', platform);
  process.exit(1);
}

console.log(`Building for platform: ${buildPlatform}`);

// 执行构建命令
try {
  execSync(`npm run create-icons && electron-packager . DeepSeek-Harness-Desktop --platform=${buildPlatform} --arch=x64 --out=dist --overwrite`, {
    stdio: 'inherit'
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}