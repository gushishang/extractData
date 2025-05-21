const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 创建新工作簿
const wb = XLSX.utils.book_new();

// 读取CSV目录
const csvDir = './csvs';
const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'));

files.forEach(file => {
  // 读取CSV内容
  const csv = fs.readFileSync(path.join(csvDir, file), 'utf8');
  
  // 将CSV转换为二维数组（保留表头结构）
  const data = csv.split('\n').map(row => row.split(','));

  // 创建worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // 添加工作表（使用文件名作为sheet名）
  XLSX.utils.book_append_sheet(wb, ws, path.basename(file, '.csv').slice(0, 31));
});

// 写入Excel文件
XLSX.writeFile(wb, 'merged.xlsx');
console.log('CSV合并完成！');
