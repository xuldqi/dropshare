const fs = require('fs');
const path = require('path');

const LANGUAGES_JS_PATH = path.join(__dirname, 'public', 'scripts', 'i18n', 'languages.js');
const LOCALES_DIR = path.join(__dirname, 'public', 'locales');
const TEMP_JS_PATH = path.join(__dirname, 'temp_languages_for_extraction.js');

function extractAndSave() {
    console.log('🔄 Starting translation extraction...');

    // 1. Read the original languages.js file
    let content = fs.readFileSync(LANGUAGES_JS_PATH, 'utf8');

    // 2. "Surgical" injection to expose the internal `dictionaries` variable
    const injection = 'if(typeof window!=="undefined"){window.exposedDictionaries=dictionaries;}';
    // This regex finds the end of the IIFE and injects the code right before it.
    const modifiedContent = content.replace(/(\}\s*\)\s*\(\s*\)\s*;?)$/, `\n${injection}\n$1`);

    if (modifiedContent === content) {
        throw new Error("Injection failed. Could not find IIFE pattern.");
    }

    // 3. Prepare content with browser mocks
    const preparedContent = `
        var window = {};
        var self = {}; // Mock self for service worker contexts
        var navigator = { language: 'en' };
        var localStorage = { getItem: () => null, setItem: () => {} };
        var document = { 
            querySelectorAll: () => [], 
            addEventListener: () => {},
            documentElement: {
                setAttribute: () => {},
                getAttribute: () => {}
            }
        };
        
        ${modifiedContent}
        
        // Expose the variable for Node.js
        if (typeof module !== 'undefined') { module.exports = dictionaries; }
    `;

    // 4. Write to a temporary file
    fs.writeFileSync(TEMP_JS_PATH, preparedContent);
    console.log('  - Created temporary script for safe extraction.');

    // 5. Require the temporary file to execute it
    require(TEMP_JS_PATH);

    // 6. The dictionaries object is now on our mocked `window`
    const dictionaries = window.exposedDictionaries;
    if (!dictionaries || Object.keys(dictionaries).length === 0) {
        throw new Error("Failed to load dictionaries. The object is empty.");
    }
    console.log(`  - Successfully loaded the dictionaries object with ${Object.keys(dictionaries).length} languages.`);

    // 7. Create the locales directory if it doesn't exist
    if (!fs.existsSync(LOCALES_DIR)) {
        fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    // 8. Write each language to a separate JSON file
    let totalKeys = 0;
    let fileCount = 0;
    for (const lang in dictionaries) {
        if (Object.hasOwnProperty.call(dictionaries, lang)) {
            const translations = dictionaries[lang];
            const outputPath = path.join(LOCALES_DIR, `${lang}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf8');
            const keyCount = Object.keys(translations).length;
            totalKeys += keyCount;
            fileCount++;
            console.log(`  - Wrote ${keyCount} keys for '${lang}' to ${path.basename(outputPath)}`);
        }
    }

    console.log(`\n✅ Successfully extracted a total of ${totalKeys} translation keys.`);
    console.log(`📁 Generated ${fileCount} language files in '${LOCALES_DIR}'`);
}

try {
    extractAndSave();
    console.log('\n🎉 Step 1: Extraction complete!');
} catch (error) {
    console.error('\n❌ An error occurred during extraction:');
    console.error(error);
    process.exit(1);
} finally {
    // 9. Clean up the temporary file
    if (fs.existsSync(TEMP_JS_PATH)) {
        fs.unlinkSync(TEMP_JS_PATH);
    }
}
