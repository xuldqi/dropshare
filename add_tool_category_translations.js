const fs = require('fs');

// 新工具分类翻译 - 24个缺失的键
const toolCategoryTranslations = {
    en: {
        'category_image_title': 'Image Tools',
        'category_image_description': 'Comprehensive image editing and conversion tools for all your photo processing needs',
        'category_audio_title': 'Audio Tools', 
        'category_audio_description': 'Professional audio conversion and processing tools for musicians and content creators',
        'category_document_title': 'Document Tools',
        'category_document_description': 'Powerful document processing tools for PDFs, text files, and office documents',
        'category_video_title': 'Video Tools',
        'category_video_description': 'Advanced video conversion and editing tools for content creators and professionals',
        'tool_format_converter': 'Format Converter',
        'tool_image_cropper': 'Image Cropper',
        'tool_background_remover': 'Background Remover',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'High Quality Output',
        'tool_pdf_processor': 'PDF Processor',
        'tool_text_extractor': 'Text Extractor',
        'tool_document_merger': 'Document Merger',
        'tool_video_converter': 'Video Converter',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Professional Quality',
        'feature_free_title': '100% Free',
        'feature_free_text': 'All our tools are completely free to use with no hidden fees, subscriptions, or premium features. Get professional-grade results without any cost.',
        'feature_fast_title': 'Fast & Easy',
        'feature_fast_text': 'Our tools are designed for speed and simplicity. Process your files quickly with just a few clicks, no technical expertise required.',
        'output_resolution': 'Output Resolution'
    },
    zh: {
        'category_image_title': '图像工具',
        'category_image_description': '全面的图像编辑和转换工具，满足您所有图片处理需求',
        'category_audio_title': '音频工具',
        'category_audio_description': '为音乐家和内容创作者提供专业的音频转换和处理工具',
        'category_document_title': '文档工具',
        'category_document_description': '强大的文档处理工具，支持PDF、文本文件和办公文档',
        'category_video_title': '视频工具',
        'category_video_description': '为内容创作者和专业人士提供先进的视频转换和编辑工具',
        'tool_format_converter': '格式转换器',
        'tool_image_cropper': '图像裁剪器',
        'tool_background_remover': '背景移除器',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': '高质量输出',
        'tool_pdf_processor': 'PDF处理器',
        'tool_text_extractor': '文本提取器',
        'tool_document_merger': '文档合并器',
        'tool_video_converter': '视频转换器',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': '专业品质',
        'feature_free_title': '100% 免费',
        'feature_free_text': '我们所有工具完全免费使用，无隐藏费用、订阅或高级功能。免费获得专业级结果。',
        'feature_fast_title': '快速便捷',
        'feature_fast_text': '我们的工具专为速度和简便性而设计。只需几次点击即可快速处理文件，无需技术专长。',
        'output_resolution': '输出分辨率'
    },
    'zh-tw': {
        'category_image_title': '圖像工具',
        'category_image_description': '全面的圖像編輯和轉換工具，滿足您所有圖片處理需求',
        'category_audio_title': '音頻工具',
        'category_audio_description': '為音樂家和內容創作者提供專業的音頻轉換和處理工具',
        'category_document_title': '文件工具',
        'category_document_description': '強大的文件處理工具，支援PDF、文字檔案和辦公文件',
        'category_video_title': '影片工具',
        'category_video_description': '為內容創作者和專業人士提供先進的影片轉換和編輯工具',
        'tool_format_converter': '格式轉換器',
        'tool_image_cropper': '圖像裁切器',
        'tool_background_remover': '背景移除器',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': '高品質輸出',
        'tool_pdf_processor': 'PDF處理器',
        'tool_text_extractor': '文字擷取器',
        'tool_document_merger': '文件合併器',
        'tool_video_converter': '影片轉換器',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': '專業品質',
        'feature_free_title': '100% 免費',
        'feature_free_text': '我們所有工具完全免費使用，無隱藏費用、訂閱或進階功能。免費獲得專業級結果。',
        'feature_fast_title': '快速便捷',
        'feature_fast_text': '我們的工具專為速度和簡便性而設計。只需幾次點擊即可快速處理檔案，無需技術專長。',
        'output_resolution': '輸出解析度'
    },
    fr: {
        'category_image_title': 'Outils d\'Image',
        'category_image_description': 'Outils complets d\'édition et de conversion d\'images pour tous vos besoins de traitement photo',
        'category_audio_title': 'Outils Audio',
        'category_audio_description': 'Outils professionnels de conversion et de traitement audio pour musiciens et créateurs de contenu',
        'category_document_title': 'Outils de Document',
        'category_document_description': 'Outils puissants de traitement de documents pour PDF, fichiers texte et documents bureautiques',
        'category_video_title': 'Outils Vidéo',
        'category_video_description': 'Outils avancés de conversion et d\'édition vidéo pour créateurs de contenu et professionnels',
        'tool_format_converter': 'Convertisseur de Format',
        'tool_image_cropper': 'Recadreur d\'Image',
        'tool_background_remover': 'Suppresseur d\'Arrière-plan',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'Sortie de Haute Qualité',
        'tool_pdf_processor': 'Processeur PDF',
        'tool_text_extractor': 'Extracteur de Texte',
        'tool_document_merger': 'Fusionneur de Documents',
        'tool_video_converter': 'Convertisseur Vidéo',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Qualité Professionnelle',
        'feature_free_title': '100% Gratuit',
        'feature_free_text': 'Tous nos outils sont entièrement gratuits, sans frais cachés, abonnements ou fonctionnalités premium. Obtenez des résultats de qualité professionnelle sans aucun coût.',
        'feature_fast_title': 'Rapide et Facile',
        'feature_fast_text': 'Nos outils sont conçus pour la rapidité et la simplicité. Traitez vos fichiers rapidement en quelques clics, aucune expertise technique requise.',
        'output_resolution': 'Résolution de Sortie'
    },
    de: {
        'category_image_title': 'Bildwerkzeuge',
        'category_image_description': 'Umfassende Bildbearbeitungs- und Konvertierungstools für alle Ihre Fotobearbeitungsanforderungen',
        'category_audio_title': 'Audio-Tools',
        'category_audio_description': 'Professionelle Audio-Konvertierungs- und Verarbeitungstools für Musiker und Content-Ersteller',
        'category_document_title': 'Dokumentenwerkzeuge',
        'category_document_description': 'Leistungsstarke Dokumentenverarbeitungstools für PDFs, Textdateien und Office-Dokumente',
        'category_video_title': 'Video-Tools',
        'category_video_description': 'Erweiterte Video-Konvertierungs- und Bearbeitungstools für Content-Ersteller und Profis',
        'tool_format_converter': 'Formatkonverter',
        'tool_image_cropper': 'Bildzuschnitt',
        'tool_background_remover': 'Hintergrundentferner',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'Hochqualitative Ausgabe',
        'tool_pdf_processor': 'PDF-Prozessor',
        'tool_text_extractor': 'Textextraktor',
        'tool_document_merger': 'Dokumentzusammenführung',
        'tool_video_converter': 'Videokonverter',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Professionelle Qualität',
        'feature_free_title': '100% Kostenlos',
        'feature_free_text': 'Alle unsere Tools sind völlig kostenlos zu verwenden, ohne versteckte Gebühren, Abonnements oder Premium-Features. Erhalten Sie professionelle Ergebnisse ohne Kosten.',
        'feature_fast_title': 'Schnell & Einfach',
        'feature_fast_text': 'Unsere Tools sind auf Geschwindigkeit und Einfachheit ausgelegt. Verarbeiten Sie Ihre Dateien schnell mit nur wenigen Klicks, ohne technisches Fachwissen.',
        'output_resolution': 'Ausgabeauflösung'
    },
    es: {
        'category_image_title': 'Herramientas de Imagen',
        'category_image_description': 'Herramientas completas de edición y conversión de imágenes para todas sus necesidades de procesamiento de fotos',
        'category_audio_title': 'Herramientas de Audio',
        'category_audio_description': 'Herramientas profesionales de conversión y procesamiento de audio para músicos y creadores de contenido',
        'category_document_title': 'Herramientas de Documento',
        'category_document_description': 'Potentes herramientas de procesamiento de documentos para PDFs, archivos de texto y documentos de oficina',
        'category_video_title': 'Herramientas de Video',
        'category_video_description': 'Herramientas avanzadas de conversión y edición de video para creadores de contenido y profesionales',
        'tool_format_converter': 'Convertidor de Formato',
        'tool_image_cropper': 'Recortador de Imagen',
        'tool_background_remover': 'Removedor de Fondo',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'Salida de Alta Calidad',
        'tool_pdf_processor': 'Procesador PDF',
        'tool_text_extractor': 'Extractor de Texto',
        'tool_document_merger': 'Fusionador de Documentos',
        'tool_video_converter': 'Convertidor de Video',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Calidad Profesional',
        'feature_free_title': '100% Gratis',
        'feature_free_text': 'Todas nuestras herramientas son completamente gratuitas, sin tarifas ocultas, suscripciones o funciones premium. Obtenga resultados de calidad profesional sin costo alguno.',
        'feature_fast_title': 'Rápido y Fácil',
        'feature_fast_text': 'Nuestras herramientas están diseñadas para la velocidad y simplicidad. Procese sus archivos rápidamente con solo unos clics, sin experiencia técnica requerida.',
        'output_resolution': 'Resolución de Salida'
    },
    pt: {
        'category_image_title': 'Ferramentas de Imagem',
        'category_image_description': 'Ferramentas abrangentes de edição e conversão de imagem para todas as suas necessidades de processamento de fotos',
        'category_audio_title': 'Ferramentas de Áudio',
        'category_audio_description': 'Ferramentas profissionais de conversão e processamento de áudio para músicos e criadores de conteúdo',
        'category_document_title': 'Ferramentas de Documento',
        'category_document_description': 'Ferramentas poderosas de processamento de documentos para PDFs, arquivos de texto e documentos de escritório',
        'category_video_title': 'Ferramentas de Vídeo',
        'category_video_description': 'Ferramentas avançadas de conversão e edição de vídeo para criadores de conteúdo e profissionais',
        'tool_format_converter': 'Conversor de Formato',
        'tool_image_cropper': 'Cortador de Imagem',
        'tool_background_remover': 'Removedor de Fundo',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'Saída de Alta Qualidade',
        'tool_pdf_processor': 'Processador PDF',
        'tool_text_extractor': 'Extrator de Texto',
        'tool_document_merger': 'Fusão de Documentos',
        'tool_video_converter': 'Conversor de Vídeo',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Qualidade Profissional',
        'feature_free_title': '100% Gratuito',
        'feature_free_text': 'Todas as nossas ferramentas são completamente gratuitas, sem taxas ocultas, assinaturas ou recursos premium. Obtenha resultados de qualidade profissional sem custo.',
        'feature_fast_title': 'Rápido e Fácil',
        'feature_fast_text': 'Nossas ferramentas são projetadas para velocidade e simplicidade. Processe seus arquivos rapidamente com apenas alguns cliques, sem necessidade de conhecimento técnico.',
        'output_resolution': 'Resolução de Saída'
    },
    ru: {
        'category_image_title': 'Инструменты для Изображений',
        'category_image_description': 'Комплексные инструменты редактирования и конвертации изображений для всех ваших потребностей в обработке фотографий',
        'category_audio_title': 'Аудио Инструменты',
        'category_audio_description': 'Профессиональные инструменты конвертации и обработки аудио для музыкантов и создателей контента',
        'category_document_title': 'Инструменты для Документов',
        'category_document_description': 'Мощные инструменты обработки документов для PDF, текстовых файлов и офисных документов',
        'category_video_title': 'Видео Инструменты',
        'category_video_description': 'Продвинутые инструменты конвертации и редактирования видео для создателей контента и профессионалов',
        'tool_format_converter': 'Конвертер Форматов',
        'tool_image_cropper': 'Обрезка Изображений',
        'tool_background_remover': 'Удаление Фона',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'Высококачественный Вывод',
        'tool_pdf_processor': 'PDF Процессор',
        'tool_text_extractor': 'Извлечение Текста',
        'tool_document_merger': 'Объединение Документов',
        'tool_video_converter': 'Видео Конвертер',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'Профессиональное Качество',
        'feature_free_title': '100% Бесплатно',
        'feature_free_text': 'Все наши инструменты полностью бесплатны для использования без скрытых комиссий, подписок или премиум-функций. Получайте результаты профессионального качества без затрат.',
        'feature_fast_title': 'Быстро и Просто',
        'feature_fast_text': 'Наши инструменты разработаны для скорости и простоты. Обрабатывайте файлы быстро всего несколькими кликами, без необходимости в технической экспертизе.',
        'output_resolution': 'Разрешение Вывода'
    },
    ar: {
        'category_image_title': 'أدوات الصور',
        'category_image_description': 'أدوات شاملة لتحرير وتحويل الصور لجميع احتياجات معالجة الصور الخاصة بك',
        'category_audio_title': 'أدوات الصوت',
        'category_audio_description': 'أدوات احترافية لتحويل ومعالجة الصوت للموسيقيين ومنشئي المحتوى',
        'category_document_title': 'أدوات المستندات',
        'category_document_description': 'أدوات قوية لمعالجة المستندات لملفات PDF والنصوص ومستندات المكتب',
        'category_video_title': 'أدوات الفيديو',
        'category_video_description': 'أدوات متقدمة لتحويل وتحرير الفيديو لمنشئي المحتوى والمحترفين',
        'tool_format_converter': 'محول التنسيق',
        'tool_image_cropper': 'قاطع الصور',
        'tool_background_remover': 'إزالة الخلفية',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': 'إخراج عالي الجودة',
        'tool_pdf_processor': 'معالج PDF',
        'tool_text_extractor': 'مستخرج النص',
        'tool_document_merger': 'دمج المستندات',
        'tool_video_converter': 'محول الفيديو',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'جودة احترافية',
        'feature_free_title': '100% مجاني',
        'feature_free_text': 'جميع أدواتنا مجانية تماماً للاستخدام بدون رسوم خفية أو اشتراكات أو ميزات مدفوعة. احصل على نتائج بجودة احترافية بدون أي تكلفة.',
        'feature_fast_title': 'سريع وسهل',
        'feature_fast_text': 'أدواتنا مصممة للسرعة والبساطة. عالج ملفاتك بسرعة بنقرات قليلة، بدون الحاجة لخبرة تقنية.',
        'output_resolution': 'دقة الإخراج'
    },
    ja: {
        'category_image_title': '画像ツール',
        'category_image_description': 'すべての写真処理ニーズに対応する包括的な画像編集・変換ツール',
        'category_audio_title': 'オーディオツール',
        'category_audio_description': 'ミュージシャンやコンテンツクリエーター向けのプロフェッショナルなオーディオ変換・処理ツール',
        'category_document_title': 'ドキュメントツール',
        'category_document_description': 'PDF、テキストファイル、オフィス文書用の強力なドキュメント処理ツール',
        'category_video_title': 'ビデオツール',
        'category_video_description': 'コンテンツクリエーターやプロフェッショナル向けの高度なビデオ変換・編集ツール',
        'tool_format_converter': 'フォーマット変換',
        'tool_image_cropper': '画像クロッピング',
        'tool_background_remover': '背景除去',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': '高品質出力',
        'tool_pdf_processor': 'PDFプロセッサー',
        'tool_text_extractor': 'テキスト抽出',
        'tool_document_merger': 'ドキュメント結合',
        'tool_video_converter': 'ビデオ変換',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': 'プロフェッショナル品質',
        'feature_free_title': '100% 無料',
        'feature_free_text': 'すべてのツールは完全無料でご利用いただけます。隠れた料金、サブスクリプション、プレミアム機能はありません。コスト無しでプロ級の結果を取得できます。',
        'feature_fast_title': '高速＆簡単',
        'feature_fast_text': 'ツールは速度と簡単さを重視して設計されています。数クリックで素早くファイルを処理でき、技術的専門知識は不要です。',
        'output_resolution': '出力解像度'
    },
    ko: {
        'category_image_title': '이미지 도구',
        'category_image_description': '모든 사진 처리 요구사항을 위한 포괄적인 이미지 편집 및 변환 도구',
        'category_audio_title': '오디오 도구',
        'category_audio_description': '음악가와 콘텐츠 제작자를 위한 전문적인 오디오 변환 및 처리 도구',
        'category_document_title': '문서 도구',
        'category_document_description': 'PDF, 텍스트 파일 및 오피스 문서를 위한 강력한 문서 처리 도구',
        'category_video_title': '비디오 도구',
        'category_video_description': '콘텐츠 제작자와 전문가를 위한 고급 비디오 변환 및 편집 도구',
        'tool_format_converter': '포맷 변환기',
        'tool_image_cropper': '이미지 자르기',
        'tool_background_remover': '배경 제거',
        'tool_audio_formats': 'MP3, WAV, AAC, OGG, FLAC',
        'tool_high_quality': '고품질 출력',
        'tool_pdf_processor': 'PDF 프로세서',
        'tool_text_extractor': '텍스트 추출',
        'tool_document_merger': '문서 병합',
        'tool_video_converter': '비디오 변환기',
        'tool_video_formats': 'MP4, AVI, MOV, WebM, MKV',
        'tool_professional_quality': '전문가 품질',
        'feature_free_title': '100% 무료',
        'feature_free_text': '모든 도구는 숨겨진 요금, 구독 또는 프리미엄 기능 없이 완전 무료로 사용할 수 있습니다. 비용 없이 전문가급 결과를 얻으세요.',
        'feature_fast_title': '빠르고 쉬움',
        'feature_fast_text': '도구는 속도와 간편함을 위해 설계되었습니다. 몇 번의 클릭으로 파일을 빠르게 처리하고, 기술적 전문 지식이 필요하지 않습니다.',
        'output_resolution': '출력 해상도'
    }
};

// 读取languages.js文件
const languagesPath = './public/scripts/i18n/languages.js';
const content = fs.readFileSync(languagesPath, 'utf8');

// 提取LANGUAGES对象
const languagesMatch = content.match(/const LANGUAGES = (\{[\s\S]*?\});/);
if (!languagesMatch) {
    console.error('无法找到LANGUAGES对象');
    process.exit(1);
}

let LANGUAGES;
try {
    eval(`LANGUAGES = ${languagesMatch[1]}`);
} catch (error) {
    console.error('解析LANGUAGES对象失败:', error.message);
    process.exit(1);
}

console.log('开始添加工具分类翻译...');

// 为每种语言添加缺失的工具分类翻译
let totalAdded = 0;
const languagesToUpdate = ['fr', 'de', 'es', 'pt', 'ru', 'ar', 'ja', 'ko'];

languagesToUpdate.forEach(langCode => {
    if (LANGUAGES[langCode] && toolCategoryTranslations[langCode]) {
        let addedForLang = 0;
        const translations = toolCategoryTranslations[langCode];
        
        for (const [key, value] of Object.entries(translations)) {
            if (!LANGUAGES[langCode].translations[key]) {
                LANGUAGES[langCode].translations[key] = value;
                addedForLang++;
                totalAdded++;
            }
        }
        
        console.log(`${langCode}: 添加了 ${addedForLang} 个翻译`);
    }
});

// 也更新中文的翻译
if (LANGUAGES.zh && toolCategoryTranslations.zh) {
    let addedForZh = 0;
    for (const [key, value] of Object.entries(toolCategoryTranslations.zh)) {
        if (!LANGUAGES.zh.translations[key]) {
            LANGUAGES.zh.translations[key] = value;
            addedForZh++;
            totalAdded++;
        }
    }
    console.log(`zh: 添加了 ${addedForZh} 个翻译`);
}

if (LANGUAGES['zh-tw'] && toolCategoryTranslations['zh-tw']) {
    let addedForZhTw = 0;
    for (const [key, value] of Object.entries(toolCategoryTranslations['zh-tw'])) {
        if (!LANGUAGES['zh-tw'].translations[key]) {
            LANGUAGES['zh-tw'].translations[key] = value;
            addedForZhTw++;
            totalAdded++;
        }
    }
    console.log(`zh-tw: 添加了 ${addedForZhTw} 个翻译`);
}

console.log(`总共添加了 ${totalAdded} 个工具分类翻译`);

// 重新构建文件内容
const beforeLanguages = content.substring(0, content.indexOf('const LANGUAGES = {'));
const afterLanguages = content.substring(content.indexOf('// Get user language from browser'));

let newContent = beforeLanguages + 'const LANGUAGES = {\n';

// 写入所有语言
const langCodes = Object.keys(LANGUAGES);
langCodes.forEach((langCode, index) => {
    const lang = LANGUAGES[langCode];
    newContent += `    '${langCode}': {\n`;
    newContent += `        code: '${lang.code}',\n`;
    newContent += `        name: '${lang.name}',\n`;
    newContent += `        rtl: ${lang.rtl},\n`;
    newContent += `        translations: {\n`;
    
    const keys = Object.keys(lang.translations);
    keys.forEach((key, keyIndex) => {
        const value = lang.translations[key].replace(/'/g, "\\'").replace(/\n/g, '\\n');
        newContent += `            '${key}': '${value}'`;
        if (keyIndex < keys.length - 1) {
            newContent += ',\n';
        } else {
            newContent += '\n';
        }
    });
    
    newContent += '        }\n';
    newContent += '    }';
    if (index < langCodes.length - 1) {
        newContent += ',\n';
    } else {
        newContent += '\n';
    }
});

newContent += '};\n\n' + afterLanguages;

// 写入文件
const outputPath = './public/scripts/i18n/languages_with_tool_categories.js';
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n工具分类翻译添加完成！新文件已保存到: ${outputPath}`);