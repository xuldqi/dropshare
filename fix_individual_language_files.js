const fs = require('fs');
const path = require('path');

// 新工具分类翻译 - 24个缺失的键
const toolCategoryTranslations = {
    'category_image_title': {
        'en': 'Image Tools',
        'zh': '图像工具',
        'zh-tw': '圖像工具',
        'fr': 'Outils d\'Image',
        'de': 'Bildwerkzeuge',
        'es': 'Herramientas de Imagen',
        'pt': 'Ferramentas de Imagem',
        'ru': 'Инструменты для Изображений',
        'ar': 'أدوات الصور',
        'ja': '画像ツール',
        'ko': '이미지 도구'
    },
    'category_image_description': {
        'en': 'Comprehensive image editing and conversion tools for all your photo processing needs',
        'zh': '全面的图像编辑和转换工具，满足您所有图片处理需求',
        'zh-tw': '全面的圖像編輯和轉換工具，滿足您所有圖片處理需求',
        'fr': 'Outils complets d\'édition et de conversion d\'images pour tous vos besoins de traitement photo',
        'de': 'Umfassende Bildbearbeitungs- und Konvertierungstools für alle Ihre Fotobearbeitungsanforderungen',
        'es': 'Herramientas completas de edición y conversión de imágenes para todas sus necesidades de procesamiento de fotos',
        'pt': 'Ferramentas abrangentes de edição e conversão de imagem para todas as suas necessidades de processamento de fotos',
        'ru': 'Комплексные инструменты редактирования и конвертации изображений для всех ваших потребностей в обработке фотографий',
        'ar': 'أدوات شاملة لتحرير وتحويل الصور لجميع احتياجات معالجة الصور الخاصة بك',
        'ja': 'すべての写真処理ニーズに対応する包括的な画像編集・変換ツール',
        'ko': '모든 사진 처리 요구사항을 위한 포괄적인 이미지 편집 및 변환 도구'
    },
    'category_audio_title': {
        'en': 'Audio Tools',
        'zh': '音频工具',
        'zh-tw': '音頻工具',
        'fr': 'Outils Audio',
        'de': 'Audio-Tools',
        'es': 'Herramientas de Audio',
        'pt': 'Ferramentas de Áudio',
        'ru': 'Аудио Инструменты',
        'ar': 'أدوات الصوت',
        'ja': 'オーディオツール',
        'ko': '오디오 도구'
    },
    'category_audio_description': {
        'en': 'Professional audio conversion and processing tools for musicians and content creators',
        'zh': '为音乐家和内容创作者提供专业的音频转换和处理工具',
        'zh-tw': '為音樂家和內容創作者提供專業的音頻轉換和處理工具',
        'fr': 'Outils professionnels de conversion et de traitement audio pour musiciens et créateurs de contenu',
        'de': 'Professionelle Audio-Konvertierungs- und Verarbeitungstools für Musiker und Content-Ersteller',
        'es': 'Herramientas profesionales de conversión y procesamiento de audio para músicos y creadores de contenido',
        'pt': 'Ferramentas profissionais de conversão e processamento de áudio para músicos e criadores de conteúdo',
        'ru': 'Профессиональные инструменты конвертации и обработки аудио для музыкантов и создателей контента',
        'ar': 'أدوات احترافية لتحويل ومعالجة الصوت للموسيقيين ومنشئي المحتوى',
        'ja': 'ミュージシャンやコンテンツクリエーター向けのプロフェッショナルなオーディオ変換・処理ツール',
        'ko': '음악가와 콘텐츠 제작자를 위한 전문적인 오디오 변환 및 처리 도구'
    },
    'category_document_title': {
        'en': 'Document Tools',
        'zh': '文档工具',
        'zh-tw': '文件工具',
        'fr': 'Outils de Document',
        'de': 'Dokumentenwerkzeuge',
        'es': 'Herramientas de Documento',
        'pt': 'Ferramentas de Documento',
        'ru': 'Инструменты для Документов',
        'ar': 'أدوات المستندات',
        'ja': 'ドキュメントツール',
        'ko': '문서 도구'
    },
    'category_document_description': {
        'en': 'Powerful document processing tools for PDFs, text files, and office documents',
        'zh': '强大的文档处理工具，支持PDF、文本文件和办公文档',
        'zh-tw': '強大的文件處理工具，支援PDF、文字檔案和辦公文件',
        'fr': 'Outils puissants de traitement de documents pour PDF, fichiers texte et documents bureautiques',
        'de': 'Leistungsstarke Dokumentenverarbeitungstools für PDFs, Textdateien und Office-Dokumente',
        'es': 'Potentes herramientas de procesamiento de documentos para PDFs, archivos de texto y documentos de oficina',
        'pt': 'Ferramentas poderosas de processamento de documentos para PDFs, arquivos de texto e documentos de escritório',
        'ru': 'Мощные инструменты обработки документов для PDF, текстовых файлов и офисных документов',
        'ar': 'أدوات قوية لمعالجة المستندات لملفات PDF والنصوص ومستندات المكتب',
        'ja': 'PDF、テキストファイル、オフィス文書用の強力なドキュメント処理ツール',
        'ko': 'PDF, 텍스트 파일 및 오피스 문서를 위한 강력한 문서 처리 도구'
    },
    'category_video_title': {
        'en': 'Video Tools',
        'zh': '视频工具',
        'zh-tw': '影片工具',
        'fr': 'Outils Vidéo',
        'de': 'Video-Tools',
        'es': 'Herramientas de Video',
        'pt': 'Ferramentas de Vídeo',
        'ru': 'Видео Инструменты',
        'ar': 'أدوات الفيديو',
        'ja': 'ビデオツール',
        'ko': '비디오 도구'
    },
    'category_video_description': {
        'en': 'Advanced video conversion and editing tools for content creators and professionals',
        'zh': '为内容创作者和专业人士提供先进的视频转换和编辑工具',
        'zh-tw': '為內容創作者和專業人士提供先進的影片轉換和編輯工具',
        'fr': 'Outils avancés de conversion et d\'édition vidéo pour créateurs de contenu et professionnels',
        'de': 'Erweiterte Video-Konvertierungs- und Bearbeitungstools für Content-Ersteller und Profis',
        'es': 'Herramientas avanzadas de conversión y edición de video para creadores de contenido y profesionales',
        'pt': 'Ferramentas avançadas de conversão e edição de vídeo para criadores de conteúdo e profissionais',
        'ru': 'Продвинутые инструменты конвертации и редактирования видео для создателей контента и профессионалов',
        'ar': 'أدوات متقدمة لتحويل وتحرير الفيديو لمنشئي المحتوى والمحترفين',
        'ja': 'コンテンツクリエーターやプロフェッショナル向けの高度なビデオ変換・編集ツール',
        'ko': '콘텐츠 제작자와 전문가를 위한 고급 비디오 변환 및 편집 도구'
    },
    'tool_format_converter': {
        'en': 'Format Converter',
        'zh': '格式转换器',
        'zh-tw': '格式轉換器',
        'fr': 'Convertisseur de Format',
        'de': 'Formatkonverter',
        'es': 'Convertidor de Formato',
        'pt': 'Conversor de Formato',
        'ru': 'Конвертер Форматов',
        'ar': 'محول التنسيق',
        'ja': 'フォーマット変換',
        'ko': '포맷 변환기'
    },
    'tool_image_cropper': {
        'en': 'Image Cropper',
        'zh': '图像裁剪器',
        'zh-tw': '圖像裁切器',
        'fr': 'Recadreur d\'Image',
        'de': 'Bildzuschnitt',
        'es': 'Recortador de Imagen',
        'pt': 'Cortador de Imagem',
        'ru': 'Обрезка Изображений',
        'ar': 'قاطع الصور',
        'ja': '画像クロッピング',
        'ko': '이미지 자르기'
    },
    'tool_background_remover': {
        'en': 'Background Remover',
        'zh': '背景移除器',
        'zh-tw': '背景移除器',
        'fr': 'Suppresseur d\'Arrière-plan',
        'de': 'Hintergrundentferner',
        'es': 'Removedor de Fondo',
        'pt': 'Removedor de Fundo',
        'ru': 'Удаление Фона',
        'ar': 'إزالة الخلفية',
        'ja': '背景除去',
        'ko': '배경 제거'
    },
    'tool_audio_formats': {
        'en': 'MP3, WAV, AAC, OGG, FLAC',
        'zh': 'MP3, WAV, AAC, OGG, FLAC',
        'zh-tw': 'MP3, WAV, AAC, OGG, FLAC',
        'fr': 'MP3, WAV, AAC, OGG, FLAC',
        'de': 'MP3, WAV, AAC, OGG, FLAC',
        'es': 'MP3, WAV, AAC, OGG, FLAC',
        'pt': 'MP3, WAV, AAC, OGG, FLAC',
        'ru': 'MP3, WAV, AAC, OGG, FLAC',
        'ar': 'MP3, WAV, AAC, OGG, FLAC',
        'ja': 'MP3, WAV, AAC, OGG, FLAC',
        'ko': 'MP3, WAV, AAC, OGG, FLAC'
    },
    'tool_high_quality': {
        'en': 'High Quality Output',
        'zh': '高质量输出',
        'zh-tw': '高品質輸出',
        'fr': 'Sortie de Haute Qualité',
        'de': 'Hochqualitative Ausgabe',
        'es': 'Salida de Alta Calidad',
        'pt': 'Saída de Alta Qualidade',
        'ru': 'Высококачественный Вывод',
        'ar': 'إخراج عالي الجودة',
        'ja': '高品質出力',
        'ko': '고품질 출력'
    },
    'tool_pdf_processor': {
        'en': 'PDF Processor',
        'zh': 'PDF处理器',
        'zh-tw': 'PDF處理器',
        'fr': 'Processeur PDF',
        'de': 'PDF-Prozessor',
        'es': 'Procesador PDF',
        'pt': 'Processador PDF',
        'ru': 'PDF Процессор',
        'ar': 'معالج PDF',
        'ja': 'PDFプロセッサー',
        'ko': 'PDF 프로세서'
    },
    'tool_text_extractor': {
        'en': 'Text Extractor',
        'zh': '文本提取器',
        'zh-tw': '文字擷取器',
        'fr': 'Extracteur de Texte',
        'de': 'Textextraktor',
        'es': 'Extractor de Texto',
        'pt': 'Extrator de Texto',
        'ru': 'Извлечение Текста',
        'ar': 'مستخرج النص',
        'ja': 'テキスト抽出',
        'ko': '텍스트 추출'
    },
    'tool_document_merger': {
        'en': 'Document Merger',
        'zh': '文档合并器',
        'zh-tw': '文件合併器',
        'fr': 'Fusionneur de Documents',
        'de': 'Dokumentzusammenführung',
        'es': 'Fusionador de Documentos',
        'pt': 'Fusão de Documentos',
        'ru': 'Объединение Документов',
        'ar': 'دمج المستندات',
        'ja': 'ドキュメント結合',
        'ko': '문서 병합'
    },
    'tool_video_converter': {
        'en': 'Video Converter',
        'zh': '视频转换器',
        'zh-tw': '影片轉換器',
        'fr': 'Convertisseur Vidéo',
        'de': 'Videokonverter',
        'es': 'Convertidor de Video',
        'pt': 'Conversor de Vídeo',
        'ru': 'Видео Конвертер',
        'ar': 'محول الفيديو',
        'ja': 'ビデオ変換',
        'ko': '비디오 변환기'
    },
    'tool_video_formats': {
        'en': 'MP4, AVI, MOV, WebM, MKV',
        'zh': 'MP4, AVI, MOV, WebM, MKV',
        'zh-tw': 'MP4, AVI, MOV, WebM, MKV',
        'fr': 'MP4, AVI, MOV, WebM, MKV',
        'de': 'MP4, AVI, MOV, WebM, MKV',
        'es': 'MP4, AVI, MOV, WebM, MKV',
        'pt': 'MP4, AVI, MOV, WebM, MKV',
        'ru': 'MP4, AVI, MOV, WebM, MKV',
        'ar': 'MP4, AVI, MOV, WebM, MKV',
        'ja': 'MP4, AVI, MOV, WebM, MKV',
        'ko': 'MP4, AVI, MOV, WebM, MKV'
    },
    'tool_professional_quality': {
        'en': 'Professional Quality',
        'zh': '专业品质',
        'zh-tw': '專業品質',
        'fr': 'Qualité Professionnelle',
        'de': 'Professionelle Qualität',
        'es': 'Calidad Profesional',
        'pt': 'Qualidade Profissional',
        'ru': 'Профессиональное Качество',
        'ar': 'جودة احترافية',
        'ja': 'プロフェッショナル品質',
        'ko': '전문가 품질'
    },
    'feature_free_title': {
        'en': '100% Free',
        'zh': '100% 免费',
        'zh-tw': '100% 免費',
        'fr': '100% Gratuit',
        'de': '100% Kostenlos',
        'es': '100% Gratis',
        'pt': '100% Gratuito',
        'ru': '100% Бесплатно',
        'ar': '100% مجاني',
        'ja': '100% 無料',
        'ko': '100% 무료'
    },
    'feature_free_text': {
        'en': 'All our tools are completely free to use with no hidden fees, subscriptions, or premium features. Get professional-grade results without any cost.',
        'zh': '我们所有工具完全免费使用，无隐藏费用、订阅或高级功能。免费获得专业级结果。',
        'zh-tw': '我們所有工具完全免费使用，無隱藏費用、訂閱或進階功能。免費獲得專業級結果。',
        'fr': 'Tous nos outils sont entièrement gratuits, sans frais cachés, abonnements ou fonctionnalités premium. Obtenez des résultats de qualité professionnelle sans aucun coût.',
        'de': 'Alle unsere Tools sind völlig kostenlos zu verwenden, ohne versteckte Gebühren, Abonnements oder Premium-Features. Erhalten Sie professionelle Ergebnisse ohne Kosten.',
        'es': 'Todas nuestras herramientas son completamente gratuitas, sin tarifas ocultas, suscripciones o funciones premium. Obtenga resultados de calidad profesional sin costo alguno.',
        'pt': 'Todas as nossas ferramentas são completamente gratuitas, sem taxas ocultas, assinaturas ou recursos premium. Obtenha resultados de qualidade profissional sem custo.',
        'ru': 'Все наши инструменты полностью бесплатны для использования без скрытых комиссий, подписок или премиум-функций. Получайте результаты профессионального качества без затрат.',
        'ar': 'جميع أدواتنا مجانية تماماً للاستخدام بدون رسوم خفية أو اشتراكات أو ميزات مدفوعة. احصل على نتائج بجودة احترافية بدون أي تكلفة.',
        'ja': 'すべてのツールは完全無料でご利用いただけます。隠れた料金、サブスクリプション、プレミアム機能はありません。コスト無しでプロ級の結果を取得できます。',
        'ko': '모든 도구는 숨겨진 요금, 구독 또는 프리미엄 기능 없이 완전 무료로 사용할 수 있습니다. 비용 없이 전문가급 결과를 얻으세요.'
    },
    'feature_fast_title': {
        'en': 'Fast & Easy',
        'zh': '快速便捷',
        'zh-tw': '快速便捷',
        'fr': 'Rapide et Facile',
        'de': 'Schnell & Einfach',
        'es': 'Rápido y Fácil',
        'pt': 'Rápido e Fácil',
        'ru': 'Быстро и Просто',
        'ar': 'سريع وسهل',
        'ja': '高速＆簡単',
        'ko': '빠르고 쉬움'
    },
    'feature_fast_text': {
        'en': 'Our tools are designed for speed and simplicity. Process your files quickly with just a few clicks, no technical expertise required.',
        'zh': '我们的工具专为速度和简便性而设计。只需几次点击即可快速处理文件，无需技术专长。',
        'zh-tw': '我們的工具專為速度和簡便性而設計。只需幾次點擊即可快速處理檔案，無需技術專長。',
        'fr': 'Nos outils sont conçus pour la rapidité et la simplicité. Traitez vos fichiers rapidement en quelques clics, aucune expertise technique requise.',
        'de': 'Unsere Tools sind auf Geschwindigkeit und Einfachheit ausgelegt. Verarbeiten Sie Ihre Dateien schnell mit nur wenigen Klicks, ohne technisches Fachwissen.',
        'es': 'Nuestras herramientas están diseñadas para la velocidad y simplicidad. Procese sus archivos rápidamente con solo unos clics, sin experiencia técnica requerida.',
        'pt': 'Nossas ferramentas são projetadas para velocidade e simplicidade. Processe seus arquivos rapidamente com apenas alguns cliques, sem necessidade de conhecimento técnico.',
        'ru': 'Наши инструменты разработаны для скорости и простоты. Обрабатывайте файлы быстро всего несколькими кликами, без необходимости в технической экспертизе.',
        'ar': 'أدواتنا مصممة للسرعة والبساطة. عالج ملفاتك بسرعة بنقرات قليلة، بدون الحاجة لخبرة تقنية.',
        'ja': 'ツールは速度と簡単さを重視して設計されています。数クリックで素早くファイルを処理でき、技術的専門知識は不要です。',
        'ko': '도구는 속도와 간편함을 위해 설계되었습니다. 몇 번의 클릭으로 파일을 빠르게 처리하고, 기술적 전문 지식이 필요하지 않습니다.'
    },
    'output_resolution': {
        'en': 'Output Resolution',
        'zh': '输出分辨率',
        'zh-tw': '輸出解析度',
        'fr': 'Résolution de Sortie',
        'de': 'Ausgabeauflösung',
        'es': 'Resolución de Salida',
        'pt': 'Resolução de Saída',
        'ru': 'Разрешение Вывода',
        'ar': 'دقة الإخراج',
        'ja': '出力解像度',
        'ko': '출력 해상도'
    }
};

const languageDir = './public/scripts/i18n/languages/';
const supportedLanguages = ['ar', 'de', 'es', 'fr', 'ja', 'ko', 'pt', 'ru', 'zh', 'zh-tw'];

console.log('开始更新独立语言文件...');

let totalAdded = 0;

supportedLanguages.forEach(langCode => {
    const filePath = path.join(languageDir, `${langCode}.js`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`警告: 文件不存在: ${filePath}`);
        return;
    }
    
    console.log(`处理语言: ${langCode}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let addedForLang = 0;
        
        // 检查每个工具分类键是否存在
        for (const [key, translations] of Object.entries(toolCategoryTranslations)) {
            const keyPattern = new RegExp(`"${key}"\\s*:`);
            
            if (!keyPattern.test(content)) {
                const translation = translations[langCode];
                if (translation) {
                    // 在文件末尾的 "}" 前添加新的翻译
                    const lastBraceIndex = content.lastIndexOf('}');
                    const beforeBrace = content.substring(0, lastBraceIndex).trim();
                    const afterBrace = content.substring(lastBraceIndex);
                    
                    // 确保在最后一个键后添加逗号（如果还没有的话）
                    const needsComma = !beforeBrace.endsWith(',');
                    const comma = needsComma ? ',' : '';
                    const escapedTranslation = translation.replace(/"/g, '\\"');
                    
                    content = beforeBrace + comma + 
                             `\n    "${key}": "${escapedTranslation}"` + 
                             '\n' + afterBrace;
                    
                    addedForLang++;
                    totalAdded++;
                }
            }
        }
        
        if (addedForLang > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  添加了 ${addedForLang} 个翻译`);
        } else {
            console.log(`  无需添加翻译（所有键已存在）`);
        }
        
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error.message);
    }
});

console.log(`\n更新完成！总共添加了 ${totalAdded} 个翻译`);