const fs = require('fs').promises;
const path = require('path');
const sliceConfig = [10, 30, 50, 100, 200, 300, 400, 500, 600, 800, 1000]

const names = [
    "白诗琦", "曹茂", "陈佳毅", "陈委", "代钰涵", "段焱曦", "付健强",
    "何庆瑜", "李晨瑞", "李巨燊", "李孟燚", "李琪琦", "李玮承", "李孝妍",
    "李昕翱", "李昕宸", "李欣锐", "李馨妤", "李一波", "梁郁婷", "林承昆",
    "林增昊", "刘菁菁", "刘巧琳", "刘张祺", "卢笑语", "卢鑫", "米思彤",
    "那娅涵", "普菲", "普菲雨", "邱皓曦", "尚以诚", "孙羽馨", "唐渊宸",
    "万镇豪", "王浩宇", "王子涵", "吴其锴", "武妙斯棋", "谢李雅慧", "邢振",
    "薛靖", "杨钛", "杨依", "杨梓涵", "姚怡馨", "尹怡蒙", "袁雨默", "张超",
    "张景维", "赵梦雪", "赵泊静", "钟嘉宁", "周诗涵", "朱佳颖",
];
const nameMap = new Map();
const grades = {}

async function readTable(path, name) {
    try {
        const file = await fs.readFile(path, 'utf-8');
        const lines = file.split("\r\n");
        for (let i = 0; i < lines.length; i++) {
            const grids = lines[i].split(",");
            if (!names.includes(grids[1])) continue;
            if(i <= 1) continue

            const history = nameMap.get(grids[1]) || [];
            // grids[2]是班级
            nameMap.set(grids[1], [...history, [name, grids[2], ...grids.slice(4)]]);
        }
    } catch (err) {
        console.error(`Error reading file ${path}:`, err);
    }
}

async function readAllCSVFilesInDirectory(directory) {
    try {
        const files = await fs.readdir(directory);
        for (const file of files) {
            if (file.endsWith('.csv')) {
                await readTable(path.join(directory, file), path.basename(file, '.csv'));
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${directory}:`, err);
    }
}

// 计算均分工具
function calcAvg(arr, idxArr) {
    // idxArr: 需要统计的列索引
    const sum = Array(idxArr.length).fill(0);
    let count = 0;
    for (const row of arr) {
        let valid = true;
        idxArr.forEach((idx, i) => {
            const v = parseFloat(row[idx]);
            if (isNaN(v)) valid = false;
            else sum[i] += v;
        });
        if (valid) count++;
    }
    if (count === 0) return Array(idxArr.length).fill(0);
    return sum.map(s => +(s / count).toFixed(2));
}

// 导出output.json
async function exportOutputJson() {
    // 1. 汇总所有学生成绩
    const students = [];
    for (const [name, history] of nameMap.entries()) {
        students.push({
            name,
            history
        });
    }

    // 2. 读取2419-2424班学生
    const classRange = ['2419班','2420班','2421班','2422班','2423班','2424班'];
    // 只取最新一次成绩（假设history最后一项为最新）
    const latest = [];
    for (const [name, history] of nameMap.entries()) {
        const last = history[history.length - 1];
        if (!last) continue;
        // last: [name, ...grids.slice(4)]
        // grids.slice(4): [总分,组合排名,校内排名,班级排名,语文原始分,语文校内排名,语文班级排名,数学原始分,...]
        // csv第4列是班级
        // 需要找到原始csv行
        // 这里假设history里有班级信息（如有需要可调整readTable）
        // 这里直接读取csv文件更准确
        // 但我们用history最后一项，且grids[2]为班级
        // 由于readTable只存了grids.slice(4)，需要补充班级信息
        // 这里假设班级信息在history[0][2]
        // 但实际上history只存了grids.slice(4)，所以需要在readTable里多存一列班级
        // 所以先修改readTable
    }

    // 先补充readTable，history里加上班级
    // ...existing code...
}

// 修改readTable，history里加上班级
async function readTable(path, name) {
    try {
        const file = await fs.readFile(path, 'utf-8');
        const lines = file.split("\r\n");
        for (let i = 0; i < lines.length; i++) {
            const grids = lines[i].split(",");
            if (!names.includes(grids[1])) continue;
            if(i <= 1) continue

            const history = nameMap.get(grids[1]) || [];
            // grids[2]是班级
            nameMap.set(grids[1], [...history, [name, grids[2], ...grids.slice(4)]]);
        }
    } catch (err) {
        console.error(`Error reading file ${path}:`, err);
    }
}

// 计算均分并导出
async function main() {
    await readAllCSVFilesInDirectory(path.join(__dirname, 'data'));

    // 1. 汇总所有学生成绩
    const students = [];
    const classRange = ['2419班','2420班','2421班','2422班','2423班','2424班'];
    const latest = [];
    for (const [name, history] of nameMap.entries()) {
        students.push({
            name,
            history
        });
        const last = history[history.length - 1];
        if (!last) continue;
        // last: [csv名, 班级, 总分, ...]
        if (classRange.includes(last[1])) {
            latest.push(last);
        }
    }

    // 2. 计算每班均分
    const classAvg = {};
    for (const c of classRange) {
        const arr = latest.filter(row => row[1] === c);
        // 总分:2, 语文:6, 数学:9, 英语:12, 物理:15, 化学:18, 生物:21
        const idxArr = [2,6,9,12,15,18,21];
        const avg = calcAvg(arr, idxArr);
        classAvg[c] = {
            name: c + '均分',
            班级: c,
            总分: avg[0],
            语文: avg[1],
            数学: avg[2],
            英语: avg[3],
            物理: avg[4],
            化学: avg[5],
            生物: avg[6]
        };
    }

    // 3. 计算sliceConfig区间均分（按总排名排序）
    // 总排名:3（csv第7列，last[4]）
    const sorted = latest.slice().sort((a, b) => parseInt(a[4]) - parseInt(b[4]));
    const sliceConfig = [10, 30, 50, 100, 200, 300, 400, 500, 600, 800, 1000];
    const sliceAvg = [];
    for (let i = 0; i < sliceConfig.length - 1; i++) {
        const start = sliceConfig[i];
        const end = sliceConfig[i+1];
        // 区间为[start+1, end]名
        const arr = sorted.slice(start, end);
        const idxArr = [2,6,9,12,15,18,21];
        const avg = calcAvg(arr, idxArr);
        sliceAvg.push({
            name: `${start+1}-${end}名均分`,
            区间: `${start+1}-${end}`,
            总分: avg[0],
            语文: avg[1],
            数学: avg[2],
            英语: avg[3],
            物理: avg[4],
            化学: avg[5],
            生物: avg[6]
        });
    }

    // 4. 导出output.json
    const output = {
        students,
        classAvg: Object.values(classAvg),
        sliceAvg
    };
    await fs.writeFile(path.join(__dirname, 'output.json'), JSON.stringify(output, null, 2), 'utf-8');
}

main();
