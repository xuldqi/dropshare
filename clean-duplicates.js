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

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Parse using JSON.parse which automatically handles duplicates (keeps last)
        const json = JSON.parse(content);
        // Write back with formatting
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
        console.log(`Cleaned ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});
