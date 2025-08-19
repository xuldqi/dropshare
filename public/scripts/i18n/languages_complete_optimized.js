// Complete Multi-language Support for DropShare (Optimized)
// Traditional JavaScript IIFE for browser compatibility
(function(window) {
    'use strict';
    
    var LANGUAGES = {
        'en': {
            code: 'en',
            name: 'English',
            rtl: false,
            translations: {
                'you_are_known_as': 'You are known as',
                'nav_transfer': 'Transfer',
                'nav_rooms': 'Multi-user Rooms',
                'nav_images': 'Images',
                'nav_audio': 'Audio',
                'nav_video': 'Video',
                'nav_files': 'Files',
                'nav_about': 'About',
                'nav_faq': 'FAQ',
                'nav_blog': 'Blog',
                'nav_privacy': 'Privacy',
                'nav_terms': 'Terms',
                'hero_title': 'Fast Local File Sharing Across Devices on Your Network',
                'hero_subtitle': 'Instantly share files with nearby devices. No setup required, completely peer-to-peer.',
                'btn_start_sharing': 'Start Sharing Files',
                'btn_multiuser_rooms': 'Multi-user Rooms',
                'btn_use_tool': 'Use Tool',
                'btn_view_tools': 'View Tools →',
                'section_choose_category': 'Choose Your Tool Category',
                'section_choose_description': 'Select from our comprehensive collection of tools organized by category',
                'category_image_title': 'Image Tools',
                'category_audio_title': 'Audio Tools',
                'category_document_title': 'Document Tools',
                'category_video_title': 'Video Tools',
                'popular_tools_title': 'Most Popular Tools',
                'popular_tools_description': 'Join thousands of users who trust our tools',
                'feature_free_title': '100% Free',
                'feature_secure_title': 'Secure & Private',
                'feature_fast_title': 'Fast & Easy'
            }
        },
        'zh': {
            code: 'zh',
            name: '中文',
            rtl: false,
            translations: {
                'you_are_known_as': '您的名称是',
                'nav_transfer': '传送',
                'nav_rooms': '多人房间',
                'nav_images': '图片',
                'nav_audio': '音频',
                'nav_video': '视频',
                'nav_files': '文件',
                'nav_about': '关于',
                'nav_faq': '常见问题',
                'nav_blog': '博客',
                'nav_privacy': '隐私',
                'nav_terms': '条款',
                'hero_title': '快速本地文件共享，连接您网络中的所有设备',
                'hero_subtitle': '与附近设备即时分享文件。无需设置，完全点对点传输。',
                'btn_start_sharing': '开始文件分享',
                'btn_multiuser_rooms': '多人房间',
                'btn_use_tool': '使用工具',
                'btn_view_tools': '查看工具 →',
                'section_choose_category': '选择您的工具类别',
                'section_choose_description': '从我们按类别组织的综合工具集合中选择',
                'category_image_title': '图像工具',
                'category_audio_title': '音频工具',
                'category_document_title': '文档工具',
                'category_video_title': '视频工具',
                'popular_tools_title': '最受欢迎的工具',
                'popular_tools_description': '加入数千名信任我们工具的用户',
                'feature_free_title': '100% 免费',
                'feature_secure_title': '安全私密',
                'feature_fast_title': '快速便捷'
            }
        },
        'zh-tw': {
            code: 'zh-tw',
            name: '繁體中文',
            rtl: false,
            translations: {
                'you_are_known_as': '您的名稱是',
                'nav_transfer': '傳送',
                'nav_rooms': '多人房間',
                'nav_images': '圖片',
                'nav_audio': '音頻',
                'nav_video': '視頻',
                'nav_files': '文件',
                'nav_about': '關於',
                'nav_faq': '常見問題',
                'nav_blog': '部落格',
                'nav_privacy': '隱私',
                'nav_terms': '條款',
                'hero_title': '快速本地文件共享，連接您網路中的所有裝置',
                'hero_subtitle': '與附近裝置即時分享文件。無需設置，完全點對點傳輸。',
                'btn_start_sharing': '開始文件分享',
                'btn_multiuser_rooms': '多人房間',
                'btn_use_tool': '使用工具',
                'btn_view_tools': '查看工具 →',
                'section_choose_category': '選擇您的工具類別',
                'section_choose_description': '從我們按類別組織的綜合工具集合中選擇',
                'category_image_title': '圖像工具',
                'category_audio_title': '音頻工具',
                'category_document_title': '文件工具',
                'category_video_title': '視頻工具',
                'popular_tools_title': '最受歡迎的工具',
                'popular_tools_description': '加入數千名信任我們工具的使用者',
                'feature_free_title': '100% 免費',
                'feature_secure_title': '安全私密',
                'feature_fast_title': '快速便捷'
            }
        },
        'fr': {
            code: 'fr',
            name: 'Français',
            rtl: false,
            translations: {
                'you_are_known_as': 'Vous êtes connu sous le nom de',
                'nav_transfer': 'Transfert',
                'nav_rooms': 'Salles Multi-utilisateurs',
                'nav_images': 'Images',
                'nav_audio': 'Audio',
                'nav_video': 'Vidéo',
                'nav_files': 'Fichiers',
                'nav_about': 'À propos',
                'nav_faq': 'FAQ',
                'nav_blog': 'Blog',
                'nav_privacy': 'Confidentialité',
                'nav_terms': 'Conditions',
                'hero_title': 'Partage de Fichiers Local Rapide Entre Appareils sur Votre Réseau',
                'hero_subtitle': 'Partagez instantanément des fichiers avec des appareils à proximité. Aucune configuration requise, entièrement peer-to-peer.',
                'btn_start_sharing': 'Commencer le Partage de Fichiers',
                'btn_multiuser_rooms': 'Salles Multi-utilisateurs',
                'btn_use_tool': 'Utiliser l\'Outil',
                'btn_view_tools': 'Voir les Outils →',
                'section_choose_category': 'Choisissez Votre Catégorie d\'Outils',
                'section_choose_description': 'Sélectionnez parmi notre collection complète d\'outils organisés par catégorie',
                'category_image_title': 'Outils d\'Image',
                'category_image_description': 'Éditer, convertir et optimiser les images',
                'category_audio_title': 'Outils Audio',
                'category_audio_description': 'Convertir l\'audio entre différents formats',
                'category_document_title': 'Outils de Document',
                'category_document_description': 'Convertir, fusionner, diviser et extraire du texte',
                'category_video_title': 'Outils Vidéo',
                'category_video_description': 'Convertir les vidéos entre différents formats',
                'tool_format_converter': 'Convertisseur de Format',
                'tool_image_cropper': 'Recadreur d\'Image',
                'tool_background_remover': 'Suppresseur d\'Arrière-plan',
                'popular_tools_title': 'Outils les Plus Populaires',
                'popular_tools_description': 'Rejoignez des milliers d\'utilisateurs qui font confiance à nos outils',
                'feature_free_title': '100% Gratuit',
                'feature_free_text': 'Tous les outils sont entièrement gratuits sans frais cachés ni abonnements requis.',
                'feature_secure_title': 'Sécurisé et Privé',
                'feature_secure_text': 'Vos fichiers sont traités localement et en toute sécurité. Aucune donnée n\'est stockée sur nos serveurs.',
                'feature_fast_title': 'Rapide et Facile',
                'feature_fast_text': 'Aucune inscription requise. Téléchargez simplement votre fichier et obtenez des résultats en quelques secondes.'
            }
        },
        'de': {
            code: 'de',
            name: 'Deutsch',
            rtl: false,
            translations: {
                'you_are_known_as': 'Du bist bekannt als',
                'nav_transfer': 'Übertragung',
                'nav_rooms': 'Mehrbenutzerzimmer',
                'nav_images': 'Bilder',
                'nav_audio': 'Audio',
                'nav_video': 'Video',
                'nav_files': 'Dateien',
                'nav_about': 'Über',
                'nav_faq': 'FAQ',
                'nav_blog': 'Blog',
                'nav_privacy': 'Datenschutz',
                'nav_terms': 'Bedingungen',
                'hero_title': 'Schnelle Lokale Dateifreigabe Zwischen Geräten in Ihrem Netzwerk',
                'hero_subtitle': 'Teilen Sie Dateien sofort mit nahegelegenen Geräten. Keine Einrichtung erforderlich, vollständig Peer-to-Peer.',
                'btn_start_sharing': 'Dateifreigabe Starten',
                'btn_multiuser_rooms': 'Mehrbenutzerzimmer',
                'btn_use_tool': 'Tool Verwenden',
                'btn_view_tools': 'Tools Anzeigen →',
                'section_choose_category': 'Wählen Sie Ihre Tool-Kategorie',
                'section_choose_description': 'Wählen Sie aus unserer umfassenden Sammlung von nach Kategorien organisierten Tools',
                'category_image_title': 'Bild-Tools',
                'category_image_description': 'Bilder bearbeiten, konvertieren und optimieren',
                'category_audio_title': 'Audio-Tools',
                'category_audio_description': 'Audio zwischen verschiedenen Formaten konvertieren',
                'category_document_title': 'Dokument-Tools',
                'category_document_description': 'Konvertieren, zusammenführen, aufteilen und Text extrahieren',
                'category_video_title': 'Video-Tools',
                'category_video_description': 'Videos zwischen verschiedenen Formaten konvertieren',
                'tool_format_converter': 'Format-Konverter',
                'tool_image_cropper': 'Bildschneider',
                'tool_background_remover': 'Hintergrundentferner',
                'popular_tools_title': 'Die Beliebtesten Tools',
                'popular_tools_description': 'Schließen Sie sich Tausenden von Benutzern an, die unseren Tools vertrauen',
                'feature_free_title': '100% Kostenlos',
                'feature_free_text': 'Alle Tools sind völlig kostenlos ohne versteckte Gebühren oder erforderliche Abonnements.',
                'feature_secure_title': 'Sicher & Privat',
                'feature_secure_text': 'Ihre Dateien werden lokal und sicher verarbeitet. Keine Daten werden auf unseren Servern gespeichert.',
                'feature_fast_title': 'Schnell & Einfach',
                'feature_fast_text': 'Keine Registrierung erforderlich. Laden Sie einfach Ihre Datei hoch und erhalten Sie in Sekunden Ergebnisse.'
            }
        },
        'es': {
            code: 'es',
            name: 'Español',
            rtl: false,
            translations: {
                'you_are_known_as': 'Eres conocido como',
                'nav_transfer': 'Transferencia',
                'nav_rooms': 'Salas Multiusuario',
                'nav_images': 'Imágenes',
                'nav_audio': 'Audio',
                'nav_video': 'Vídeo',
                'nav_files': 'Archivos',
                'nav_about': 'Acerca de',
                'nav_faq': 'FAQ',
                'nav_blog': 'Blog',
                'nav_privacy': 'Privacidad',
                'nav_terms': 'Términos',
                'hero_title': 'Compartir Archivos Local Rápido Entre Dispositivos en Su Red',
                'hero_subtitle': 'Comparta archivos instantáneamente con dispositivos cercanos. No se requiere configuración, completamente punto a punto.',
                'btn_start_sharing': 'Comenzar a Compartir Archivos',
                'btn_multiuser_rooms': 'Salas Multiusuario',
                'btn_use_tool': 'Usar Herramienta',
                'btn_view_tools': 'Ver Herramientas →',
                'section_choose_category': 'Elige Tu Categoría de Herramientas',
                'section_choose_description': 'Selecciona de nuestra colección integral de herramientas organizadas por categoría',
                'category_image_title': 'Herramientas de Imagen',
                'category_audio_title': 'Herramientas de Audio',
                'category_document_title': 'Herramientas de Documento',
                'category_video_title': 'Herramientas de Video',
                'popular_tools_title': 'Herramientas Más Populares',
                'popular_tools_description': 'Únete a miles de usuarios que confían en nuestras herramientas',
                'feature_free_title': '100% Gratis',
                'feature_free_text': 'Todas las herramientas son completamente gratuitas sin cargos ocultos ni suscripciones requeridas.',
                'feature_secure_title': 'Seguro y Privado',
                'feature_secure_text': 'Sus archivos se procesan localmente y de forma segura. Ningún dato se almacena en nuestros servidores.',
                'feature_fast_title': 'Rápido y Fácil',
                'feature_fast_text': 'No se requiere registro. Simplemente sube tu archivo y obtén resultados en segundos.'
            }
        },
        'pt': {
            code: 'pt',
            name: 'Português',
            rtl: false,
            translations: {
                'you_are_known_as': 'Você é conhecido como',
                'nav_transfer': 'Transferência',
                'nav_rooms': 'Salas Multi-usuário',
                'nav_images': 'Imagens',
                'nav_audio': 'Áudio',
                'nav_video': 'Vídeo',
                'nav_files': 'Arquivos',
                'nav_about': 'Sobre',
                'nav_faq': 'FAQ',
                'nav_blog': 'Blog',
                'nav_privacy': 'Privacidade',
                'nav_terms': 'Termos',
                'hero_title': 'Compartilhamento Rápido de Arquivos Local Entre Dispositivos na Sua Rede',
                'hero_subtitle': 'Compartilhe arquivos instantaneamente com dispositivos próximos. Não é necessária configuração, completamente ponto a ponto.',
                'btn_start_sharing': 'Começar a Compartilhar Arquivos',
                'btn_multiuser_rooms': 'Salas Multi-usuário',
                'btn_use_tool': 'Usar Ferramenta',
                'btn_view_tools': 'Ver Ferramentas →',
                'section_choose_category': 'Escolha Sua Categoria de Ferramentas',
                'section_choose_description': 'Selecione de nossa coleção abrangente de ferramentas organizadas por categoria',
                'category_image_title': 'Ferramentas de Imagem',
                'category_audio_title': 'Ferramentas de Áudio',
                'category_document_title': 'Ferramentas de Documento',
                'category_video_title': 'Ferramentas de Vídeo',
                'popular_tools_title': 'Ferramentas Mais Populares',
                'popular_tools_description': 'Junte-se a milhares de usuários que confiam em nossas ferramentas',
                'feature_free_title': '100% Gratuito',
                'feature_free_text': 'Todas as ferramentas são completamente gratuitas, sem taxas ocultas ou assinaturas necessárias.',
                'feature_secure_title': 'Seguro e Privado',
                'feature_secure_text': 'Seus arquivos são processados localmente e com segurança. Nenhum dado é armazenado em nossos servidores.',
                'feature_fast_title': 'Rápido e Fácil',
                'feature_fast_text': 'Não é necessário registro. Simplesmente carregue seu arquivo e obtenha resultados em segundos.'
            }
        },
        'ru': {
            code: 'ru',
            name: 'Русский',
            rtl: false,
            translations: {
                'you_are_known_as': 'Вы известны как',
                'nav_transfer': 'Передача',
                'nav_rooms': 'Многопользовательские Комнаты',
                'nav_images': 'Изображения',
                'nav_audio': 'Аудио',
                'nav_video': 'Видео',
                'nav_files': 'Файлы',
                'nav_about': 'О программе',
                'nav_faq': 'Часто Задаваемые Вопросы',
                'nav_blog': 'Блог',
                'nav_privacy': 'Конфиденциальность',
                'nav_terms': 'Условия',
                'hero_title': 'Быстрый Локальный Обмен Файлами Между Устройствами в Вашей Сети',
                'hero_subtitle': 'Мгновенно делитесь файлами с ближними устройствами. Настройка не требуется, полностью одноранговый.',
                'btn_start_sharing': 'Начать Обмен Файлами',
                'btn_multiuser_rooms': 'Многопользовательские Комнаты',
                'btn_use_tool': 'Использовать Инструмент',
                'btn_view_tools': 'Посмотреть Инструменты →',
                'section_choose_category': 'Выберите Категорию Инструментов',
                'section_choose_description': 'Выберите из нашей обширной коллекции инструментов, организованных по категориям',
                'category_image_title': 'Инструменты для Изображений',
                'category_audio_title': 'Аудио Инструменты',
                'category_document_title': 'Инструменты для Документов',
                'category_video_title': 'Видео Инструменты',
                'popular_tools_title': 'Самые Популярные Инструменты',
                'popular_tools_description': 'Присоединяйтесь к тысячам пользователей, которые доверяют нашим инструментам',
                'feature_free_title': '100% Бесплатно',
                'feature_free_text': 'Все инструменты полностью бесплатны для использования без скрытых платежей или обязательных подписок.',
                'feature_secure_title': 'Безопасно и Приватно',
                'feature_secure_text': 'Ваши файлы обрабатываются локально и безопасно. Никакие данные не хранятся на наших серверах.',
                'feature_fast_title': 'Быстро и Легко',
                'feature_fast_text': 'Регистрация не требуется. Просто загрузите свой файл и получите результаты за секунды.'
            }
        },
        'ar': {
            code: 'ar',
            name: 'العربية',
            rtl: true,
            translations: {
                'you_are_known_as': 'أنت معروف باسم',
                'nav_transfer': 'نقل',
                'nav_rooms': 'غرف متعددة المستخدمين',
                'nav_images': 'الصور',
                'nav_audio': 'الصوت',
                'nav_video': 'الفيديو',
                'nav_files': 'الملفات',
                'nav_about': 'حول',
                'nav_faq': 'الأسئلة الشائعة',
                'nav_blog': 'المدونة',
                'nav_privacy': 'الخصوصية',
                'nav_terms': 'الشروط',
                'hero_title': 'مشاركة الملفات المحلية السريعة بين الأجهزة على شبكتك',
                'hero_subtitle': 'شارك الملفات فوراً مع الأجهزة القريبة. لا حاجة للإعداد، بين نظير إلى نظير بالكامل.',
                'btn_start_sharing': 'ابدأ مشاركة الملفات',
                'btn_multiuser_rooms': 'غرف متعددة المستخدمين',
                'btn_use_tool': 'استخدام الأداة',
                'btn_view_tools': 'عرض الأدوات ←',
                'section_choose_category': 'اختر فئة أدواتك',
                'section_choose_description': 'اختر من مجموعتنا الشاملة من الأدوات المنظمة بالفئات',
                'category_image_title': 'أدوات الصور',
                'category_audio_title': 'أدوات الصوت',
                'category_document_title': 'أدوات المستندات',
                'category_video_title': 'أدوات الفيديو',
                'popular_tools_title': 'الأدوات الأكثر شيوعاً',
                'popular_tools_description': 'انضم إلى آلاف المستخدمين الذين يثقون في أدواتنا',
                'feature_free_title': 'مجاني 100%',
                'feature_free_text': 'جميع الأدوات مجانية بالكامل للاستخدام دون رسوم مخفية أو اشتراكات مطلوبة.',
                'feature_secure_title': 'آمن وخاص',
                'feature_secure_text': 'يتم معالجة ملفاتك محلياً وبأمان. لا يتم تخزين أي بيانات على زواةمنا.',
                'feature_fast_title': 'سريع وسهل',
                'feature_fast_text': 'لا يتطلب التسجيل. فقط قم بتحميل ملفك واحصل على النتائج في ثوانٍ.'
            }
        },
        'ja': {
            code: 'ja',
            name: '日本語',
            rtl: false,
            translations: {
                'you_are_known_as': 'あなたの名前は',
                'nav_transfer': '転送',
                'nav_rooms': 'マルチユーザールーム',
                'nav_images': '画像',
                'nav_audio': '音声',
                'nav_video': '動画',
                'nav_files': 'ファイル',
                'nav_about': '概要',
                'nav_faq': 'よくある質問',
                'nav_blog': 'ブログ',
                'nav_privacy': 'プライバシー',
                'nav_terms': '利用規約',
                'hero_title': 'ネットワーク上のデバイス間で高速ローカルファイル共有',
                'hero_subtitle': '近くのデバイスとファイルを瞬時に共有。セットアップ不要、完全ピアツーピア。',
                'btn_start_sharing': 'ファイル共有を開始',
                'btn_multiuser_rooms': 'マルチユーザールーム',
                'btn_use_tool': 'ツールを使用',
                'btn_view_tools': 'ツールを見る →',
                'section_choose_category': 'ツールカテゴリを選択',
                'section_choose_description': 'カテゴリ別に整理された包括的なツールコレクションから選択',
                'category_image_title': '画像ツール',
                'category_image_description': '画像の編集、変換、最適化',
                'category_audio_title': '音声ツール',
                'category_audio_description': '異なるフォーマット間で音声を変換',
                'category_document_title': '文書ツール',
                'category_document_description': '変換、結合、分割、テキスト抽出',
                'category_video_title': '動画ツール',
                'category_video_description': '異なるフォーマット間で動画を変換',
                'tool_format_converter': 'フォーマット変換器',
                'tool_image_cropper': '画像トリミング',
                'tool_background_remover': '背景削除',
                'popular_tools_title': '人気のツール',
                'popular_tools_description': '私たちのツールを信頼する何千人ものユーザーに参加',
                'feature_free_title': '100% 無料',
                'feature_free_text': '隠れた料金やサブスクリプションなしで、すべてのツールを完全に無料で使用できます。',
                'feature_secure_title': '安全でプライベート',
                'feature_secure_text': 'ファイルはローカルで安全に処理されます。データはサーバーに保存されません。',
                'feature_fast_title': '高速で簡単',
                'feature_fast_text': '登録不要。ファイルをアップロードするだけで、数秒で結果を得られます。'
            }
        },
        'ko': {
            code: 'ko',
            name: '한국어',
            rtl: false,
            translations: {
                'you_are_known_as': '당신은 다음과 같이 알려져 있습니다',
                'nav_transfer': '전송',
                'nav_rooms': '다중 사용자 룸',
                'nav_images': '이미지',
                'nav_audio': '오디오',
                'nav_video': '비디오',
                'nav_files': '파일',
                'nav_about': '소개',
                'nav_faq': '자주 묻는 질문',
                'nav_blog': '블로그',
                'nav_privacy': '개인정보보호',
                'nav_terms': '이용약관',
                'hero_title': '네트워크 내 기기 간 빠른 로컬 파일 공유',
                'hero_subtitle': '인근 기기와 즉시 파일을 공유하세요. 설정 불필요, 완전 피어 투 피어.',
                'btn_start_sharing': '파일 공유 시작',
                'btn_multiuser_rooms': '다중 사용자 룸',
                'btn_use_tool': '도구 사용',
                'btn_view_tools': '도구 보기 →',
                'section_choose_category': '도구 카테고리 선택',
                'section_choose_description': '카테고리별로 정리된 포괄적인 도구 컷렉션에서 선택하세요',
                'category_image_title': '이미지 도구',
                'category_audio_title': '오디오 도구',
                'category_document_title': '문서 도구',
                'category_video_title': '비디오 도구',
                'popular_tools_title': '가장 인기 있는 도구',
                'popular_tools_description': '저희 도구를 신뢰하는 수천 명의 사용자와 함께하세요',
                'feature_free_title': '100% 무료',
                'feature_free_text': '모든 도구는 숨겨진 비용이나 구독 요구 없이 완전히 무료로 사용할 수 있습니다.',
                'feature_secure_title': '안전하고 비공개',
                'feature_secure_text': '파일은 로컬에서 안전하게 처리됩니다. 어떤 데이터도 서버에 저장되지 않습니다.',
                'feature_fast_title': '빠르고 쉬움',
                'feature_fast_text': '등록이 필요 없습니다. 단순히 파일을 업로드하면 몇 초 내에 결과를 얻을 수 있습니다.'
            }
        }
    };

    // Language utilities
    var LanguageManager = {
        currentLanguage: 'en',
        
        // Initialize language manager
        init: function() {
            var savedLang = this.getSavedLanguage();
            if (savedLang && LANGUAGES[savedLang]) {
                this.setLanguage(savedLang);
            } else {
                this.setLanguage(this.detectLanguage());
            }
        },
        
        // Detect browser language
        detectLanguage: function() {
            var browserLang = navigator.language || navigator.userLanguage || 'en';
            var langCode = browserLang.toLowerCase();
            
            // Direct match
            if (LANGUAGES[langCode]) {
                return langCode;
            }
            
            // Check for partial match (e.g., 'zh-cn' -> 'zh')
            var baseLang = langCode.split('-')[0];
            if (LANGUAGES[baseLang]) {
                return baseLang;
            }
            
            // Check for special cases
            if (langCode.indexOf('zh') === 0) {
                if (langCode.indexOf('tw') !== -1 || langCode.indexOf('hk') !== -1) {
                    return 'zh-tw';
                }
                return 'zh';
            }
            
            return 'en'; // Default fallback
        },
        
        // Get saved language from localStorage
        getSavedLanguage: function() {
            try {
                return localStorage.getItem('dropshare_language');
            } catch (e) {
                return null;
            }
        },
        
        // Save language to localStorage
        saveLanguage: function(langCode) {
            try {
                localStorage.setItem('dropshare_language', langCode);
            } catch (e) {
                // Silent fail
            }
        },
        
        // Set current language
        setLanguage: function(langCode) {
            if (LANGUAGES[langCode]) {
                this.currentLanguage = langCode;
                this.saveLanguage(langCode);
                this.updatePageDirection();
                return true;
            }
            return false;
        },
        
        // Update page direction for RTL languages
        updatePageDirection: function() {
            var lang = LANGUAGES[this.currentLanguage];
            if (lang) {
                document.documentElement.dir = lang.rtl ? 'rtl' : 'ltr';
                document.documentElement.lang = lang.code;
            }
        },
        
        // Get translation
        t: function(key, fallback) {
            var lang = LANGUAGES[this.currentLanguage];
            if (lang && lang.translations && lang.translations[key]) {
                return lang.translations[key];
            }
            
            // Fallback to English
            if (this.currentLanguage !== 'en' && LANGUAGES['en'] && LANGUAGES['en'].translations[key]) {
                return LANGUAGES['en'].translations[key];
            }
            
            return fallback || key;
        },
        
        // Get current language info
        getCurrentLanguage: function() {
            return LANGUAGES[this.currentLanguage];
        },
        
        // Get all available languages
        getAvailableLanguages: function() {
            var languages = [];
            for (var code in LANGUAGES) {
                if (LANGUAGES.hasOwnProperty(code)) {
                    languages.push({
                        code: code,
                        name: LANGUAGES[code].name,
                        rtl: LANGUAGES[code].rtl
                    });
                }
            }
            return languages;
        }
    };

    // Export to global scope
    window.LANGUAGES = LANGUAGES;
    window.LanguageManager = LanguageManager;
    
    // Backward compatibility - create DROPSHARE_I18N alias
    window.DROPSHARE_I18N = {
        init: function() {
            console.log('DROPSHARE_I18N.init() called - using LanguageManager');
            LanguageManager.init();
        },
        changeLanguage: function(langCode) {
            console.log('DROPSHARE_I18N.changeLanguage() called - using LanguageManager');
            LanguageManager.setLanguage(langCode);
            // Update all translations
            var i18nElements = document.querySelectorAll('[data-i18n]');
            i18nElements.forEach(function(element) {
                var key = element.getAttribute('data-i18n');
                element.textContent = LanguageManager.t(key);
            });
        },
        getCurrentLanguage: function() {
            return LanguageManager.currentLanguage;
        },
        translate: function(key) {
            return LanguageManager.t(key);
        },
        t: function(key) {
            return LanguageManager.t(key);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LanguageManager.init();
        });
    } else {
        LanguageManager.init();
    }

})(window);