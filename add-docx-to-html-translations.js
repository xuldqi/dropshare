// DOCX to HTML转换器翻译键批量添加脚本
const fs = require('fs');

// 新的DOCX to HTML翻译键
const docxToHtmlTranslations = {
  de: {
    "_comment_docx_to_html": "DOCX zu HTML Konverter Übersetzungen",
    
    "docx_to_html_title": "DOCX zu HTML Konverter - DropShare",
    "docx_to_html_page_title": "📄 DOCX zu HTML Konverter",
    "docx_to_html_convert_title": "DOCX zu HTML konvertieren",
    "docx_to_html_description": "Microsoft Word-Dokumente in webfähiges HTML-Format konvertieren",
    "back_to_document_tools": "← Zurück zu Dokumententools",
    "preserve_formatting": "Formatierung beibehalten",
    "include_styles": "CSS-Stile einschließen", 
    "convert_images": "Bilder konvertieren",
    "responsive_design": "Responsive machen",
    "download_html": "HTML herunterladen",
    "preserve_formatting_feature": "Formatierung beibehalten",
    "preserve_formatting_desc": "Behält ursprüngliche Dokumentstile und Layout bei",
    "image_support_feature": "Bildunterstützung",
    "image_support_desc": "Konvertiert eingebettete Bilder in Webformate",
    "responsive_design_feature": "Responsive Design",
    "responsive_design_desc": "Mobilfreundliche HTML-Ausgabe",
    "secure_processing_feature": "Sichere Verarbeitung",
    "secure_processing_desc": "Alle Verarbeitung erfolgt lokal"
  },
  
  es: {
    "_comment_docx_to_html": "Traducciones del convertidor DOCX a HTML",
    
    "docx_to_html_title": "Convertidor DOCX a HTML - DropShare",
    "docx_to_html_page_title": "📄 Convertidor DOCX a HTML",
    "docx_to_html_convert_title": "Convertir DOCX a HTML",
    "docx_to_html_description": "Convertir documentos de Microsoft Word a formato HTML listo para web",
    "back_to_document_tools": "← Volver a Herramientas de Documentos",
    "preserve_formatting": "Preservar formato",
    "include_styles": "Incluir estilos CSS",
    "convert_images": "Convertir imágenes",
    "responsive_design": "Hacer responsivo",
    "download_html": "Descargar HTML",
    "preserve_formatting_feature": "Preservar Formato",
    "preserve_formatting_desc": "Mantiene los estilos y diseño del documento original",
    "image_support_feature": "Soporte de Imágenes",
    "image_support_desc": "Convierte imágenes incrustadas a formatos web",
    "responsive_design_feature": "Diseño Responsivo",
    "responsive_design_desc": "Salida HTML adaptable a móviles",
    "secure_processing_feature": "Procesamiento Seguro",
    "secure_processing_desc": "Todo el procesamiento ocurre localmente"
  },
  
  fr: {
    "_comment_docx_to_html": "Traductions du convertisseur DOCX vers HTML",
    
    "docx_to_html_title": "Convertisseur DOCX vers HTML - DropShare",
    "docx_to_html_page_title": "📄 Convertisseur DOCX vers HTML",
    "docx_to_html_convert_title": "Convertir DOCX vers HTML",
    "docx_to_html_description": "Convertir des documents Microsoft Word au format HTML prêt pour le web",
    "back_to_document_tools": "← Retour aux Outils de Documents",
    "preserve_formatting": "Préserver la mise en forme",
    "include_styles": "Inclure les styles CSS",
    "convert_images": "Convertir les images",
    "responsive_design": "Rendre adaptatif",
    "download_html": "Télécharger HTML",
    "preserve_formatting_feature": "Préserver la Mise en Forme",
    "preserve_formatting_desc": "Maintient les styles et la mise en page du document original",
    "image_support_feature": "Support d'Images",
    "image_support_desc": "Convertit les images intégrées en formats web",
    "responsive_design_feature": "Design Adaptatif",
    "responsive_design_desc": "Sortie HTML adaptée aux mobiles",
    "secure_processing_feature": "Traitement Sécurisé",
    "secure_processing_desc": "Tout le traitement se fait localement"
  },
  
  ja: {
    "_comment_docx_to_html": "DOCX から HTML コンバーター翻訳",
    
    "docx_to_html_title": "DOCX から HTML コンバーター - DropShare",
    "docx_to_html_page_title": "📄 DOCX から HTML コンバーター",
    "docx_to_html_convert_title": "DOCX を HTML に変換",
    "docx_to_html_description": "Microsoft Word 文書をウェブ対応の HTML 形式に変換",
    "back_to_document_tools": "← 文書ツールに戻る",
    "preserve_formatting": "書式を保持",
    "include_styles": "CSS スタイルを含める",
    "convert_images": "画像を変換",
    "responsive_design": "レスポンシブにする",
    "download_html": "HTML をダウンロード",
    "preserve_formatting_feature": "書式の保持",
    "preserve_formatting_desc": "元の文書のスタイルとレイアウトを維持",
    "image_support_feature": "画像サポート",
    "image_support_desc": "埋め込み画像をウェブ形式に変換",
    "responsive_design_feature": "レスポンシブデザイン",
    "responsive_design_desc": "モバイルフレンドリーな HTML 出力",
    "secure_processing_feature": "安全な処理",
    "secure_processing_desc": "すべての処理はローカルで行われます"
  },
  
  ko: {
    "_comment_docx_to_html": "DOCX에서 HTML 변환기 번역",
    
    "docx_to_html_title": "DOCX to HTML 변환기 - DropShare",
    "docx_to_html_page_title": "📄 DOCX to HTML 변환기",
    "docx_to_html_convert_title": "DOCX를 HTML로 변환",
    "docx_to_html_description": "Microsoft Word 문서를 웹 준비 HTML 형식으로 변환",
    "back_to_document_tools": "← 문서 도구로 돌아가기",
    "preserve_formatting": "서식 보존",
    "include_styles": "CSS 스타일 포함",
    "convert_images": "이미지 변환",
    "responsive_design": "반응형으로 만들기",
    "download_html": "HTML 다운로드",
    "preserve_formatting_feature": "서식 보존",
    "preserve_formatting_desc": "원본 문서의 스타일과 레이아웃 유지",
    "image_support_feature": "이미지 지원",
    "image_support_desc": "포함된 이미지를 웹 형식으로 변환",
    "responsive_design_feature": "반응형 디자인",
    "responsive_design_desc": "모바일 친화적인 HTML 출력",
    "secure_processing_feature": "보안 처리",
    "secure_processing_desc": "모든 처리는 로컬에서 수행됩니다"
  },
  
  pt: {
    "_comment_docx_to_html": "Traduções do conversor DOCX para HTML",
    
    "docx_to_html_title": "Conversor DOCX para HTML - DropShare",
    "docx_to_html_page_title": "📄 Conversor DOCX para HTML",
    "docx_to_html_convert_title": "Converter DOCX para HTML",
    "docx_to_html_description": "Converter documentos do Microsoft Word para formato HTML pronto para web",
    "back_to_document_tools": "← Voltar para Ferramentas de Documentos",
    "preserve_formatting": "Preservar formatação",
    "include_styles": "Incluir estilos CSS",
    "convert_images": "Converter imagens",
    "responsive_design": "Tornar responsivo",
    "download_html": "Baixar HTML",
    "preserve_formatting_feature": "Preservar Formatação",
    "preserve_formatting_desc": "Mantém os estilos e layout do documento original",
    "image_support_feature": "Suporte a Imagens",
    "image_support_desc": "Converte imagens incorporadas para formatos web",
    "responsive_design_feature": "Design Responsivo",
    "responsive_design_desc": "Saída HTML adaptável a dispositivos móveis",
    "secure_processing_feature": "Processamento Seguro",
    "secure_processing_desc": "Todo o processamento acontece localmente"
  },
  
  'zh-CN': {
    "_comment_docx_to_html": "DOCX 转 HTML 转换器翻译",
    
    "docx_to_html_title": "DOCX 转 HTML 转换器 - DropShare",
    "docx_to_html_page_title": "📄 DOCX 转 HTML 转换器",
    "docx_to_html_convert_title": "转换 DOCX 为 HTML",
    "docx_to_html_description": "将 Microsoft Word 文档转换为网页就绪的 HTML 格式",
    "back_to_document_tools": "← 返回文档工具",
    "preserve_formatting": "保留格式",
    "include_styles": "包含 CSS 样式",
    "convert_images": "转换图片",
    "responsive_design": "响应式设计",
    "download_html": "下载 HTML",
    "preserve_formatting_feature": "保留格式",
    "preserve_formatting_desc": "保持原始文档样式和布局",
    "image_support_feature": "图片支持",
    "image_support_desc": "将嵌入图片转换为网页格式",
    "responsive_design_feature": "响应式设计",
    "responsive_design_desc": "移动设备友好的 HTML 输出",
    "secure_processing_feature": "安全处理",
    "secure_processing_desc": "所有处理均在本地进行"
  },
  
  'zh-TW': {
    "_comment_docx_to_html": "DOCX 轉 HTML 轉換器翻譯",
    
    "docx_to_html_title": "DOCX 轉 HTML 轉換器 - DropShare",
    "docx_to_html_page_title": "📄 DOCX 轉 HTML 轉換器",
    "docx_to_html_convert_title": "轉換 DOCX 為 HTML",
    "docx_to_html_description": "將 Microsoft Word 文件轉換為網頁就緒的 HTML 格式",
    "back_to_document_tools": "← 返回文件工具",
    "preserve_formatting": "保留格式",
    "include_styles": "包含 CSS 樣式",
    "convert_images": "轉換圖片",
    "responsive_design": "響應式設計",
    "download_html": "下載 HTML",
    "preserve_formatting_feature": "保留格式",
    "preserve_formatting_desc": "保持原始文件樣式和佈局",
    "image_support_feature": "圖片支援",
    "image_support_desc": "將嵌入圖片轉換為網頁格式",
    "responsive_design_feature": "響應式設計",
    "responsive_design_desc": "行動裝置友善的 HTML 輸出",
    "secure_processing_feature": "安全處理",
    "secure_processing_desc": "所有處理均在本地進行"
  }
};

// 批量更新所有语言文件
Object.keys(docxToHtmlTranslations).forEach(lang => {
  try {
    const filePath = `public/locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 添加新的翻译键
    Object.assign(data, docxToHtmlTranslations[lang]);
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✅ Updated ${lang}.json with DOCX to HTML translations`);
    
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n🎉 DOCX to HTML translations added to all languages!');