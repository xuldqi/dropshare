const fs = require('fs');

// 简体繁体字转换映射表（核心常用字）
const simplifiedToTraditional = {
    '应': '應', '该': '該', '设': '設', '备': '備', '连': '連', '接': '接', '网': '網', '络': '絡',
    '发': '發', '现': '現', '为': '為', '问': '問', '题': '題', '类': '類', '别': '別', '访': '訪',
    '问': '問', '顾': '顧', '客': '客', '户': '戶', '服': '服', '务': '務', '器': '器', '务': '務',
    '这': '這', '样': '樣', '过': '過', '程': '程', '协': '協', '议': '議', '确': '確', '保': '保',
    '传': '傳', '输': '輸', '数': '數', '据': '據', '创': '創', '建': '建', '键': '鍵', '交': '交',
    '换': '換', '传': '傳', '输': '輸', '协': '協', '议': '議', '加': '加', '密': '密', '端': '端',
    '确': '確', '保': '保', '只': '只', '有': '有', '预': '預', '期': '期', '收': '收', '件': '件',
    '人': '人', '可': '可', '以': '以', '解': '解', '密': '密', '据': '據', '浏': '瀏', '览': '覽',
    '器': '器', '支': '支', '持': '持', '块': '塊', '连': '連', '接': '接', '必': '必', '要': '要',
    '页': '頁', '面': '面', '刷': '刷', '新': '新', '禁': '禁', '用': '用', '代': '代', '理': '理',
    '服': '服', '务': '務', '可': '可', '能': '能', '会': '會', '干': '干', '扰': '擾', '络': '絡',
    '某': '某', '些': '些', '企': '企', '业': '業', '或': '或', '公': '公', '共': '共', '阻': '阻',
    '止': '止', '连': '連', '接': '接', '传': '傳', '输': '輸', '失': '失', '败': '敗', '原': '原',
    '因': '因', '中': '中', '断': '斷', '不': '不', '稳': '穩', '定': '定', '设': '設', '备': '備',
    '失': '失', '去': '去', '关': '關', '闭': '閉', '文': '文', '件': '件', '太': '太', '大': '大',
    '处': '處', '理': '理', '内': '內', '存': '存', '限': '限', '制': '制', '特': '特', '别': '別',
    '移': '移', '动': '動', '尝': '嘗', '试': '試', '较': '較', '小': '小', '部': '部', '分': '分',
    '稳': '穩', '连': '連', '窗': '窗', '口': '口', '保': '保', '持': '持', '活': '活', '跃': '躍',
    '状': '狀', '态': '態', '需': '需', '要': '要', '互': '互', '联': '聯', '长': '長', '时': '時',
    '间': '間', '访': '訪', '问': '問', '位': '位', '置': '置', '有': '有', '限': '限', '无': '無',
    '标': '標', '准': '準', '协': '協', '议': '議', '数': '數', '据': '據', '私': '私', '密': '密',
    '透': '透', '明': '明', '专': '專', '家': '家', '审': '審', '查': '查', '实': '實', '践': '踐',
    '进': '進', '一': '一', '步': '步', '增': '增', '强': '強', '保': '保', '护': '護', '信': '信',
    '任': '任', '更': '更', '新': '新', '获': '獲', '益': '益', '于': '於', '最': '最', '新': '新',
    '补': '補', '丁': '丁', '密': '密', '码': '碼', '敏': '敏', '感': '感', '信': '信', '息': '息',
    '验': '驗', '证': '證', '接': '接', '收': '收', '虑': '慮', '使': '使', '额': '額', '外': '外',
    '结': '結', '合': '合', '技': '技', '术': '術', '实': '實', '践': '踐', '信': '信', '心': '心',
    '维': '維', '护': '護', '强': '強', '敏': '敏', '感': '感'
};

function convertToTraditional(text) {
    let result = text;
    for (const [simplified, traditional] of Object.entries(simplifiedToTraditional)) {
        result = result.replace(new RegExp(simplified, 'g'), traditional);
    }
    return result;
}

// 提取键值对的正则表达式
const keyRegex = /"([^"]+)":\s*"([^"]*(?:\\.[^"]*)*)"/g;

function extractKeys(content) {
    const keys = {};
    let match;
    while ((match = keyRegex.exec(content)) !== null) {
        keys[match[1]] = match[2];
    }
    return keys;
}

// 读取文件
const enContent = fs.readFileSync('./public/scripts/i18n/languages/en.js', 'utf8');
const zhContent = fs.readFileSync('./public/scripts/i18n/languages/zh.js', 'utf8');
const zhTwContent = fs.readFileSync('./public/scripts/i18n/languages/zh-tw.js', 'utf8');

const enKeys = extractKeys(enContent);
const zhKeys = extractKeys(zhContent);
const zhTwKeys = extractKeys(zhTwContent);

// 找出繁体中文缺失的键
const enKeyList = Object.keys(enKeys);
const zhTwKeyList = Object.keys(zhTwKeys);
const missingInZhTw = enKeyList.filter(key => !zhTwKeyList.includes(key));

console.log(`繁体中文缺失 ${missingInZhTw.length} 个键:`);

// 创建补充的翻译
const additionalTranslations = {};
missingInZhTw.forEach(key => {
    // 优先使用简体中文的翻译，然后转换为繁体
    if (zhKeys[key]) {
        additionalTranslations[key] = convertToTraditional(zhKeys[key]);
    } else {
        // 如果简体中文也没有，标记需要手动翻译
        additionalTranslations[key] = `[需要翻译] ${enKeys[key]}`;
    }
    console.log(`"${key}": "${additionalTranslations[key]}"`);
});

// 生成补充内容
let additions = '';
Object.entries(additionalTranslations).forEach(([key, value]) => {
    additions += `    "${key}": "${value}",\n`;
});

console.log('\n=== 需要添加到繁体中文文件的内容 ===');
console.log(additions);