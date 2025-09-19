#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/Users/macmima1234/Documents/project/dropshare/public';

// Get all HTML files
const htmlFiles = fs.readdirSync(publicDir)
  .filter(file => file.endsWith('.html'))
  .sort();

console.log(`Found ${htmlFiles.length} HTML files\n`);

// Categorize files
const categories = {
  main: [],
  tools: [],
  test: [],
  backup: [],
  real: []
};

htmlFiles.forEach(file => {
  if (file.includes('test') || file.includes('debug') || file.includes('analytics')) {
    categories.test.push(file);
  } else if (file.includes('backup') || file.includes('old')) {
    categories.backup.push(file);
  } else if (file.includes('-real')) {
    categories.real.push(file);
  } else if (file.includes('tools') || file.includes('converter') || file.includes('compressor') || 
             file.includes('trimmer') || file.includes('merger') || file.includes('resizer') ||
             file.includes('rotator') || file.includes('cropper') || file.includes('filter') ||
             file.includes('watermark') || file.includes('background') || file.includes('effects') ||
             file.includes('extractor') || file.includes('processor')) {
    categories.tools.push(file);
  } else {
    categories.main.push(file);
  }
});

console.log('📊 File Categories:');
console.log(`Main pages: ${categories.main.length}`);
console.log(`Tool pages: ${categories.tools.length}`);
console.log(`Real tool implementations: ${categories.real.length}`);
console.log(`Test/Debug pages: ${categories.test.length}`);
console.log(`Backup/Old pages: ${categories.backup.length}\n`);

// Function to check if a file has i18n
function checkI18nUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasI18nScript = content.includes('/locales/i18n.js') || content.includes('DROPSHARE_I18N');
    const hasDataI18n = content.includes('data-i18n=');
    const hasTranslateFunction = content.includes('translatePage') || content.includes('t(');
    
    return {
      hasI18nScript,
      hasDataI18n,
      hasTranslateFunction,
      dataI18nCount: (content.match(/data-i18n=/g) || []).length
    };
  } catch (error) {
    return { hasI18nScript: false, hasDataI18n: false, hasTranslateFunction: false, dataI18nCount: 0 };
  }
}

// Check translation coverage for each category
for (const [category, files] of Object.entries(categories)) {
  if (files.length === 0) continue;
  
  console.log(`\n🔍 ${category.toUpperCase()} PAGES TRANSLATION STATUS:`);
  console.log('='.repeat(50));
  
  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    const i18nInfo = checkI18nUsage(filePath);
    
    let status = '❌ No i18n';
    if (i18nInfo.hasI18nScript && i18nInfo.hasDataI18n && i18nInfo.hasTranslateFunction) {
      status = `✅ Full i18n (${i18nInfo.dataI18nCount} keys)`;
    } else if (i18nInfo.hasDataI18n) {
      status = `⚠️  Partial i18n (${i18nInfo.dataI18nCount} keys)`;
    } else if (i18nInfo.hasI18nScript) {
      status = '🟡 Script only';
    }
    
    console.log(`  ${file.padEnd(35)} ${status}`);
  });
}

// Summary
const allFiles = Object.values(categories).flat();
let fullI18n = 0;
let partialI18n = 0;
let noI18n = 0;

allFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  const i18nInfo = checkI18nUsage(filePath);
  
  if (i18nInfo.hasI18nScript && i18nInfo.hasDataI18n && i18nInfo.hasTranslateFunction) {
    fullI18n++;
  } else if (i18nInfo.hasDataI18n || i18nInfo.hasI18nScript) {
    partialI18n++;
  } else {
    noI18n++;
  }
});

console.log(`\n📈 TRANSLATION COVERAGE SUMMARY:`);
console.log('='.repeat(40));
console.log(`✅ Full i18n support: ${fullI18n} pages`);
console.log(`⚠️  Partial i18n support: ${partialI18n} pages`);
console.log(`❌ No i18n support: ${noI18n} pages`);
console.log(`📊 Total coverage: ${Math.round((fullI18n / allFiles.length) * 100)}%`);