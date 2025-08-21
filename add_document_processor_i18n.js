const fs = require('fs');

// 英文翻译（从document-processor.html硬编码文本提取和翻译）
const documentProcessorTranslations = {
    en: {
        'document_processor_title': 'Document Processor',
        'document_processor_heading': '📄 Document Processor',
        'back_to_document_tools': '← Document Tools',
        
        // 文件上传区域
        'drop_documents_here': 'Drag document files here or click to select',
        'supported_formats_document': 'Supports PDF, DOCX, TXT, RTF, HTML formats',
        'btn_select_document': 'Select Document Files',
        
        // 预览区域
        'document_preview': 'Document Preview',
        'select_file_to_preview': 'Please select a document file to preview',
        
        // 选项卡
        'tab_split': 'Document Split',
        'tab_merge': 'Document Merge',
        
        // 文档拆分
        'split_settings': '✂️ Document Split Settings',
        'split_method_label': 'Split method:',
        'split_by_pages': 'Split by pages',
        'split_by_range': 'Split by range',
        'split_by_bookmarks': 'Split by bookmarks',
        'pages_per_file': 'Pages per file:',
        'page_range': 'Page range (e.g: 1-5,7,9-12):',
        
        // 文档合并
        'merge_settings': '🔗 Document Merge Settings',
        'merge_description': 'Merge multiple PDF documents into one. Please upload multiple files.',
        'select_merge_files': 'Select documents to merge',
        'add_bookmarks_label': 'Add bookmark for each document',
        
        // 输出设置
        'output_settings': 'Output Settings',
        'output_format': 'Output format:',
        'pdf_format': 'PDF',
        'docx_format': 'Word Document (.docx)',
        'txt_format': 'Plain Text',
        'rtf_format': 'RTF Document',
        'filename': 'Filename:',
        
        // 按钮
        'btn_process': 'Start Processing',
        'btn_new_file': 'Select New Document',
        'btn_process_another': 'Process Another Document',
        
        // 错误和状态消息
        'unsupported_format': 'Unsupported document format! Please select PDF, DOCX, TXT, RTF or HTML files.',
        'document_parse_failed': 'Document parsing failed',
        'pdf_loaded': 'PDF document loaded, parsing...',
        'pdf_parse_success': 'PDF parsing successful',
        'pdf_parse_failed': 'PDF parsing failed',
        'no_preview_available': 'Unable to preview this document content',
        'pdf_page_prefix': 'PDF page ',
        'pdf_page_suffix': ' - Unable to extract text content',
        'document_processing_failed': 'Document processing failed',
        'text_extraction_failed': 'Failed to extract text content. This might be an image-based PDF or scanned document.',
        
        // 处理状态
        'processing_document': 'Splitting document...',
        'creating_document': 'Creating document ',
        'document_number_suffix': '...',
        'split_complete': 'Document split completed!',
        'merging_documents': 'Merging documents...',
        'processing_document_number': 'Processing document ',
        'merge_complete': 'Document merge completed!',
        'converted_content': 'Converted document content',
        
        // 文件信息
        'document_type': 'Document type',
        'delete_button': 'Delete'
    },
    
    // 中文翻译（从原文件提取）
    zh: {
        'document_processor_title': '文档处理器',
        'document_processor_heading': '📄 文档处理器',
        'back_to_document_tools': '← 文档工具',
        
        'drop_documents_here': '拖拽文档文件到这里或点击选择',
        'supported_formats_document': '支持 PDF, DOCX, TXT, RTF, HTML 等格式',
        'btn_select_document': '选择文档文件',
        
        'document_preview': '文档预览',
        'select_file_to_preview': '请选择文档文件来预览',
        
        'tab_split': '文档拆分',
        'tab_merge': '文档合并',
        
        'split_settings': '✂️ 文档拆分设置',
        'split_method_label': '拆分方式:',
        'split_by_pages': '按页数拆分',
        'split_by_range': '按范围拆分', 
        'split_by_bookmarks': '按书签拆分',
        'pages_per_file': '每个文件页数:',
        'page_range': '页面范围 (例: 1-5,7,9-12):',
        
        'merge_settings': '🔗 文档合并设置',
        'merge_description': '将多个PDF文档合并为一个文档。请上传多个文件。',
        'select_merge_files': '选择要合并的文档',
        'add_bookmarks_label': '为每个文档添加书签',
        
        'output_settings': '输出设置',
        'output_format': '输出格式:',
        'pdf_format': 'PDF',
        'docx_format': 'Word 文档 (.docx)',
        'txt_format': '纯文本',
        'rtf_format': 'RTF 文档',
        'filename': '文件名:',
        
        'btn_process': '开始处理',
        'btn_new_file': '选择新文档',
        'btn_process_another': '处理其他文档',
        
        'unsupported_format': '不支持的文档格式！请选择 PDF, DOCX, TXT, RTF 或 HTML 文件。',
        'document_parse_failed': '文档解析失败',
        'pdf_loaded': 'PDF文档已加载，正在解析...',
        'pdf_parse_success': 'PDF解析成功',
        'pdf_parse_failed': 'PDF解析失败',
        'no_preview_available': '无法预览此文档内容',
        'pdf_page_prefix': 'PDF第',
        'pdf_page_suffix': '页 - 无法提取文本内容',
        'document_processing_failed': '文档处理失败',
        'text_extraction_failed': '未能提取到文本内容。这可能是一个图片型PDF或扫描文档。',
        
        'processing_document': '正在拆分文档...',
        'creating_document': '正在创建第 ',
        'document_number_suffix': ' 个文档...',
        'split_complete': '文档拆分完成！',
        'merging_documents': '正在合并文档...',
        'processing_document_number': '正在处理第 ',
        'merge_complete': '文档合并完成！',
        'converted_content': '转换后的文档内容',
        
        'document_type': '文档类型',
        'delete_button': '删除'
    },
    
    // 日文翻译
    ja: {
        'document_processor_title': 'ドキュメントプロセッサー',
        'document_processor_heading': '📄 ドキュメントプロセッサー',
        'back_to_document_tools': '← ドキュメントツール',
        
        'drop_documents_here': 'ここにドキュメントファイルをドラッグするか、クリックして選択してください',
        'supported_formats_document': 'PDF、DOCX、TXT、RTF、HTML形式をサポート',
        'btn_select_document': 'ドキュメントファイルを選択',
        
        'document_preview': 'ドキュメントプレビュー',
        'select_file_to_preview': 'プレビューするドキュメントファイルを選択してください',
        
        'tab_split': 'ドキュメント分割',
        'tab_merge': 'ドキュメント結合',
        
        'split_settings': '✂️ ドキュメント分割設定',
        'split_method_label': '分割方法:',
        'split_by_pages': 'ページ数で分割',
        'split_by_range': '範囲で分割',
        'split_by_bookmarks': 'ブックマークで分割',
        'pages_per_file': '1ファイルあたりのページ数:',
        'page_range': 'ページ範囲 (例: 1-5,7,9-12):',
        
        'merge_settings': '🔗 ドキュメント結合設定',
        'merge_description': '複数のPDFドキュメントを1つに結合します。複数のファイルをアップロードしてください。',
        'select_merge_files': '結合するドキュメントを選択',
        'add_bookmarks_label': '各ドキュメントにブックマークを追加',
        
        'output_settings': '出力設定',
        'output_format': '出力形式:',
        'pdf_format': 'PDF',
        'docx_format': 'Wordドキュメント (.docx)',
        'txt_format': 'プレーンテキスト',
        'rtf_format': 'RTFドキュメント',
        'filename': 'ファイル名:',
        
        'btn_process': '処理開始',
        'btn_new_file': '新しいドキュメントを選択',
        'btn_process_another': '他のドキュメントを処理',
        
        'unsupported_format': 'サポートされていないドキュメント形式です！PDF、DOCX、TXT、RTF、HTMLファイルを選択してください。',
        'document_parse_failed': 'ドキュメント解析に失敗しました',
        'pdf_loaded': 'PDFドキュメントが読み込まれました。解析中...',
        'pdf_parse_success': 'PDF解析成功',
        'pdf_parse_failed': 'PDF解析に失敗しました',
        'no_preview_available': 'このドキュメントの内容をプレビューできません',
        'pdf_page_prefix': 'PDF第',
        'pdf_page_suffix': 'ページ - テキスト内容を抽出できません',
        'document_processing_failed': 'ドキュメント処理に失敗しました',
        'text_extraction_failed': 'テキスト内容の抽出に失敗しました。これは画像型PDFまたはスキャンドキュメントの可能性があります。',
        
        'processing_document': 'ドキュメントを分割中...',
        'creating_document': '第',
        'document_number_suffix': 'ドキュメントを作成中...',
        'split_complete': 'ドキュメント分割完了！',
        'merging_documents': 'ドキュメントを結合中...',
        'processing_document_number': '第',
        'merge_complete': 'ドキュメント結合完了！',
        'converted_content': '変換されたドキュメント内容',
        
        'document_type': 'ドキュメントタイプ',
        'delete_button': '削除'
    }
};

// 生成其他语言的翻译（使用英文作为基础）
const otherLanguages = {
    'zh-tw': 'Chinese Traditional',
    'fr': 'French', 
    'de': 'German',
    'es': 'Spanish',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'ko': 'Korean'
};

// 为其他语言创建翻译（暂时使用英文，之后可以添加具体翻译）
Object.keys(otherLanguages).forEach(langCode => {
    documentProcessorTranslations[langCode] = { ...documentProcessorTranslations.en };
});

console.log('开始添加文档处理器翻译...');

// 读取当前的languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
if (!fs.existsSync(languagesPath)) {
    console.error('languages.js文件不存在:', languagesPath);
    process.exit(1);
}

const content = fs.readFileSync(languagesPath, 'utf8');

let LANGUAGES;
const languagesMatch = content.match(/const LANGUAGES = (\\{[\\s\\S]*?\\});/);
if (!languagesMatch) {
    console.log('尝试使用更宽松的匹配方式...');
    const startIdx = content.indexOf('const LANGUAGES = {');
    const endIdx = content.indexOf('// Get user language from browser');
    if (startIdx === -1 || endIdx === -1) {
        console.error('无法找到LANGUAGES对象或结束标记');
        process.exit(1);
    }
    // 手动提取对象部分
    const langObj = content.substring(startIdx + 'const LANGUAGES = '.length, endIdx).trim();
    if (!langObj.endsWith('};')) {
        console.error('LANGUAGES对象结构不正确');
        process.exit(1);
    }
    const cleanObj = langObj.slice(0, -1); // 移除最后的 ;
    try {
        LANGUAGES = eval(`(${cleanObj})`);
        console.log('成功解析LANGUAGES对象');
    } catch (error) {
        console.error('解析LANGUAGES对象失败:', error.message);
        process.exit(1);
    }
} else {
    try {
        LANGUAGES = eval(`(${languagesMatch[1]})`);
    } catch (error) {
        console.error('解析LANGUAGES对象失败:', error.message);
        process.exit(1);
    }
}

let totalAdded = 0;

// 为每种语言添加翻译
Object.keys(documentProcessorTranslations).forEach(langCode => {
    if (LANGUAGES[langCode]) {
        const langTranslations = LANGUAGES[langCode].translations;
        const newTranslations = documentProcessorTranslations[langCode];
        
        let added = 0;
        Object.keys(newTranslations).forEach(key => {
            if (!langTranslations[key]) {
                langTranslations[key] = newTranslations[key];
                added++;
                totalAdded++;
            }
        });
        
        console.log(`${LANGUAGES[langCode].name} (${langCode}): 添加了 ${added} 个翻译`);
    }
});

// 重新构建文件内容
const beforeLanguages = content.substring(0, content.indexOf('const LANGUAGES = {'));
const afterLanguages = content.substring(content.indexOf('// Get user language from browser'));

let newContent = beforeLanguages + 'const LANGUAGES = {\\n';

const langCodes = Object.keys(LANGUAGES);
langCodes.forEach((langCode, index) => {
    const lang = LANGUAGES[langCode];
    newContent += `    '${langCode}': {\\n`;
    newContent += `        code: '${lang.code}',\\n`;
    newContent += `        name: '${lang.name}',\\n`;
    newContent += `        rtl: ${lang.rtl},\\n`;
    newContent += `        translations: {\\n`;
    
    const translations = lang.translations;
    const keys = Object.keys(translations);
    keys.forEach((key, keyIndex) => {
        const value = translations[key].replace(/'/g, "\\\\'").replace(/\\n/g, '\\\\n');
        newContent += `            '${key}': '${value}'`;
        if (keyIndex < keys.length - 1) {
            newContent += ',\\n';
        } else {
            newContent += '\\n';
        }
    });
    
    newContent += '        }\\n';
    newContent += '    }';
    if (index < langCodes.length - 1) {
        newContent += ',\\n';
    } else {
        newContent += '\\n';
    }
});

newContent += '};\\n\\n' + afterLanguages;

// 写入更新后的文件
fs.writeFileSync(languagesPath, newContent, 'utf8');

console.log(`\\n🎉 成功添加了 ${totalAdded} 个文档处理器翻译到languages.js文件！`);
console.log('文件已更新:', languagesPath);