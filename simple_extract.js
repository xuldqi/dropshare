const fs = require('fs');
const path = require('path');

const LANGUAGES_JS_PATH = './public/scripts/i18n/languages.js';
const LOCALES_DIR = './public/locales';

try {
    console.log('🔄 Attempting direct require...');

    // Directly require the modified file
    const dictionaries = require(LANGUAGES_JS_PATH);

    if (!dictionaries || typeof dictionaries !== 'object' || Object.keys(dictionaries).length === 0) {
        throw new Error("Failed to require dictionaries. The exported value is invalid.");
    }

    console.log(`✅ Successfully loaded dictionaries with ${Object.keys(dictionaries).length} languages.`);

    // Create locales directory
    if (!fs.existsSync(LOCALES_DIR)) {
        fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    // Write JSON files
    for (const lang in dictionaries) {
        const outputPath = path.join(LOCALES_DIR, `${lang}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(dictionaries[lang], null, 2), 'utf8');
        console.log(`  - Wrote ${Object.keys(dictionaries[lang]).length} keys to ${path.basename(outputPath)}`);
    }

    console.log('🎉 Extraction complete!');

} catch (error) {
    console.error('❌ An error occurred:', error.message);
    process.exit(1);
}

