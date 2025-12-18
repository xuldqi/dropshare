const fs = require('fs');
const path = require('path');

const files = [
    'public/locales/en.json',
    'public/locales/zh-CN.json',
    'public/locales/es.json'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const keys = new Set();
    const duplicates = [];

    lines.forEach((line, index) => {
        const match = line.match(/"([^"]+)":/);
        if (match) {
            const key = match[1];
            if (keys.has(key)) {
                duplicates.push({ key, line: index + 1 });
            } else {
                keys.add(key);
            }
        }
    });

    if (duplicates.length > 0) {
        console.log(`\nDuplicate keys in ${file}:`);
        duplicates.forEach(d => {
            console.log(`  Line ${d.line}: "${d.key}"`);
        });
    } else {
        console.log(`\nNo duplicate keys found in ${file}`);
    }
});
