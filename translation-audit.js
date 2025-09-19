#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/Users/macmima1234/Documents/project/dropshare/public';

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
      dataI18nCount: (content.match(/data-i18n=/g) || []).length,
      hasOldI18n: content.includes('scripts/i18n/languages.js')
    };
  } catch (error) {
    return { hasI18nScript: false, hasDataI18n: false, hasTranslateFunction: false, dataI18nCount: 0, hasOldI18n: false };
  }
}

// Get all HTML files and categorize
const htmlFiles = fs.readdirSync(publicDir)
  .filter(file => file.endsWith('.html'))
  .sort();

const categories = {
  important: [], // Main functional pages that need translation
  needsFix: [],  // Pages with partial i18n that need completion
  complete: [],  // Pages with full i18n
  testDebug: [], // Test/debug pages (skip)
  backup: []     // Backup/old files (skip)
};

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  const i18nInfo = checkI18nUsage(filePath);
  
  // Skip test/debug pages
  if (file.includes('test') || file.includes('debug') || file.includes('analytics')) {
    categories.testDebug.push({ file, ...i18nInfo });
    return;
  }
  
  // Skip backup/old pages
  if (file.includes('backup') || file.includes('old')) {
    categories.backup.push({ file, ...i18nInfo });
    return;
  }
  
  // Categorize by i18n status
  if (i18nInfo.hasI18nScript && i18nInfo.hasDataI18n && i18nInfo.hasTranslateFunction) {
    categories.complete.push({ file, ...i18nInfo });
  } else if (i18nInfo.hasDataI18n || i18nInfo.hasOldI18n) {
    categories.needsFix.push({ file, ...i18nInfo });
  } else {
    // Check if it's an important functional page
    const isImportant = file.includes('tools') || file.includes('converter') || 
                       file.includes('compressor') || file.includes('merger') ||
                       file.includes('splitter') || file.includes('extractor') ||
                       file === 'index.html' || file === 'share.html' ||
                       file.includes('docx-to-');
    
    if (isImportant) {
      categories.important.push({ file, ...i18nInfo });
    } else {
      categories.complete.push({ file, ...i18nInfo }); // Assume non-critical pages are OK
    }
  }
});

console.log('🌐 DROPSHARE TRANSLATION STATUS REPORT');
console.log('='.repeat(60));
console.log(`📊 Total HTML files analyzed: ${htmlFiles.length}\n`);

console.log('✅ FULLY TRANSLATED PAGES (' + categories.complete.length + ')');
console.log('-'.repeat(40));
categories.complete.forEach(({ file, dataI18nCount }) => {
  console.log(`  ✅ ${file.padEnd(35)} (${dataI18nCount} keys)`);
});

console.log(`\n⚠️  PAGES NEEDING FIXES (${categories.needsFix.length})`);
console.log('-'.repeat(40));
categories.needsFix.forEach(({ file, hasI18nScript, hasDataI18n, hasTranslateFunction, dataI18nCount, hasOldI18n }) => {
  let status = [];
  if (!hasI18nScript) status.push('missing script');
  if (hasOldI18n) status.push('old script');
  if (!hasTranslateFunction) status.push('missing translate function');
  
  console.log(`  ⚠️  ${file.padEnd(35)} (${dataI18nCount} keys) - ${status.join(', ')}`);
});

console.log(`\n❌ IMPORTANT UNTRANSLATED PAGES (${categories.important.length})`);
console.log('-'.repeat(40));
categories.important.forEach(({ file, dataI18nCount }) => {
  console.log(`  ❌ ${file.padEnd(35)} (${dataI18nCount} keys)`);
});

console.log(`\n🔧 RECOMMENDATIONS:`);
console.log('-'.repeat(40));

if (categories.needsFix.length > 0) {
  console.log(`1. Fix ${categories.needsFix.length} pages with partial i18n:`);
  categories.needsFix.forEach(({ file, hasOldI18n, hasTranslateFunction }) => {
    const fixes = [];
    if (hasOldI18n) fixes.push('update script to /locales/i18n.js');
    if (!hasTranslateFunction) fixes.push('add translation function');
    console.log(`   • ${file}: ${fixes.join(' + ')}`);
  });
}

if (categories.important.length > 0) {
  console.log(`\n2. Add complete i18n to ${categories.important.length} important pages:`);
  categories.important.forEach(({ file }) => {
    console.log(`   • ${file}: add full i18n support`);
  });
}

const totalFunctional = categories.complete.length + categories.needsFix.length + categories.important.length;
const completionRate = Math.round((categories.complete.length / totalFunctional) * 100);

console.log(`\n📈 SUMMARY:`);
console.log(`   • Functional pages coverage: ${completionRate}% (${categories.complete.length}/${totalFunctional})`);
console.log(`   • Pages needing attention: ${categories.needsFix.length + categories.important.length}`);
console.log(`   • Test/debug pages: ${categories.testDebug.length} (skipped)`);
console.log(`   • Backup pages: ${categories.backup.length} (skipped)`);