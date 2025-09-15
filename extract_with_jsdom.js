const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const LANGUAGES_JS_PATH = path.join(__dirname, 'public', 'scripts', 'i18n', 'languages.js');
const LOCALES_DIR = path.join(__dirname, 'public', 'locales');

(async () => {
  try {
    console.log('🔄 Using jsdom to extract translations...');

    const src = fs.readFileSync(LANGUAGES_JS_PATH, 'utf8');
    // Replace the declaration so the object is assigned to window and escapes closures
    const replaced = src.replace(/(?:const|var)\s+dictionaries\s*=\s*/m, 'window.exposedDictionaries = ');

    const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
      url: 'https://example.com',
      runScripts: 'outside-only',
      pretendToBeVisual: true,
    });

    const { window } = dom;
    // Provide minimal mocks that might be referenced
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
    window.navigator.language = 'en';

    // Execute modified script in the jsdom window context
    window.eval(replaced);

    const dictionaries = window.exposedDictionaries;
    if (!dictionaries || typeof dictionaries !== 'object') {
      throw new Error('Failed to retrieve dictionaries from jsdom context');
    }

    if (!fs.existsSync(LOCALES_DIR)) {
      fs.mkdirSync(LOCALES_DIR, { recursive: true });
    }

    let total = 0;
    let langs = 0;
    for (const lang of Object.keys(dictionaries)) {
      const out = path.join(LOCALES_DIR, `${lang}.json`);
      const translations = dictionaries[lang] || {};
      fs.writeFileSync(out, JSON.stringify(translations, null, 2), 'utf8');
      total += Object.keys(translations).length;
      langs += 1;
      console.log(`  - ${lang}.json written (${Object.keys(translations).length} keys)`);
    }

    console.log(`✅ Extracted ${total} keys across ${langs} languages → ${LOCALES_DIR}`);
  } catch (err) {
    console.error('❌ Extraction failed:', err.message);
    process.exit(1);
  }
})();

