const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG 文件路径
const svgPath = path.join(__dirname, 'logo.svg');
const iconsDir = path.join(__dirname, 'build', 'icons');

// 确保 build/icons 目录存在
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 读取并修复 SVG 文件
function getFixedSVG(size, padding = 0.15) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  
  // 计算带边距的 viewBox
  const paddingPx = Math.round(size * padding);
  const innerSize = size - (paddingPx * 2);
  
  // 创建带白色背景和边距的 SVG
  const fixedSVG = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="white" rx="${Math.round(size * 0.1)}"/>
  <g transform="translate(${paddingPx}, ${paddingPx}) scale(${innerSize / 23})">
    ${svgContent.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
  </g>
</svg>`;
  
  return fixedSVG;
}

// 生成 PNG 图标
async function generatePNG(size, outputPath) {
  try {
    const svgBuffer = Buffer.from(getFixedSVG(size));
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created ${path.basename(outputPath)} (${size}x${size})`);
    return true;
  } catch (error) {
    console.error(`Error creating ${size}x${size} PNG:`, error.message);
    return false;
  }
}

// 生成 ICO 文件（包含多个尺寸）
async function generateICO() {
  try {
    // 生成多个尺寸的 PNG
    const pngBuffers = [];
    for (const size of [16, 32, 48, 64, 128, 256]) {
      const svgBuffer = Buffer.from(getFixedSVG(size));
      const buffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push({ size, buffer });
    }

    // ICO 文件结构
    // 1. ICO 头部 (6 bytes)
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0);      // 保留
    icoHeader.writeUInt16LE(1, 2);      // 类型：1=图标
    icoHeader.writeUInt16LE(pngBuffers.length, 4);  // 图像数量

    // 2. ICO 目录条目 (每个 16 bytes)
    const entries = [];
    let dataOffset = 6 + (pngBuffers.length * 16);  // 头部 + 所有条目

    for (const { size, buffer } of pngBuffers) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(size < 256 ? size : 0, 0);  // 宽度（0表示256）
      entry.writeUInt8(size < 256 ? size : 0, 1);  // 高度（0表示256）
      entry.writeUInt8(0, 2);          // 调色板颜色数
      entry.writeUInt8(0, 3);          // 保留
      entry.writeUInt16LE(1, 4);       // 颜色平面数
      entry.writeUInt16LE(32, 6);      // 每像素位数
      entry.writeUInt32LE(buffer.length, 8);  // 图像数据大小
      entry.writeUInt32LE(dataOffset, 12);     // 图像数据偏移量
      entries.push(entry);
      dataOffset += buffer.length;
    }

    // 3. 组合所有部分
    const icoBuffer = Buffer.concat([
      icoHeader,
      ...entries,
      ...pngBuffers.map(({ buffer }) => buffer)
    ]);

    const icoPath = path.join(iconsDir, 'icon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('Created icon.ico');
    return true;
  } catch (error) {
    console.error('Error creating ICO:', error.message);
    return false;
  }
}

// 生成 ICNS 文件（macOS）
async function generateICNS() {
  try {
    // ICNS 需要的尺寸和类型
    const icnsSizes = [
      { size: 16, type: 'icp4' },
      { size: 32, type: 'icp5' },
      { size: 64, type: 'icp6' },
      { size: 128, type: 'ic07' },
      { size: 256, type: 'ic08' },
      { size: 512, type: 'ic09' },
      { size: 1024, type: 'ic10' }
    ];

    const iconBlocks = [];

    for (const { size, type } of icnsSizes) {
      const svgBuffer = Buffer.from(getFixedSVG(size));
      const buffer = await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toBuffer();

      // 每个图标块：类型 (4 bytes) + 大小 (4 bytes) + 数据
      const blockHeader = Buffer.alloc(8);
      blockHeader.write(type, 0, 4, 'ascii');
      blockHeader.writeUInt32BE(buffer.length + 8, 4);

      iconBlocks.push(Buffer.concat([blockHeader, buffer]));
    }

    // ICNS 文件头：'icns' + 总大小
    const totalSize = iconBlocks.reduce((sum, block) => sum + block.length, 0) + 8;
    const icnsHeader = Buffer.alloc(8);
    icnsHeader.write('icns', 0, 4, 'ascii');
    icnsHeader.writeUInt32BE(totalSize, 4);

    const icnsBuffer = Buffer.concat([icnsHeader, ...iconBlocks]);
    const icnsPath = path.join(iconsDir, 'icon.icns');
    fs.writeFileSync(icnsPath, icnsBuffer);
    console.log('Created icon.icns');
    return true;
  } catch (error) {
    console.error('Error creating ICNS:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('Generating icons from logo.svg...\n');

  // 生成通用 PNG 图标 (256x256)
  await generatePNG(256, path.join(iconsDir, 'icon.png'));

  // 生成 ICO (Windows)
  await generateICO();

  // 生成 ICNS (macOS)
  await generateICNS();

  console.log('\nIcons generated successfully!');
  console.log(`Output directory: ${iconsDir}`);
}

// 检查 sharp 是否安装
try {
  require.resolve('sharp');
  main().catch(console.error);
} catch (error) {
  console.error('Error: sharp is not installed.');
  console.error('Please install it first: npm install sharp --save-dev');
  process.exit(1);
}