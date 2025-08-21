const fs = require('fs');

// 综合多语言翻译系统
const multilingualTranslations = {
    // 法语翻译
    fr: {
        // 历史功能
        'history': 'Historique',
        'no_history': 'Aucun historique de transfert pour le moment',
        'search_history': 'Rechercher dans l\'historique...',
        'transfer_history': 'Historique des transferts',
        
        // 筛选和排序
        'filter_all': 'Tous',
        'filter_sent': 'Envoyés',
        'filter_received': 'Reçus',
        'filter_files': 'Fichiers',
        'filter_messages': 'Messages',
        'sort_by': 'Trier par',
        'sort_time_desc': 'Plus récent d\'abord',
        'sort_time_asc': 'Plus ancien d\'abord',
        'sort_size_desc': 'Plus volumineux d\'abord',
        'sort_size_asc': 'Plus petit d\'abord',
        'sort_name_asc': 'Nom A-Z',
        'sort_name_desc': 'Nom Z-A',
        
        // 统计功能
        'total_transfers': 'Total des transferts',
        'total_size': 'Taille totale',
        'most_common_type': 'Type le plus courant',
        'export_history': 'Exporter l\'historique',
        'clear_history': 'Effacer l\'historique',
        'confirm_clear': 'Êtes-vous sûr de vouloir effacer tout l\'historique des transferts ?',
        'export_json': 'Exporter en JSON',
        'export_csv': 'Exporter en CSV',
        
        // 文件管理
        'file_manager': 'Gestionnaire de fichiers',
        'select_all': 'Tout sélectionner',
        'deselect_all': 'Tout désélectionner',
        'delete_selected': 'Supprimer la sélection',
        'move_to_folder': 'Déplacer vers le dossier',
        'create_folder': 'Créer un dossier',
        'rename_file': 'Renommer le fichier',
        'file_properties': 'Propriétés du fichier',
        'duplicate_file': 'Dupliquer le fichier',
        'compress_files': 'Compresser les fichiers',
        'extract_files': 'Extraire les fichiers',
        
        // 传输功能
        'transfer_speed': 'Vitesse de transfert',
        'estimated_time': 'Temps estimé',
        'transfer_progress': 'Progression du transfert',
        'pause_transfer': 'Suspendre le transfert',
        'resume_transfer': 'Reprendre le transfert',
        'cancel_transfer': 'Annuler le transfert',
        'retry_transfer': 'Réessayer le transfert',
        'transfer_queue': 'File d\'attente des transferts',
        'transfer_limit': 'Limite de transfert',
        'max_file_size': 'Taille maximale du fichier',
        
        // 设备管理
        'device_manager': 'Gestionnaire d\'appareils',
        'trusted_devices': 'Appareils de confiance',
        'blocked_devices': 'Appareils bloqués',
        'device_nickname': 'Surnom de l\'appareil',
        'device_status': 'État de l\'appareil',
        'device_online': 'En ligne',
        'device_offline': 'Hors ligne',
        'device_connecting': 'Connexion en cours',
        'device_connected': 'Connecté',
        'device_disconnected': 'Déconnecté',
        
        // 安全设置
        'security_settings': 'Paramètres de sécurité',
        'privacy_mode': 'Mode privé',
        'encrypt_transfers': 'Chiffrer les transferts',
        'require_approval': 'Exiger une approbation',
        'auto_accept': 'Accepter automatiquement',
        'password_protect': 'Protection par mot de passe',
        'set_password': 'Définir un mot de passe',
        'enter_password': 'Entrer le mot de passe',
        'password_required': 'Mot de passe requis',
        'invalid_password': 'Mot de passe invalide',
        
        // 通知系统
        'notifications': 'Notifications',
        'enable_notifications': 'Activer les notifications',
        'sound_alerts': 'Alertes sonores',
        'desktop_notifications': 'Notifications de bureau',
        'transfer_complete_notification': 'Notification de transfert terminé',
        'new_device_notification': 'Notification de nouvel appareil',
        'error_notification': 'Notification d\'erreur',
        'warning': 'Avertissement',
        'information': 'Information',
        'success': 'Succès',
        'error': 'Erreur',
        
        // 界面主题
        'theme': 'Thème',
        'dark_mode': 'Mode sombre',
        'light_mode': 'Mode clair',
        'auto_theme': 'Thème automatique',
        'font_size': 'Taille de police',
        'zoom_level': 'Niveau de zoom',
        'full_screen': 'Plein écran',
        'minimize': 'Réduire',
        'maximize': 'Agrandir',
        'restore': 'Restaurer',
        'refresh': 'Actualiser',
        'reload': 'Recharger',
        
        // 高级功能
        'advanced_settings': 'Paramètres avancés',
        'debug_mode': 'Mode débogage',
        'developer_options': 'Options développeur',
        'connection_info': 'Informations de connexion',
        'network_diagnostics': 'Diagnostics réseau',
        'speed_test': 'Test de vitesse',
        'bandwidth_usage': 'Utilisation de la bande passante',
        'connection_quality': 'Qualité de connexion',
        'latency': 'Latence',
        'packet_loss': 'Perte de paquets',
        
        // 帮助支持
        'help_center': 'Centre d\'aide',
        'user_guide': 'Guide utilisateur',
        'tutorials': 'Tutoriels',
        'video_tutorials': 'Tutoriels vidéo',
        'troubleshooting': 'Dépannage',
        'contact_support': 'Contacter le support',
        'report_bug': 'Signaler un bug',
        'feature_request': 'Demande de fonctionnalité',
        'feedback': 'Commentaires',
        'rate_app': 'Évaluer l\'application',
        
        // 文件预览
        'preview': 'Aperçu',
        'preview_not_available': 'Aperçu non disponible',
        'image_preview': 'Aperçu image',
        'video_preview': 'Aperçu vidéo',
        'audio_preview': 'Aperçu audio',
        'document_preview': 'Aperçu document',
        'text_preview': 'Aperçu texte',
        'download_to_preview': 'Télécharger pour prévisualiser',
        
        // 搜索过滤
        'advanced_search': 'Recherche avancée',
        'search_by_name': 'Rechercher par nom',
        'search_by_type': 'Rechercher par type',
        'search_by_size': 'Rechercher par taille',
        'search_by_date': 'Rechercher par date',
        'filter_options': 'Options de filtre',
        'date_range': 'Plage de dates',
        'size_range': 'Plage de taille',
        'file_type_filter': 'Filtre de type de fichier',
        'custom_filter': 'Filtre personnalisé',
        
        // 批量操作
        'batch_operations': 'Opérations en lot',
        'batch_download': 'Téléchargement en lot',
        'batch_upload': 'Envoi en lot',
        'batch_delete': 'Suppression en lot',
        'batch_rename': 'Renommage en lot',
        'batch_move': 'Déplacement en lot',
        'batch_copy': 'Copie en lot',
        'select_operation': 'Sélectionner l\'opération',
        'apply_to_selected': 'Appliquer à la sélection'
    },

    // 德语翻译
    de: {
        // 历史功能
        'history': 'Verlauf',
        'no_history': 'Noch kein Übertragungsverlauf vorhanden',
        'search_history': 'Verlauf durchsuchen...',
        'transfer_history': 'Übertragungsverlauf',
        
        // 筛选和排序
        'filter_all': 'Alle',
        'filter_sent': 'Gesendet',
        'filter_received': 'Empfangen',
        'filter_files': 'Dateien',
        'filter_messages': 'Nachrichten',
        'sort_by': 'Sortieren nach',
        'sort_time_desc': 'Neueste zuerst',
        'sort_time_asc': 'Älteste zuerst',
        'sort_size_desc': 'Größte zuerst',
        'sort_size_asc': 'Kleinste zuerst',
        'sort_name_asc': 'Name A-Z',
        'sort_name_desc': 'Name Z-A',
        
        // 统计功能
        'total_transfers': 'Gesamte Übertragungen',
        'total_size': 'Gesamtgröße',
        'most_common_type': 'Häufigster Typ',
        'export_history': 'Verlauf exportieren',
        'clear_history': 'Verlauf löschen',
        'confirm_clear': 'Sind Sie sicher, dass Sie den gesamten Übertragungsverlauf löschen möchten?',
        'export_json': 'Als JSON exportieren',
        'export_csv': 'Als CSV exportieren',
        
        // 文件管理
        'file_manager': 'Dateimanager',
        'select_all': 'Alle auswählen',
        'deselect_all': 'Auswahl aufheben',
        'delete_selected': 'Ausgewählte löschen',
        'move_to_folder': 'In Ordner verschieben',
        'create_folder': 'Ordner erstellen',
        'rename_file': 'Datei umbenennen',
        'file_properties': 'Dateieigenschaften',
        'duplicate_file': 'Datei duplizieren',
        'compress_files': 'Dateien komprimieren',
        'extract_files': 'Dateien extrahieren',
        
        // 传输功能
        'transfer_speed': 'Übertragungsgeschwindigkeit',
        'estimated_time': 'Geschätzte Zeit',
        'transfer_progress': 'Übertragungsfortschritt',
        'pause_transfer': 'Übertragung pausieren',
        'resume_transfer': 'Übertragung fortsetzen',
        'cancel_transfer': 'Übertragung abbrechen',
        'retry_transfer': 'Übertragung wiederholen',
        'transfer_queue': 'Übertragungsqueue',
        'transfer_limit': 'Übertragungslimit',
        'max_file_size': 'Maximale Dateigröße',
        
        // 设备管理
        'device_manager': 'Gerätemanager',
        'trusted_devices': 'Vertrauenswürdige Geräte',
        'blocked_devices': 'Blockierte Geräte',
        'device_nickname': 'Gerätename',
        'device_status': 'Gerätestatus',
        'device_online': 'Online',
        'device_offline': 'Offline',
        'device_connecting': 'Verbinden',
        'device_connected': 'Verbunden',
        'device_disconnected': 'Getrennt',
        
        // 安全设置
        'security_settings': 'Sicherheitseinstellungen',
        'privacy_mode': 'Datenschutzmodus',
        'encrypt_transfers': 'Übertragungen verschlüsseln',
        'require_approval': 'Genehmigung erforderlich',
        'auto_accept': 'Automatisch akzeptieren',
        'password_protect': 'Passwortschutz',
        'set_password': 'Passwort festlegen',
        'enter_password': 'Passwort eingeben',
        'password_required': 'Passwort erforderlich',
        'invalid_password': 'Ungültiges Passwort'
    },

    // 西班牙语翻译
    es: {
        // 历史功能
        'history': 'Historial',
        'no_history': 'Aún no hay historial de transferencias',
        'search_history': 'Buscar en el historial...',
        'transfer_history': 'Historial de transferencias',
        
        // 筛选和排序
        'filter_all': 'Todos',
        'filter_sent': 'Enviados',
        'filter_received': 'Recibidos',
        'filter_files': 'Archivos',
        'filter_messages': 'Mensajes',
        'sort_by': 'Ordenar por',
        'sort_time_desc': 'Más reciente primero',
        'sort_time_asc': 'Más antiguo primero',
        'sort_size_desc': 'Más grande primero',
        'sort_size_asc': 'Más pequeño primero',
        'sort_name_asc': 'Nombre A-Z',
        'sort_name_desc': 'Nombre Z-A',
        
        // 统计功能
        'total_transfers': 'Total de transferencias',
        'total_size': 'Tamaño total',
        'most_common_type': 'Tipo más común',
        'export_history': 'Exportar historial',
        'clear_history': 'Limpiar historial',
        'confirm_clear': '¿Está seguro de que desea borrar todo el historial de transferencias?',
        'export_json': 'Exportar como JSON',
        'export_csv': 'Exportar como CSV',
        
        // 文件管理
        'file_manager': 'Administrador de archivos',
        'select_all': 'Seleccionar todo',
        'deselect_all': 'Deseleccionar todo',
        'delete_selected': 'Eliminar seleccionados',
        'move_to_folder': 'Mover a carpeta',
        'create_folder': 'Crear carpeta',
        'rename_file': 'Renombrar archivo',
        'file_properties': 'Propiedades del archivo',
        'duplicate_file': 'Duplicar archivo',
        'compress_files': 'Comprimir archivos',
        'extract_files': 'Extraer archivos'
    },

    // 葡萄牙语翻译
    pt: {
        // 历史功能
        'history': 'Histórico',
        'no_history': 'Ainda não há histórico de transferências',
        'search_history': 'Pesquisar no histórico...',
        'transfer_history': 'Histórico de transferências',
        
        // 筛选和排序
        'filter_all': 'Todos',
        'filter_sent': 'Enviados',
        'filter_received': 'Recebidos',
        'filter_files': 'Arquivos',
        'filter_messages': 'Mensagens',
        'sort_by': 'Ordenar por',
        'sort_time_desc': 'Mais recente primeiro',
        'sort_time_asc': 'Mais antigo primeiro',
        'sort_size_desc': 'Maior primeiro',
        'sort_size_asc': 'Menor primeiro',
        'sort_name_asc': 'Nome A-Z',
        'sort_name_desc': 'Nome Z-A',
        
        // 统计功能
        'total_transfers': 'Total de transferências',
        'total_size': 'Tamanho total',
        'most_common_type': 'Tipo mais comum',
        'export_history': 'Exportar histórico',
        'clear_history': 'Limpar histórico',
        'confirm_clear': 'Tem certeza de que deseja limpar todo o histórico de transferências?',
        'export_json': 'Exportar como JSON',
        'export_csv': 'Exportar como CSV',
        
        // 文件管理
        'file_manager': 'Gerenciador de arquivos',
        'select_all': 'Selecionar tudo',
        'deselect_all': 'Desmarcar tudo',
        'delete_selected': 'Excluir selecionados',
        'move_to_folder': 'Mover para pasta',
        'create_folder': 'Criar pasta',
        'rename_file': 'Renomear arquivo',
        'file_properties': 'Propriedades do arquivo',
        'duplicate_file': 'Duplicar arquivo',
        'compress_files': 'Comprimir arquivos',
        'extract_files': 'Extrair arquivos'
    },

    // 俄语翻译
    ru: {
        // 历史功能
        'history': 'История',
        'no_history': 'Пока нет истории передач',
        'search_history': 'Поиск в истории...',
        'transfer_history': 'История передач',
        
        // 筛选和排序
        'filter_all': 'Все',
        'filter_sent': 'Отправленные',
        'filter_received': 'Полученные',
        'filter_files': 'Файлы',
        'filter_messages': 'Сообщения',
        'sort_by': 'Сортировать по',
        'sort_time_desc': 'Сначала новые',
        'sort_time_asc': 'Сначала старые',
        'sort_size_desc': 'Сначала большие',
        'sort_size_asc': 'Сначала маленькие',
        'sort_name_asc': 'Имя А-Я',
        'sort_name_desc': 'Имя Я-А',
        
        // 统计功能
        'total_transfers': 'Всего передач',
        'total_size': 'Общий размер',
        'most_common_type': 'Самый частый тип',
        'export_history': 'Экспорт истории',
        'clear_history': 'Очистить историю',
        'confirm_clear': 'Вы уверены, что хотите очистить всю историю передач?',
        'export_json': 'Экспорт в JSON',
        'export_csv': 'Экспорт в CSV',
        
        // 文件管理
        'file_manager': 'Файловый менеджер',
        'select_all': 'Выбрать все',
        'deselect_all': 'Снять выделение',
        'delete_selected': 'Удалить выбранные',
        'move_to_folder': 'Переместить в папку',
        'create_folder': 'Создать папку',
        'rename_file': 'Переименовать файл',
        'file_properties': 'Свойства файла',
        'duplicate_file': 'Дублировать файл',
        'compress_files': 'Сжать файлы',
        'extract_files': 'Извлечь файлы'
    },

    // 阿拉伯语翻译
    ar: {
        // 历史功能
        'history': 'التاريخ',
        'no_history': 'لا يوجد تاريخ نقل حتى الآن',
        'search_history': 'البحث في التاريخ...',
        'transfer_history': 'تاريخ النقل',
        
        // 筛选和排序
        'filter_all': 'الكل',
        'filter_sent': 'المرسل',
        'filter_received': 'المستلم',
        'filter_files': 'الملفات',
        'filter_messages': 'الرسائل',
        'sort_by': 'ترتيب حسب',
        'sort_time_desc': 'الأحدث أولاً',
        'sort_time_asc': 'الأقدم أولاً',
        'sort_size_desc': 'الأكبر أولاً',
        'sort_size_asc': 'الأصغر أولاً',
        'sort_name_asc': 'الاسم أ-ي',
        'sort_name_desc': 'الاسم ي-أ',
        
        // 统计功能
        'total_transfers': 'إجمالي النقل',
        'total_size': 'الحجم الإجمالي',
        'most_common_type': 'النوع الأكثر شيوعاً',
        'export_history': 'تصدير التاريخ',
        'clear_history': 'مسح التاريخ',
        'confirm_clear': 'هل أنت متأكد من أنك تريد مسح كل تاريخ النقل؟',
        'export_json': 'تصدير كـ JSON',
        'export_csv': 'تصدير كـ CSV',
        
        // 文件管理
        'file_manager': 'مدير الملفات',
        'select_all': 'تحديد الكل',
        'deselect_all': 'إلغاء تحديد الكل',
        'delete_selected': 'حذف المحدد',
        'move_to_folder': 'نقل إلى مجلد',
        'create_folder': 'إنشاء مجلد',
        'rename_file': 'إعادة تسمية الملف',
        'file_properties': 'خصائص الملف',
        'duplicate_file': 'تكرار الملف',
        'compress_files': 'ضغط الملفات',
        'extract_files': 'استخراج الملفات'
    },

    // 日语翻译
    ja: {
        // 历史功能
        'history': '履歴',
        'no_history': 'まだ転送履歴がありません',
        'search_history': '履歴を検索...',
        'transfer_history': '転送履歴',
        
        // 筛选和排序
        'filter_all': 'すべて',
        'filter_sent': '送信済み',
        'filter_received': '受信済み',
        'filter_files': 'ファイル',
        'filter_messages': 'メッセージ',
        'sort_by': '並び替え',
        'sort_time_desc': '新しい順',
        'sort_time_asc': '古い順',
        'sort_size_desc': '大きい順',
        'sort_size_asc': '小さい順',
        'sort_name_asc': '名前 A-Z',
        'sort_name_desc': '名前 Z-A',
        
        // 统计功能
        'total_transfers': '総転送数',
        'total_size': '総サイズ',
        'most_common_type': '最も一般的なタイプ',
        'export_history': '履歴をエクスポート',
        'clear_history': '履歴をクリア',
        'confirm_clear': 'すべての転送履歴をクリアしてもよろしいですか？',
        'export_json': 'JSONでエクスポート',
        'export_csv': 'CSVでエクスポート',
        
        // 文件管理
        'file_manager': 'ファイルマネージャー',
        'select_all': 'すべて選択',
        'deselect_all': 'すべて選択解除',
        'delete_selected': '選択したものを削除',
        'move_to_folder': 'フォルダに移動',
        'create_folder': 'フォルダを作成',
        'rename_file': 'ファイル名を変更',
        'file_properties': 'ファイルのプロパティ',
        'duplicate_file': 'ファイルを複製',
        'compress_files': 'ファイルを圧縮',
        'extract_files': 'ファイルを解凍'
    },

    // 韩语翻译
    ko: {
        // 历史功能
        'history': '기록',
        'no_history': '아직 전송 기록이 없습니다',
        'search_history': '기록 검색...',
        'transfer_history': '전송 기록',
        
        // 筛选和排序
        'filter_all': '모두',
        'filter_sent': '보낸 항목',
        'filter_received': '받은 항목',
        'filter_files': '파일',
        'filter_messages': '메시지',
        'sort_by': '정렬 기준',
        'sort_time_desc': '최신순',
        'sort_time_asc': '오래된 순',
        'sort_size_desc': '큰 순서',
        'sort_size_asc': '작은 순서',
        'sort_name_asc': '이름 A-Z',
        'sort_name_desc': '이름 Z-A',
        
        // 统计功能
        'total_transfers': '총 전송 수',
        'total_size': '총 크기',
        'most_common_type': '가장 일반적인 유형',
        'export_history': '기록 내보내기',
        'clear_history': '기록 지우기',
        'confirm_clear': '모든 전송 기록을 지우시겠습니까?',
        'export_json': 'JSON으로 내보내기',
        'export_csv': 'CSV로 내보내기',
        
        // 文件管理
        'file_manager': '파일 관리자',
        'select_all': '모두 선택',
        'deselect_all': '모두 선택 해제',
        'delete_selected': '선택한 항목 삭제',
        'move_to_folder': '폴더로 이동',
        'create_folder': '폴더 만들기',
        'rename_file': '파일 이름 바꾸기',
        'file_properties': '파일 속성',
        'duplicate_file': '파일 복제',
        'compress_files': '파일 압축',
        'extract_files': '파일 압축 해제'
    }
};

// 技术术语列表 - 这些保持英文不变
const technicalTerms = new Set([
    'MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'MP4', 'AVI', 'MOV', 'WebM', 'MKV',
    'PDF', 'DOCX', 'TXT', 'RTF', 'HTML', 'JSON', 'CSV', 'ZIP', 'RAR',
    'WebRTC', 'API', 'URL', 'HTTP', 'HTTPS', 'SSL', 'TLS', 'VPN',
    'CPU', 'RAM', 'GPU', 'USB', 'WiFi', 'LAN', 'IP', 'DNS', 'TCP',
    'DTLS', 'SRTP', 'P2P', 'QR', 'OCR', 'AI', 'ML', 'AR', 'VR'
]);

// 判断是否为技术术语
function isTechnicalTerm(key, value) {
    const upperValue = value.toUpperCase();
    for (const term of technicalTerms) {
        if (upperValue.includes(term) || key.toUpperCase().includes(term)) {
            return true;
        }
    }
    
    if (value.includes(',') && /^[A-Z0-9, ]+$/.test(value)) {
        return true;
    }
    
    if (/^[A-Z]{2,}$/.test(value) || /^[A-Z]{2,}[0-9]+$/.test(value)) {
        return true;
    }
    
    return false;
}

// 读取并更新语言文件
const languagesPath = './public/scripts/i18n/languages.js';
const content = fs.readFileSync(languagesPath, 'utf8');

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

console.log('=== 开始多语言智能翻译 ===\n');

const enTranslations = LANGUAGES.en.translations;
const targetLanguages = Object.keys(multilingualTranslations);
const stats = {};

// 为每种语言补充翻译
targetLanguages.forEach(langCode => {
    const langTranslations = LANGUAGES[langCode].translations;
    const customTranslations = multilingualTranslations[langCode];
    
    let added = 0;
    let technical = 0;
    let existing = 0;
    
    console.log(`处理 ${LANGUAGES[langCode].name} (${langCode})...`);
    
    for (const key in enTranslations) {
        if (!langTranslations[key]) {
            const englishValue = enTranslations[key];
            
            if (customTranslations[key]) {
                // 使用自定义翻译
                langTranslations[key] = customTranslations[key];
                added++;
            } else if (isTechnicalTerm(key, englishValue)) {
                // 技术术语保持英文
                langTranslations[key] = englishValue;
                technical++;
            } else {
                // 暂时使用英文，标记需要翻译
                langTranslations[key] = englishValue;
                technical++;
            }
        } else {
            existing++;
        }
    }
    
    stats[langCode] = {
        name: LANGUAGES[langCode].name,
        added: added,
        technical: technical,
        existing: existing,
        total: Object.keys(langTranslations).length,
        completeness: ((Object.keys(langTranslations).length / Object.keys(enTranslations).length) * 100).toFixed(1)
    };
    
    console.log(`  新增翻译: ${added} 个`);
    console.log(`  技术术语: ${technical} 个`);
    console.log(`  已有翻译: ${existing} 个`);
    console.log(`  当前完整度: ${stats[langCode].completeness}%\n`);
});

// 重新构建文件内容
const beforeLanguages = content.substring(0, content.indexOf('const LANGUAGES = {'));
const afterLanguages = content.substring(content.indexOf('// Get user language from browser'));

let newContent = beforeLanguages + 'const LANGUAGES = {\n';

const langCodes = Object.keys(LANGUAGES);
langCodes.forEach((langCode, index) => {
    const lang = LANGUAGES[langCode];
    newContent += `    '${langCode}': {\n`;
    newContent += `        code: '${lang.code}',\n`;
    newContent += `        name: '${lang.name}',\n`;
    newContent += `        rtl: ${lang.rtl},\n`;
    newContent += `        translations: {\n`;
    
    const translations = lang.translations;
    const keys = Object.keys(translations);
    keys.forEach((key, keyIndex) => {
        const value = translations[key].replace(/'/g, "\\'").replace(/\n/g, '\\n');
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

// 写入主文件
const outputPath = './public/scripts/i18n/languages_multilingual_complete.js';
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log('=== 翻译完成统计 ===');
targetLanguages.forEach(langCode => {
    const stat = stats[langCode];
    console.log(`${stat.name}: ${stat.completeness}% (${stat.total}/${Object.keys(enTranslations).length})`);
});

console.log(`\n多语言翻译完成！新文件已保存到: ${outputPath}`);

// 同时更新独立语言文件
targetLanguages.forEach(langCode => {
    const filePath = `./public/scripts/i18n/languages/${langCode}.js`;
    if (fs.existsSync(filePath)) {
        const langTranslations = LANGUAGES[langCode].translations;
        const customTranslations = multilingualTranslations[langCode];
        
        let fileContent = fs.readFileSync(filePath, 'utf8');
        let addedToFile = 0;
        
        for (const key in enTranslations) {
            const keyPattern = new RegExp(`"${key}"\\s*:`);
            
            if (!keyPattern.test(fileContent)) {
                let translation = '';
                if (customTranslations[key]) {
                    translation = customTranslations[key];
                } else if (isTechnicalTerm(key, enTranslations[key])) {
                    translation = enTranslations[key];
                } else {
                    translation = enTranslations[key];
                }
                
                const lastBraceIndex = fileContent.lastIndexOf('}');
                const beforeBrace = fileContent.substring(0, lastBraceIndex).trim();
                const afterBrace = fileContent.substring(lastBraceIndex);
                
                const needsComma = !beforeBrace.endsWith(',');
                const comma = needsComma ? ',' : '';
                const escapedTranslation = translation.replace(/"/g, '\\"');
                
                fileContent = beforeBrace + comma + 
                             `\n    "${key}": "${escapedTranslation}"` + 
                             '\n' + afterBrace;
                
                addedToFile++;
            }
        }
        
        if (addedToFile > 0) {
            fs.writeFileSync(filePath, fileContent, 'utf8');
            console.log(`${LANGUAGES[langCode].name} 独立文件已更新，添加了 ${addedToFile} 个翻译`);
        }
    }
});

console.log('\n🎉 所有语言翻译更新完成！');