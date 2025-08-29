const fs = require('fs');
const path = require('path');

const jaPath = path.resolve(__dirname, 'public/scripts/i18n/languages/ja.json');
const data = JSON.parse(fs.readFileSync(jaPath, 'utf8'));

// Ensure structure
if (!data.tools) data.tools = {};
if (!data.tools.document) data.tools.document = {};

// Top hero
data.tools.document.title = '文書ツール';
data.tools.document.subtitle = '文書の処理と変換';

// Document Processor card
if (!data.tools.document.processor) data.tools.document.processor = {};
data.tools.document.processor.title = 'ドキュメントプロセッサー';
data.tools.document.processor.description = '文書の変換と処理';
data.tools.document.processor.subtitle = 'PDF・Word などのドキュメントファイルを処理';

// PDF to Word card
if (!data.tools.document.pdf_to_word) data.tools.document.pdf_to_word = {};
data.tools.document.pdf_to_word.title = 'PDF から Word';
data.tools.document.pdf_to_word.description = 'PDF ファイルを Word 文書に変換';
data.tools.document.pdf_to_word.subtitle = 'PDF を編集可能な Word 形式（.docx）にすばやく簡単に変換';

// Normalize all nested buttons.back_to_tools under document section
function walk(obj) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (k === 'buttons' && v && typeof v === 'object' && typeof v.back_to_tools === 'string') {
      // Replace only if it mentions Document Tools in English
      if (/Back to Document Tools/.test(v.back_to_tools)) {
        v.back_to_tools = '← ドキュメントツールに戻る';
      }
    } else if (typeof v === 'object') {
      walk(v);
    }
  });
}

walk(data.tools.document);

fs.writeFileSync(jaPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log('Updated Japanese document tool translations.');



