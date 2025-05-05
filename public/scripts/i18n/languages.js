// Multi-language support for DropShare
const LANGUAGES = {
    'en': {
        code: 'en',
        name: 'English',
        rtl: false,
        translations: {
            'open_snapdrop': 'Open DropShare on other devices to send files',
            'click_to_send': 'Click to send files or right click to send a message',
            'tap_to_send': 'Tap to send files or long press to send a message',
            'file_received': 'File Received',
            'filename': 'Filename',
            'ask_save_files': 'Ask to save each file before downloading',
            'save': 'Save',
            'ignore': 'Ignore',
            'send_message': 'Send a Message',
            'send': 'Send',
            'cancel': 'Cancel',
            'message_received': 'Message Received',
            'copy': 'Copy',
            'close': 'Close',
            'file_transfer_completed': 'File Transfer Completed',
            'about_snapdrop': 'About DropShare',
            'easiest_way': 'The easiest way to transfer files across devices',
            'github': 'DropShare on Github',
            'cover_server_costs': 'Help cover the server costs!',
            'twitter': 'Tweet about DropShare',
            'faq': 'Frequently asked questions',
            'enable_js': 'Enable JavaScript',
            'snapdrop_js_only': 'DropShare works only with JavaScript',
            'you_discovered': 'You can be discovered by everyone on this network',
            'select_language': 'Select Language',
            'modified_by': 'Modified Node version by',
            'you_are_known_as': 'You are known as'
        }
    },
    'zh': {
        code: 'zh',
        name: '中文简体',
        rtl: false,
        translations: {
            'open_snapdrop': '在其他设备上打开DropShare以发送文件',
            'click_to_send': '点击发送文件或右键点击发送消息',
            'tap_to_send': '点击发送文件或长按发送消息',
            'file_received': '已收到文件',
            'filename': '文件名',
            'ask_save_files': '下载前询问是否保存每个文件',
            'save': '保存',
            'ignore': '忽略',
            'send_message': '发送消息',
            'send': '发送',
            'cancel': '取消',
            'message_received': '已收到消息',
            'copy': '复制',
            'close': '关闭',
            'file_transfer_completed': '文件传输完成',
            'about_snapdrop': '关于DropShare',
            'easiest_way': '跨设备传输文件的最简单方式',
            'github': 'DropShare的Github页面',
            'cover_server_costs': '帮助支付服务器费用！',
            'twitter': '在Twitter上分享DropShare',
            'faq': '常见问题',
            'enable_js': '启用JavaScript',
            'snapdrop_js_only': 'DropShare只能在启用JavaScript的情况下工作',
            'you_discovered': '此网络上的所有人都可以发现您',
            'select_language': '选择语言',
            'modified_by': '由以下开发者修改的Node版本',
            'you_are_known_as': '您的名称是'
        }
    },
    'zh-tw': {
        code: 'zh-tw',
        name: '中文繁體',
        rtl: false,
        translations: {
            'open_snapdrop': '在其他裝置上開啟DropShare以發送檔案',
            'click_to_send': '點擊發送檔案或右鍵點擊發送訊息',
            'tap_to_send': '點擊發送檔案或長按發送訊息',
            'file_received': '已收到檔案',
            'filename': '檔案名稱',
            'ask_save_files': '下載前詢問是否儲存每個檔案',
            'save': '儲存',
            'ignore': '忽略',
            'send_message': '發送訊息',
            'send': '發送',
            'cancel': '取消',
            'message_received': '已收到訊息',
            'copy': '複製',
            'close': '關閉',
            'file_transfer_completed': '檔案傳輸完成',
            'about_snapdrop': '關於DropShare',
            'easiest_way': '跨裝置傳輸檔案的最簡單方式',
            'github': 'DropShare的Github頁面',
            'cover_server_costs': '幫助支付伺服器費用！',
            'twitter': '在Twitter上分享DropShare',
            'faq': '常見問題',
            'enable_js': '啟用JavaScript',
            'snapdrop_js_only': 'DropShare只能在啟用JavaScript的情況下工作',
            'you_discovered': '此網路上的所有人都可以發現您',
            'select_language': '選擇語言',
            'modified_by': '由以下開發者修改的Node版本',
            'you_are_known_as': '您的名稱是'
        }
    },
    'ja': {
        code: 'ja',
        name: '日本語',
        rtl: false,
        translations: {
            'open_snapdrop': 'ファイルを送信するには他のデバイスでSnapdropを開いてください',
            'click_to_send': 'クリックしてファイルを送信、または右クリックしてメッセージを送信',
            'tap_to_send': 'タップしてファイルを送信、または長押ししてメッセージを送信',
            'file_received': 'ファイルを受信しました',
            'filename': 'ファイル名',
            'ask_save_files': 'ダウンロード前に各ファイルの保存を確認する',
            'save': '保存',
            'ignore': '無視',
            'send_message': 'メッセージを送信',
            'send': '送信',
            'cancel': 'キャンセル',
            'message_received': 'メッセージを受信しました',
            'copy': 'コピー',
            'close': '閉じる',
            'file_transfer_completed': 'ファイル転送が完了しました',
            'about_snapdrop': 'Snapdropについて',
            'easiest_way': 'デバイス間でファイルを転送する最も簡単な方法',
            'github': 'GitHubでSnapdrop',
            'cover_server_costs': 'サーバー費用をサポートする！',
            'twitter': 'Snapdropについてツイート',
            'faq': 'よくある質問',
            'enable_js': 'JavaScriptを有効にする',
            'snapdrop_js_only': 'SnapdropはJavaScriptが必要です',
            'you_discovered': 'このネットワーク上の全員があなたを発見できます',
            'select_language': '言語を選択',
            'modified_by': '修正されたNodeバージョン作成者：',
            'you_are_known_as': 'あなたは'
        }
    },
    'fr': {
        code: 'fr',
        name: 'Français',
        rtl: false,
        translations: {
            'open_snapdrop': 'Ouvrez Snapdrop sur d\'autres appareils pour envoyer des fichiers',
            'click_to_send': 'Cliquez pour envoyer des fichiers ou cliquez droit pour envoyer un message',
            'tap_to_send': 'Appuyez pour envoyer des fichiers ou appuyez longuement pour envoyer un message',
            'file_received': 'Fichier reçu',
            'filename': 'Nom de fichier',
            'ask_save_files': 'Demander à enregistrer chaque fichier avant de télécharger',
            'save': 'Enregistrer',
            'ignore': 'Ignorer',
            'send_message': 'Envoyer un message',
            'send': 'Envoyer',
            'cancel': 'Annuler',
            'message_received': 'Message reçu',
            'copy': 'Copier',
            'close': 'Fermer',
            'file_transfer_completed': 'Transfert de fichier terminé',
            'about_snapdrop': 'À propos de Snapdrop',
            'easiest_way': 'Le moyen le plus simple de transférer des fichiers entre appareils',
            'github': 'Snapdrop sur Github',
            'cover_server_costs': 'Aidez à couvrir les coûts du serveur !',
            'twitter': 'Tweeter à propos de Snapdrop',
            'faq': 'Foire aux questions',
            'enable_js': 'Activer JavaScript',
            'snapdrop_js_only': 'Snapdrop fonctionne uniquement avec JavaScript',
            'you_discovered': 'Vous pouvez être découvert par tout le monde sur ce réseau',
            'select_language': 'Sélectionner la langue',
            'modified_by': 'Version Node modifiée par',
            'you_are_known_as': 'Vous êtes connu sous le nom de'
        }
    },
    'es': {
        code: 'es',
        name: 'Español',
        rtl: false,
        translations: {
            'open_snapdrop': 'Abre Snapdrop en otros dispositivos para enviar archivos',
            'click_to_send': 'Haz clic para enviar archivos o clic derecho para enviar un mensaje',
            'tap_to_send': 'Toca para enviar archivos o mantén pulsado para enviar un mensaje',
            'file_received': 'Archivo recibido',
            'filename': 'Nombre del archivo',
            'ask_save_files': 'Preguntar para guardar cada archivo antes de descargar',
            'save': 'Guardar',
            'ignore': 'Ignorar',
            'send_message': 'Enviar un mensaje',
            'send': 'Enviar',
            'cancel': 'Cancelar',
            'message_received': 'Mensaje recibido',
            'copy': 'Copiar',
            'close': 'Cerrar',
            'file_transfer_completed': 'Transferencia de archivo completada',
            'about_snapdrop': 'Acerca de Snapdrop',
            'easiest_way': 'La forma más fácil de transferir archivos entre dispositivos',
            'github': 'Snapdrop en Github',
            'cover_server_costs': '¡Ayuda a cubrir los costos del servidor!',
            'twitter': 'Tuitear sobre Snapdrop',
            'faq': 'Preguntas frecuentes',
            'enable_js': 'Habilitar JavaScript',
            'snapdrop_js_only': 'Snapdrop solo funciona con JavaScript',
            'you_discovered': 'Puedes ser descubierto por todos en esta red',
            'select_language': 'Seleccionar idioma',
            'modified_by': 'Versión Node modificada por',
            'you_are_known_as': 'Te conocen como'
        }
    },
    'de': {
        code: 'de',
        name: 'Deutsch',
        rtl: false,
        translations: {
            'open_snapdrop': 'Öffne Snapdrop auf anderen Geräten, um Dateien zu senden',
            'click_to_send': 'Klicke, um Dateien zu senden oder rechtsklicke, um eine Nachricht zu senden',
            'tap_to_send': 'Tippe, um Dateien zu senden oder lange drücken, um eine Nachricht zu senden',
            'file_received': 'Datei empfangen',
            'filename': 'Dateiname',
            'ask_save_files': 'Vor dem Herunterladen nach dem Speichern jeder Datei fragen',
            'save': 'Speichern',
            'ignore': 'Ignorieren',
            'send_message': 'Nachricht senden',
            'send': 'Senden',
            'cancel': 'Abbrechen',
            'message_received': 'Nachricht empfangen',
            'copy': 'Kopieren',
            'close': 'Schließen',
            'file_transfer_completed': 'Dateiübertragung abgeschlossen',
            'about_snapdrop': 'Über Snapdrop',
            'easiest_way': 'Der einfachste Weg, Dateien zwischen Geräten zu übertragen',
            'github': 'Snapdrop auf Github',
            'cover_server_costs': 'Hilf die Serverkosten zu decken!',
            'twitter': 'Über Snapdrop twittern',
            'faq': 'Häufig gestellte Fragen',
            'enable_js': 'JavaScript aktivieren',
            'snapdrop_js_only': 'Snapdrop funktioniert nur mit JavaScript',
            'you_discovered': 'Du kannst von jedem in diesem Netzwerk entdeckt werden',
            'select_language': 'Sprache auswählen',
            'modified_by': 'Node-Version modifiziert von',
            'you_are_known_as': 'Sie werden als'
        }
    },
    'pt': {
        code: 'pt',
        name: 'Português',
        rtl: false,
        translations: {
            'open_snapdrop': 'Abra o Snapdrop em outros dispositivos para enviar arquivos',
            'click_to_send': 'Clique para enviar arquivos ou clique com o botão direito para enviar uma mensagem',
            'tap_to_send': 'Toque para enviar arquivos ou pressione longamente para enviar uma mensagem',
            'file_received': 'Arquivo recebido',
            'filename': 'Nome do arquivo',
            'ask_save_files': 'Perguntar para salvar cada arquivo antes de baixar',
            'save': 'Salvar',
            'ignore': 'Ignorar',
            'send_message': 'Enviar uma mensagem',
            'send': 'Enviar',
            'cancel': 'Cancelar',
            'message_received': 'Mensagem recebida',
            'copy': 'Copiar',
            'close': 'Fechar',
            'file_transfer_completed': 'Transferência de arquivo concluída',
            'about_snapdrop': 'Sobre o Snapdrop',
            'easiest_way': 'A maneira mais fácil de transferir arquivos entre dispositivos',
            'github': 'Snapdrop no Github',
            'cover_server_costs': 'Ajude a cobrir os custos do servidor!',
            'twitter': 'Tweetar sobre o Snapdrop',
            'faq': 'Perguntas frequentes',
            'enable_js': 'Habilitar JavaScript',
            'snapdrop_js_only': 'Snapdrop funciona apenas com JavaScript',
            'you_discovered': 'Você pode ser descoberto por todos nesta rede',
            'select_language': 'Selecionar idioma',
            'modified_by': 'Versão Node modificada por',
            'you_are_known_as': 'Você é conhecido como'
        }
    },
    'ru': {
        code: 'ru',
        name: 'Русский',
        rtl: false,
        translations: {
            'open_snapdrop': 'Откройте Snapdrop на других устройствах для отправки файлов',
            'click_to_send': 'Нажмите, чтобы отправить файлы или щелкните правой кнопкой мыши, чтобы отправить сообщение',
            'tap_to_send': 'Нажмите, чтобы отправить файлы или долгое нажатие, чтобы отправить сообщение',
            'file_received': 'Файл получен',
            'filename': 'Имя файла',
            'ask_save_files': 'Спрашивать о сохранении каждого файла перед загрузкой',
            'save': 'Сохранить',
            'ignore': 'Игнорировать',
            'send_message': 'Отправить сообщение',
            'send': 'Отправить',
            'cancel': 'Отмена',
            'message_received': 'Сообщение получено',
            'copy': 'Копировать',
            'close': 'Закрыть',
            'file_transfer_completed': 'Передача файла завершена',
            'about_snapdrop': 'О Snapdrop',
            'easiest_way': 'Самый простой способ передачи файлов между устройствами',
            'github': 'Snapdrop на Github',
            'cover_server_costs': 'Помогите покрыть расходы на сервер!',
            'twitter': 'Твитнуть о Snapdrop',
            'faq': 'Часто задаваемые вопросы',
            'enable_js': 'Включите JavaScript',
            'snapdrop_js_only': 'Snapdrop работает только с JavaScript',
            'you_discovered': 'Вас могут обнаружить все в этой сети',
            'select_language': 'Выбрать язык',
            'modified_by': 'Версия Node, модифицированная',
            'you_are_known_as': 'Вас знают как'
        }
    },
    'ar': {
        code: 'ar',
        name: 'العربية',
        rtl: true,
        translations: {
            'open_snapdrop': 'افتح Snapdrop على أجهزة أخرى لإرسال الملفات',
            'click_to_send': 'انقر لإرسال الملفات أو انقر بزر الماوس الأيمن لإرسال رسالة',
            'tap_to_send': 'اضغط لإرسال الملفات أو اضغط مطولاً لإرسال رسالة',
            'file_received': 'تم استلام الملف',
            'filename': 'اسم الملف',
            'ask_save_files': 'اسأل قبل حفظ كل ملف قبل التنزيل',
            'save': 'حفظ',
            'ignore': 'تجاهل',
            'send_message': 'إرسال رسالة',
            'send': 'إرسال',
            'cancel': 'إلغاء',
            'message_received': 'تم استلام رسالة',
            'copy': 'نسخ',
            'close': 'إغلاق',
            'file_transfer_completed': 'اكتمل نقل الملف',
            'about_snapdrop': 'حول Snapdrop',
            'easiest_way': 'أسهل طريقة لنقل الملفات بين الأجهزة',
            'github': 'Snapdrop على Github',
            'cover_server_costs': 'ساعد في تغطية تكاليف الخادم!',
            'twitter': 'غرد عن Snapdrop',
            'faq': 'الأسئلة الشائعة',
            'enable_js': 'قم بتمكين JavaScript',
            'snapdrop_js_only': 'يعمل Snapdrop فقط مع JavaScript',
            'you_discovered': 'يمكن أن يكتشفك الجميع على هذه الشبكة',
            'select_language': 'اختر اللغة',
            'modified_by': 'تم تعديل إصدار Node بواسطة',
            'you_are_known_as': 'يعرفك باسم'
        }
    },
    'ko': {
        code: 'ko',
        name: '한국어',
        rtl: false,
        translations: {
            'open_snapdrop': '파일을 보내려면 다른 장치에서 Snapdrop을 열어주세요',
            'click_to_send': '클릭하여 파일을 보내거나 마우스 오른쪽 버튼으로 클릭하여 메시지 보내기',
            'tap_to_send': '탭하여 파일을 보내거나 길게 눌러 메시지 보내기',
            'file_received': '파일 수신됨',
            'filename': '파일 이름',
            'ask_save_files': '다운로드하기 전에 각 파일 저장 여부 묻기',
            'save': '저장',
            'ignore': '무시',
            'send_message': '메시지 보내기',
            'send': '보내기',
            'cancel': '취소',
            'message_received': '메시지 수신됨',
            'copy': '복사',
            'close': '닫기',
            'file_transfer_completed': '파일 전송 완료',
            'about_snapdrop': 'Snapdrop 정보',
            'easiest_way': '장치 간에 파일을 전송하는 가장 쉬운 방법',
            'github': 'Github의 Snapdrop',
            'cover_server_costs': '서버 비용을 지원해주세요!',
            'twitter': 'Snapdrop에 대해 트윗하기',
            'faq': '자주 묻는 질문',
            'enable_js': 'JavaScript 활성화',
            'snapdrop_js_only': 'Snapdrop은 JavaScript로만 작동합니다',
            'you_discovered': '이 네트워크의 모든 사람이 당신을 발견할 수 있습니다',
            'select_language': '언어 선택',
            'modified_by': '수정된 Node 버전 작성자:',
            'you_are_known_as': '당신은'
        }
    }
};

// Get user language from browser
function getUserLanguage() {
    // Try to get language from navigator
    const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
    
    // Check if we support this language
    if (LANGUAGES[browserLang]) {
        return browserLang;
    }
    
    // Default to English
    return 'en';
}

// 当前语言
let currentLanguage = 'en';

// Function to translate the UI
function translateUI() {
    const lang = LANGUAGES[currentLanguage];
    
    // Set RTL if needed
    document.documentElement.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr');
    
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && lang.translations[key]) {
            el.textContent = lang.translations[key];
        }
    });
}

// Function to translate a key
function translate(key) {
    if (!key) return '';
    const lang = LANGUAGES[currentLanguage] || LANGUAGES['en'];
    return (lang.translations[key] || key);
}

// Function to change language
function changeLanguage(langCode) {
    // 验证语言代码是否有效
    if (!LANGUAGES[langCode]) {
        console.error(`Language ${langCode} not found, defaulting to English.`);
        langCode = 'en';
    }
    
    // 保存用户选择的语言
    localStorage.setItem('dropshare_language', langCode);
    
    // 更新全局语言变量
    currentLanguage = langCode;
    
    // 更新用户界面
    translateUI();
    
    // 触发语言变更事件，使组件可以更新其内容
    const event = new CustomEvent('language-changed', { detail: { language: langCode } });
    document.dispatchEvent(event);
    
    console.log(`Language changed to ${LANGUAGES[langCode].name}`);
}

// 初始化语言
function initLanguage() {
    // 从本地存储中获取语言设置
    const storedLang = localStorage.getItem('dropshare_language');
    
    // 获取浏览器语言
    const browserLang = getUserLanguage();
    
    // 优先使用存储的语言，其次使用浏览器语言，最后使用英语
    let initialLang = storedLang || browserLang || 'en';
    
    // 如果没有完全匹配的语言，尝试匹配前缀
    if (!LANGUAGES[initialLang]) {
        // 尝试前缀匹配（例如zh-CN => zh）
        const prefix = initialLang.split('-')[0];
        if (LANGUAGES[prefix]) {
            initialLang = prefix;
        } else {
            // 默认使用英语
            initialLang = 'en';
        }
    }
    
    // 设置当前语言并翻译UI
    currentLanguage = initialLang;
    translateUI();
    
    // 设置语言选择器的默认值
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = initialLang;
        
        // 添加语言选择器的事件监听
        selector.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }
    
    console.log(`Language initialized to ${LANGUAGES[initialLang].name}`);
}

// 对外暴露的I18N接口
window.DROPSHARE_I18N = {
    translate: function(key) {
        return translate(key);
    },
    getCurrentLanguage: function() {
        return currentLanguage;
    },
    changeLanguage: function(langCode) {
        changeLanguage(langCode);
    }
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initLanguage();
    
    // 添加语言选择器的事件监听
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }
}); 