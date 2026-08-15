const fs = require('fs');
const path = require('path');

// 创建一个256x256像素的PNG图标
// 这是一个简单的纯色图标，实际应用中应该使用真正的图标

// PNG文件结构
function createPNG(width, height) {
  // PNG签名
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR块 - 图像头部
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);   // 宽度
  ihdrData.writeUInt32BE(height, 4);  // 高度
  ihdrData.writeUInt8(8, 8);          // 位深度（8位）
  ihdrData.writeUInt8(2, 9);          // 颜色类型（2=RGB）
  ihdrData.writeUInt8(0, 10);         // 压缩方法
  ihdrData.writeUInt8(0, 11);         // 过滤方法
  ihdrData.writeUInt8(0, 12);         // 隔行扫描方法
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // 创建图像数据 - 256x256像素的蓝色图像
  const rawData = Buffer.alloc(height * (1 + width * 3)); // 每行：过滤字节 + RGB数据
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 3);
    rawData[rowOffset] = 0; // 过滤类型：无过滤
    
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // 创建一个渐变的蓝色图案
      const r = Math.floor((x / width) * 100);  // 红色分量
      const g = Math.floor((y / height) * 100);  // 绿色分量
      const b = 200;                             // 蓝色分量
      
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }
  
  // 压缩数据（使用zlib）
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(rawData);
  
  const idatChunk = createChunk('IDAT', compressedData);
  
  // IEND块 - 图像结束
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  // 组合所有块
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 创建PNG块
function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32校验和计算
function crc32(data) {
  let crc = 0xFFFFFFFF;
  
  for (let i = 0; i < data.length; i++) {
    crc = crc ^ data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 创建build/icons目录
const iconsDir = path.join(__dirname, 'build', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建256x256的PNG图标
const pngData = createPNG(256, 256);
fs.writeFileSync(path.join(iconsDir, 'icon.png'), pngData);
console.log('Created icon.png (256x256)');

// 对于Windows，我们需要ICO格式
// 这里我们创建一个简单的ICO文件，包含PNG数据
function createICO(pngBuffer) {
  // ICO文件头
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);      // 保留
  icoHeader.writeUInt16LE(1, 2);      // 类型：1=图标
  icoHeader.writeUInt16LE(1, 4);      // 图像数量
  
  // ICO目录条目
  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(0, 0);          // 宽度（0表示256）
  icoEntry.writeUInt8(0, 1);          // 高度（0表示256）
  icoEntry.writeUInt8(0, 2);          // 调色板颜色数
  icoEntry.writeUInt8(0, 3);          // 保留
  icoEntry.writeUInt16LE(1, 4);       // 颜色平面数
  icoEntry.writeUInt16LE(32, 6);      // 每像素位数
  icoEntry.writeUInt32LE(pngBuffer.length, 8);  // 图像数据大小
  icoEntry.writeUInt32LE(22, 12);     // 图像数据偏移量（6+16=22）
  
  return Buffer.concat([icoHeader, icoEntry, pngBuffer]);
}

const icoData = createICO(pngData);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoData);
console.log('Created icon.ico (256x256)');

// 对于macOS，我们需要ICNS格式
// 这里我们创建一个简单的ICNS文件
function createICNS(pngBuffer) {
  // ICNS文件头
  const icnsHeader = Buffer.alloc(8);
  icnsHeader.write('icns', 0, 4, 'ascii');
  icnsHeader.writeUInt32BE(pngBuffer.length + 8, 4);
  
  // ICNS图标块
  const iconBlock = Buffer.alloc(8);
  iconBlock.write('ic07', 0, 4, 'ascii');  // 128x128图标
  iconBlock.writeUInt32BE(pngBuffer.length + 8, 4);
  
  return Buffer.concat([icnsHeader, iconBlock, pngBuffer]);
}

const icnsData = createICNS(pngData);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsData);
console.log('Created icon.icns (256x256)');

console.log('Icons created successfully!');