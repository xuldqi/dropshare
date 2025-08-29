const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, 'public/scripts/i18n/languages');
const targets = ['de','es','fr','ja','ko','pt','zh-cn','zh-tw'];

const MAP = {
  'de': {
    title: 'Dokument-Tools',
    subtitle: 'Dokumente verarbeiten und konvertieren',
    processor: {
      title: 'Dokument-Prozessor',
      description: 'Dokumente konvertieren und verarbeiten',
      subtitle: 'PDF, Word und andere Dokumentdateien verarbeiten'
    },
    pdf_to_word: {
      title: 'PDF zu Word',
      description: 'PDF-Dateien in Word-Dokumente konvertieren',
      subtitle: 'PDF-Dokumente schnell und einfach in editierbares Word-Format umwandeln'
    },
    back: '← Zurück zu den Dokument-Tools'
  },
  'es': {
    title: 'Herramientas de documento',
    subtitle: 'Procesar y convertir documentos',
    processor: {
      title: 'Procesador de documentos',
      description: 'Convertir y procesar documentos',
      subtitle: 'Procesar archivos PDF, Word y otros documentos'
    },
    pdf_to_word: {
      title: 'PDF a Word',
      description: 'Convertir archivos PDF a documentos Word',
      subtitle: 'Convierte rápidamente tus PDF a formato Word editable'
    },
    back: '← Volver a herramientas de documento'
  },
  'fr': {
    title: 'Outils de document',
    subtitle: 'Traiter et convertir des documents',
    processor: {
      title: 'Processeur de documents',
      description: 'Convertir et traiter des documents',
      subtitle: 'Traiter les fichiers PDF, Word et autres documents'
    },
    pdf_to_word: {
      title: 'PDF vers Word',
      description: 'Convertir des fichiers PDF en documents Word',
      subtitle: 'Convertissez rapidement vos PDF en format Word éditable'
    },
    back: '← Retour aux outils de document'
  },
  'ja': {
    title: '文書ツール',
    subtitle: '文書の処理と変換',
    processor: {
      title: 'ドキュメントプロセッサー',
      description: '文書の変換と処理',
      subtitle: 'PDF・Word などのドキュメントファイルを処理'
    },
    pdf_to_word: {
      title: 'PDF から Word',
      description: 'PDF ファイルを Word 文書に変換',
      subtitle: 'PDF を編集可能な Word 形式（.docx）にすばやく簡単に変換'
    },
    back: '← ドキュメントツールに戻る'
  },
  'ko': {
    title: '문서 도구',
    subtitle: '문서 처리 및 변환',
    processor: {
      title: '문서 프로세서',
      description: '문서를 변환하고 처리',
      subtitle: 'PDF, Word 등 문서 파일 처리'
    },
    pdf_to_word: {
      title: 'PDF를 Word로',
      description: 'PDF 파일을 Word 문서로 변환',
      subtitle: 'PDF를 편집 가능한 Word 형식으로 빠르고 쉽게 변환'
    },
    back: '← 문서 도구로 돌아가기'
  },
  'pt': {
    title: 'Ferramentas de documento',
    subtitle: 'Processar e converter documentos',
    processor: {
      title: 'Processador de documentos',
      description: 'Converter e processar documentos',
      subtitle: 'Processar arquivos PDF, Word e outros documentos'
    },
    pdf_to_word: {
      title: 'PDF para Word',
      description: 'Converter arquivos PDF em documentos Word',
      subtitle: 'Converta rapidamente seus PDFs para o formato Word editável'
    },
    back: '← Voltar às ferramentas de documento'
  },
  'zh-cn': {
    title: '文档工具',
    subtitle: '处理和转换文档',
    processor: {
      title: '文档处理器',
      description: '转换和处理文档',
      subtitle: '处理 PDF、Word 等文档文件'
    },
    pdf_to_word: {
      title: 'PDF 转 Word',
      description: '将 PDF 文件转换为 Word 文档',
      subtitle: '快速将 PDF 转换为可编辑的 Word 格式'
    },
    back: '← 返回文档工具'
  },
  'zh-tw': {
    title: '文件工具',
    subtitle: '處理和轉換文件',
    processor: {
      title: '文件處理器',
      description: '轉換和處理文件',
      subtitle: '處理 PDF、Word 等文件'
    },
    pdf_to_word: {
      title: 'PDF 轉 Word',
      description: '將 PDF 檔案轉換為 Word 文件',
      subtitle: '快速將 PDF 轉換為可編輯的 Word 格式'
    },
    back: '← 返回文件工具'
  }
};

function walkReplaceBack(obj, text) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (k === 'buttons' && v && typeof v === 'object' && typeof v.back_to_tools === 'string') {
      if (/Back to Document Tools|Document Tools/.test(v.back_to_tools)) {
        v.back_to_tools = text;
      }
    } else if (typeof v === 'object') {
      walkReplaceBack(v, text);
    }
  });
}

targets.forEach((code) => {
  const p = path.join(dir, `${code}.json`);
  if (!fs.existsSync(p)) return;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.tools) data.tools = {};
  if (!data.tools.document) data.tools.document = {};
  const m = MAP[code];
  data.tools.document.title = m.title;
  data.tools.document.subtitle = m.subtitle;
  if (!data.tools.document.processor) data.tools.document.processor = {};
  Object.assign(data.tools.document.processor, m.processor);
  if (!data.tools.document.pdf_to_word) data.tools.document.pdf_to_word = {};
  Object.assign(data.tools.document.pdf_to_word, m.pdf_to_word);
  walkReplaceBack(data.tools.document, m.back);
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated document section for ${code}`);
});



