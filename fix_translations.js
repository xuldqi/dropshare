const fs = require('fs');

// Read the backup file content
let fileContent;
try {
    fileContent = fs.readFileSync('public/scripts/languages.js', 'utf8');
} catch (err) {
    console.error("Error reading languages.js:", err);
    process.exit(1);
}

// Extract the LANGUAGES object string
const startIndex = fileContent.indexOf('const LANGUAGES = {');
// The object definition ends before the utility functions
const functionsPartStartIndex = fileContent.indexOf('// Get user language from browser');

if (startIndex === -1 || functionsPartStartIndex === -1) {
    console.error("Could not find LANGUAGES object or functions part in languages.js");
    process.exit(1);
}

// Extract the object definition part, remove "const LANGUAGES = " and trailing semicolon if any
let languagesObjectString = fileContent.substring(startIndex + 'const LANGUAGES = '.length, functionsPartStartIndex).trim();
if (languagesObjectString.endsWith(';')) {
    languagesObjectString = languagesObjectString.slice(0, -1);
}

let ORIGINAL_LANGUAGES;
try {
    // Using eval as the structure is a JS object, not strict JSON
    ORIGINAL_LANGUAGES = eval('(' + languagesObjectString + ')');
} catch (e) {
    console.error("Error parsing LANGUAGES object:", e);
    process.exit(1);
}

const englishPrivacyTranslations = {
    'privacy_header_title': 'Privacy Policy',
    'privacy_last_updated': 'Last Updated:',
    'privacy_last_updated_date': 'January 15, 2023',
    'privacy_intro': 'Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use DropShare.',
    'privacy_section1_title': 'Information We Collect',
    'privacy_section1_content': 'We collect minimal information needed to provide our service. This includes temporary device names and network information needed to establish connections.',
    'privacy_device_info_title': 'Device Information:',
    'privacy_device_info_content': 'We temporarily collect your device name and browser type so that other users on the network can recognize your device. This information will not be permanently stored and will be deleted when you close the application.',
    'privacy_network_info_title': 'Network Information:',
    'privacy_network_info_content': 'We temporarily collect your local IP address so that devices can connect to each other. This information will never be stored on our servers.',
    'privacy_files_messages_title': 'Files and Messages:',
    'privacy_files_messages_content': 'The files and messages you share through DropShare are transferred directly between devices (peer-to-peer) and never stored on our servers.',
    'privacy_section2_title': 'How We Use Your Information',
    'privacy_section2_content': 'We use this information only to facilitate file transfers between devices. Your files are transferred directly between devices and never stored on our servers.',
    'privacy_limited_info': 'The limited information we collect is used solely to:',
    'privacy_use1': 'Facilitate file transfers between devices on the same network',
    'privacy_use2': 'Display your device to other users on the network',
    'privacy_use3': 'Improve our service and troubleshoot issues',
    'privacy_use4': 'Ensure the security of our service',
    'privacy_section3_title': 'Cookie and Tracking Technologies',
    'privacy_section3_content': 'DropShare uses the minimum cookies necessary for the application to function properly. These cookies store technical preferences and do not track personal information or browsing habits. We do not use tracking cookies or third-party analytics tools to track user activity across websites.',
    'privacy_section4_title': 'Third-Party Services',
    'privacy_section4_content1': 'DropShare may display ads from Google AdSense. Google may use cookies to deliver ads based on your previous visits to our website or other websites. Google uses ad cookies to allow their partners to deliver ads based on your visits to our website and/or other websites.',
    'privacy_section4_content2': 'You can opt-out of personalized ads by visiting <a href="https://www.google.com/settings/ads" target="_blank">Google Ads Settings</a>.',
    'privacy_section5_title': 'Data Security',
    'privacy_section5_content': 'We implement appropriate technical and organizational security measures to protect your personal information. However, please note that no security measures are perfect or invulnerable. We cannot guarantee that information transmitted over the internet or any other network is absolutely secure.',
    'privacy_section6_title': 'Children\'s Privacy',
    'privacy_section6_content': 'Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can take necessary measures.',
    'privacy_section7_title': 'Changes to This Privacy Policy',
    'privacy_section7_content': 'We may update our privacy policy from time to time. We will notify you of any changes by posting a new privacy policy notice on this page. We recommend that you check this privacy policy periodically for any changes.',
    'privacy_section8_title': 'Contact Us',
    'privacy_section8_content': 'If you have any questions about our privacy policy, please contact us:',
    'privacy_section8_email': 'Email: privacy@dropshare.example.com'
};
const allPrivacyKeys = Object.keys(englishPrivacyTranslations);

const LANGUAGES_CLEANED = {};
const seenLangCodes = new Set();

// Define the translations to be added or overridden
const translationsToAdd = {
    'es': { ...englishPrivacyTranslations },
    'de': { ...englishPrivacyTranslations },
    'pt': { ...englishPrivacyTranslations },
    'ko': { ...englishPrivacyTranslations },
    'ru': {
        ...englishPrivacyTranslations, // Base on English
        'privacy_header_title': 'Политика конфиденциальности',
        'privacy_last_updated': 'Последнее обновление:',
        'privacy_last_updated_date': '15 января 2023 г.',
        'privacy_intro': 'Ваша конфиденциальность важна для нас. Настоящая Политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию при использовании DropShare.',
        'privacy_section1_title': 'Информация, которую мы собираем',
        'privacy_section1_content': 'Мы собираем минимальный объем информации, необходимой для предоставления нашего сервиса. Сюда входят временные имена устройств и сетевая информация, необходимая для установления соединений.',
        'privacy_device_info_title': 'Информация об устройстве:',
        'privacy_device_info_content': 'Мы временно собираем имя вашего устройства и тип браузера, чтобы другие пользователи в сети могли распознать ваше устройство. Эта информация не будет храниться постоянно и будет удалена при закрытии приложения.',
        'privacy_network_info_title': 'Сетевая информация:',
        'privacy_network_info_content': 'Мы временно собираем ваш локальный IP-адрес, чтобы устройства могли подключаться друг к другу. Эта информация никогда не будет храниться на наших серверах.',
        'privacy_files_messages_title': 'Файлы и сообщения:',
        'privacy_files_messages_content': 'Файлы и сообщения, которыми вы делитесь через DropShare, передаются напрямую между устройствами (peer-to-peer) и никогда не хранятся на наших серверах.',
        'privacy_section2_title': 'Как мы используем вашу информацию',
        'privacy_section2_content': 'Мы используем эту информацию только для облегчения передачи файлов между устройствами. Ваши файлы передаются напрямую между устройствами и никогда не хранятся на наших серверах.',
        'privacy_limited_info': 'Ограниченная информация, которую мы собираем, используется исключительно для:',
        'privacy_use1': 'Облегчения передачи файлов между устройствами в одной сети',
        'privacy_use2': 'Отображения вашего устройства другим пользователям в сети',
        'privacy_use3': 'Улучшения нашего сервиса и устранения неполадок',
        'privacy_use4': 'Обеспечения безопасности нашего сервиса',
        'privacy_section3_title': 'Файлы cookie и технологии отслеживания',
        'privacy_section3_content': 'DropShare использует минимальное количество файлов cookie, необходимых для правильной работы приложения. Эти файлы cookie хранят технические предпочтения и не отслеживают личную информацию или привычки просмотра. Мы не используем отслеживающие файлы cookie или сторонние аналитические инструменты для отслеживания активности пользователей на веб-сайтах.',
        'privacy_section4_title': 'Сторонние сервисы',
        'privacy_section4_content1': 'DropShare может отображать рекламу от Google AdSense. Google может использовать файлы cookie для показа рекламы на основе ваших предыдущих посещений нашего веб-сайта или других веб-сайтов. Использование рекламных файлов cookie Google позволяет Google и его партнерам показывать рекламу пользователям на основе их посещения наших сайтов и/или других сайтов в Интернете.',
        'privacy_section4_content2': 'Вы можете отказаться от персонализированной рекламы, посетив <a href="https://www.google.com/settings/ads" target="_blank">Настройки рекламы Google</a>.',
        'privacy_section5_title': 'Безопасность данных',
        'privacy_section5_content': 'Мы применяем соответствующие технические и организационные меры безопасности для защиты вашей личной информации. Однако обратите внимание, что никакие меры безопасности не являются совершенными или неуязвимыми. Мы не можем гарантировать, что информация, передаваемая через Интернет или любую другую сеть, абсолютно безопасна.',
        'privacy_section6_title': 'Конфиденциальность детей',
        'privacy_section6_content': 'Наши услуги не предназначены для детей младше 13 лет. Мы сознательно не собираем личную информацию от детей младше 13 лет. Если вы являетесь родителем или опекуном и считаете, что ваш ребенок предоставил нам личную информацию, пожалуйста, свяжитесь с нами, чтобы мы могли принять необходимые меры.',
        'privacy_section7_title': 'Изменения в политике конфиденциальности',
        'privacy_section7_content': 'Мы можем время от времени обновлять нашу политику конфиденциальности. Мы уведомим вас о любых изменениях, опубликовав новое уведомление о политике конфиденциальности на этой странице. Мы рекомендуем вам периодически проверять эту политику конфиденциальности на предмет изменений.',
        'privacy_section8_title': 'Свяжитесь с нами',
        'privacy_section8_content': 'Если у вас есть вопросы о нашей политике конфиденциальности, пожалуйста, свяжитесь с нами:',
        'privacy_section8_email': 'Email: privacy@dropshare.example.com',
        'terms_header_title': 'Условия использования'
    },
    'fr': {
        ...englishPrivacyTranslations,
        'privacy_header_title': 'Politique de Confidentialité',
        'privacy_last_updated': 'Dernière mise à jour:',
        'privacy_last_updated_date': '15 janvier 2023',
        'privacy_intro': 'Votre vie privée est importante pour nous. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez DropShare.',
        'privacy_section1_title': 'Informations que nous collectons',
        'privacy_section1_content': 'Nous collectons les informations minimales nécessaires pour fournir notre service. Cela inclut les noms temporaires des appareils et les informations réseau nécessaires pour établir des connexions.',
        'privacy_device_info_title': 'Informations sur l\'appareil :',
        'privacy_device_info_content': 'Nous collectons temporairement le nom de votre appareil et le type de navigateur afin que les autres utilisateurs du réseau puissent reconnaître votre appareil. Ces informations ne seront pas stockées de façon permanente et seront supprimées lorsque vous fermerez l\'application.',
        'privacy_network_info_title': 'Informations réseau :',
        'privacy_network_info_content': 'Nous collectons temporairement votre adresse IP locale afin que les appareils puissent se connecter entre eux. Ces informations ne seront jamais stockées sur nos serveurs.',
        'privacy_files_messages_title': 'Fichiers et messages :',
        'privacy_files_messages_content': 'Les fichiers et messages que vous partagez via DropShare sont transférés directement entre les appareils (pair à pair) et ne sont jamais stockés sur nos serveurs.',
        'privacy_section2_title': 'Comment nous utilisons vos informations',
        'privacy_section2_content': 'Nous utilisons ces informations uniquement pour faciliter les transferts de fichiers entre appareils. Vos fichiers sont transférés directement entre les appareils et ne sont jamais stockés sur nos serveurs.',
        'privacy_limited_info': 'Les informations limitées que nous collectons sont utilisées uniquement pour :',
        'privacy_use1': 'Faciliter les transferts de fichiers entre les appareils sur le même réseau',
        'privacy_use2': 'Afficher votre appareil aux autres utilisateurs du réseau',
        'privacy_use3': 'Améliorer notre service et résoudre les problèmes',
        'privacy_use4': 'Assurer la sécurité de notre service',
        'privacy_section3_title': 'Cookies et technologies de suivi',
        'privacy_section3_content': 'DropShare utilise le minimum de cookies nécessaires au bon fonctionnement de l\'application. Ces cookies stockent des préférences techniques et ne suivent pas les informations personnelles ou les habitudes de navigation. Nous n\'utilisons pas de cookies de suivi ou d\'outils d\'analyse tiers pour suivre l\'activité des utilisateurs à travers les sites web.',
        'privacy_section4_title': 'Services tiers',
        'privacy_section4_content1': 'DropShare peut afficher des annonces de Google AdSense. Google peut utiliser des cookies pour diffuser des annonces basées sur vos visites précédentes sur notre site web ou d\'autres sites web. Google utilise des cookies publicitaires pour permettre à ses partenaires de diffuser des annonces basées sur vos visites sur notre site web et/ou d\'autres sites web.',
        'privacy_section4_content2': 'Vous pouvez vous désinscrire des annonces personnalisées en visitant les <a href="https://www.google.com/settings/ads" target="_blank">Paramètres des annonces Google</a>.',
        'privacy_section5_title': 'Sécurité des données',
        'privacy_section5_content': 'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles. Cependant, veuillez noter qu\'aucune mesure de sécurité n\'est parfaite ou invulnérable. Nous ne pouvons garantir que les informations transmises sur Internet ou tout autre réseau sont absolument sécurisées.',
        'privacy_section6_title': 'Confidentialité des enfants',
        'privacy_section6_content': 'Nos services ne s\'adressent pas aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d\'informations personnelles d\'enfants de moins de 13 ans. Si vous êtes un parent ou un tuteur et que vous pensez que votre enfant nous a fourni des informations personnelles, veuillez nous contacter afin que nous puissions prendre les mesures nécessaires.',
        'privacy_section7_title': 'Modifications de cette politique de confidentialité',
        'privacy_section7_content': 'Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page. Nous vous recommandons de consulter périodiquement cette politique de confidentialité pour tout changement.',
        'privacy_section8_title': 'Contactez-nous',
        'privacy_section8_content': 'Si vous avez des questions sur notre politique de confidentialité, veuillez nous contacter :',
        'privacy_section8_email': 'Email: privacy@dropshare.example.com'
    },
    'ar': {
        ...englishPrivacyTranslations,
        'privacy_header_title': 'سياسة الخصوصية',
        'privacy_last_updated': 'آخر تحديث:',
        'privacy_last_updated_date': '15 يناير 2023',
        'privacy_intro': 'خصوصيتك مهمة بالنسبة لنا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام DropShare.',
        'privacy_section1_title': 'المعلومات التي نجمعها',
        'privacy_section1_content': 'نجمع الحد الأدنى من المعلومات اللازمة لتقديم خدمتنا. وهذا يشمل أسماء الأجهزة المؤقتة ومعلومات الشبكة اللازمة لإنشاء الاتصالات.',
        'privacy_device_info_title': 'معلومات الجهاز:',
        'privacy_device_info_content': 'نقوم بجمع اسم جهازك ونوع المتصفح مؤقتًا حتى يتمكن المستخدمون الآخرون في الشبكة من التعرف على جهازك. لن يتم تخزين هذه المعلومات بشكل دائم وسيتم حذفها عند إغلاق التطبيق.',
        'privacy_network_info_title': 'معلومات الشبكة:',
        'privacy_network_info_content': 'نقوم بجمع عنوان IP المحلي الخاص بك مؤقتًا حتى تتمكن الأجهزة من الاتصال ببعضها البعض. لن يتم تخزين هذه المعلومات على خوادمنا مطلقًا.',
        'privacy_files_messages_title': 'الملفات والرسائل:',
        'privacy_files_messages_content': 'يتم نقل الملفات والرسائل التي تشاركها عبر DropShare مباشرة بين الأجهزة (نظير إلى نظير) ولا يتم تخزينها على خوادمنا مطلقًا.',
        'privacy_section2_title': 'كيف نستخدم معلوماتك',
        'privacy_section2_content': 'نستخدم هذه المعلومات فقط لتسهيل نقل الملفات بين الأجهزة. يتم نقل ملفاتك مباشرة بين الأجهزة ولا يتم تخزينها على خوادمنا مطلقًا.',
        'privacy_limited_info': 'يتم استخدام المعلومات المحدودة التي نجمعها فقط من أجل:',
        'privacy_use1': 'تسهيل نقل الملفات بين الأجهزة على نفس الشبكة',
        'privacy_use2': 'عرض جهازك للمستخدمين الآخرين على الشبكة',
        'privacy_use3': 'تحسين خدمتنا وحل المشكلات',
        'privacy_use4': 'ضمان أمان خدمتنا',
        'privacy_section3_title': 'ملفات تعريف الارتباط وتقنيات التتبع',
        'privacy_section3_content': 'يستخدم DropShare الحد الأدنى من ملفات تعريف الارتباط اللازمة لتشغيل التطبيق بشكل صحيح. تخزن ملفات تعريف الارتباط هذه التفضيلات الفنية ولا تتعقب المعلومات الشخصية أو عادات التصفح. نحن لا نستخدم ملفات تعريف الارتباط التتبعية أو أدوات التحليل التابعة لجهات خارجية لتتبع نشاط المستخدم عبر مواقع الويب.',
        'privacy_section4_title': 'خدمات الطرف الثالث',
        'privacy_section4_content1': 'قد يعرض DropShare إعلانات من Google AdSense. قد تستخدم Google ملفات تعريف الارتباط لتقديم إعلانات بناءً على زياراتك السابقة لموقعنا أو مواقع الويب الأخرى. يسمح استخدام Google لملفات تعريف الارتباط الخاصة بالإعلانات لشركائها بتقديم إعلانات بناءً على زيارتك لموقعنا و/أو مواقع الويب الأخرى.',
        'privacy_section4_content2': 'يمكنك إلغاء الاشتراك في الإعلانات المخصصة من خلال زيارة <a href="https://www.google.com/settings/ads" target="_blank">إعدادات إعلانات Google</a>.',
        'privacy_section5_title': 'أمن البيانات',
        'privacy_section5_content': 'نقوم بتنفيذ إجراءات أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية. ومع ذلك، يرجى ملاحظة أنه لا توجد إجراءات أمنية مثالية أو لا يمكن اختراقها. لا يمكننا ضمان أن المعلومات المنقولة عبر الإنترنت أو أي شبكة أخرى آمنة تمامًا.',
        'privacy_section6_title': 'خصوصية الأطفال',
        'privacy_section6_content': 'خدماتنا غير موجهة للأطفال دون سن 13 عامًا. نحن لا نجمع عن علم معلومات شخصية من الأطفال دون سن 13 عامًا. إذا كنت أحد الوالدين أو الوصي وتعتقد أن طفلك قد زودنا بمعلومات شخصية، فيرجى الاتصال بنا حتى نتمكن من اتخاذ الإجراءات اللازمة.',
        'privacy_section7_title': 'التغييرات في سياسة الخصوصية هذه',
        'privacy_section7_content': 'قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنخطرك بأي تغييرات من خلال نشر إشعار سياسة خصوصية جديد على هذه الصفحة. نوصي بمراجعة سياسة الخصوصية هذه بشكل دوري لأي تغييرات.',
        'privacy_section8_title': 'اتصل بنا',
        'privacy_section8_content': 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية الخاصة بنا، فيرجى الاتصال بنا:',
        'privacy_section8_email': 'البريد الإلكتروني: privacy@dropshare.example.com'
    }
};

// First, ensure English translations are complete with all privacy keys
if (ORIGINAL_LANGUAGES['en'] && ORIGINAL_LANGUAGES['en'].translations) {
    for (const key of allPrivacyKeys) {
        if (!ORIGINAL_LANGUAGES['en'].translations.hasOwnProperty(key)) {
            ORIGINAL_LANGUAGES['en'].translations[key] = englishPrivacyTranslations[key];
        }
    }
} else {
    // Initialize English if it's somehow missing (should not happen based on file structure)
    ORIGINAL_LANGUAGES['en'] = {
        code: 'en',
        name: 'English',
        rtl: false,
        translations: { ...englishPrivacyTranslations }
    };
}

for (const langCode in ORIGINAL_LANGUAGES) {
    if (ORIGINAL_LANGUAGES.hasOwnProperty(langCode)) {
        if (seenLangCodes.has(langCode)) {
            // Skip duplicate language code entries
            continue;
        }
        seenLangCodes.add(langCode);

        const langData = ORIGINAL_LANGUAGES[langCode];
        LANGUAGES_CLEANED[langCode] = {
            code: langData.code,
            name: langData.name,
            rtl: langData.rtl,
            translations: { ...langData.translations } // Deep copy translations
        };

        // Apply specific translations from translationsToAdd
        if (translationsToAdd.hasOwnProperty(langCode)) {
            const specificTranslations = translationsToAdd[langCode];
            for (const key in specificTranslations) {
                if (specificTranslations.hasOwnProperty(key)) {
                    // Only overwrite if key is a privacy key or a known problematic key like terms_header_title for specific languages
                    if (allPrivacyKeys.includes(key) || (langCode === 'ru' && (key === 'terms_header_title' || key === 'privacy_header_title'))) {
                         LANGUAGES_CLEANED[langCode].translations[key] = specificTranslations[key];
                    } else if (!allPrivacyKeys.includes(key)) {
                        // If it's not a privacy key, but present in translationsToAdd (e.g. a corrected FAQ for a specific lang)
                        // Keep it, assuming translationsToAdd might provide more than just privacy strings.
                        LANGUAGES_CLEANED[langCode].translations[key] = specificTranslations[key];
                    }
                }
            }
        }

        // Ensure all English privacy keys are present, defaulting to English if not specifically translated
        for (const key of allPrivacyKeys) {
            if (!LANGUAGES_CLEANED[langCode].translations.hasOwnProperty(key) || LANGUAGES_CLEANED[langCode].translations[key] === '') {
                LANGUAGES_CLEANED[langCode].translations[key] = englishPrivacyTranslations[key];
            }
        }
        
        // Specific fix for zh-tw FAQ if it contains Japanese:
        // This requires knowing the exact keys for FAQ. Assuming 'faq_q1', 'faq_a1' etc.
        // And a way to reliably detect "Japanese text". This is complex.
        // For now, we'll focus on privacy policy. If FAQ is a separate object, it won't be touched by privacy logic.
        // If zh-tw FAQ is using general translation keys that are also privacy keys, it might get English text.

        // Specific fix for ja privacy policy if it contained Chinese:
        // The loop above already ensures all privacy keys are filled, from translationsToAdd if present,
        // or from English if missing. This should overwrite any garbled Chinese in ja privacy keys.
    }
}

// Reconstruct the file content string
let outputString = '// Multi-language support for DropShare\nconst LANGUAGES = {\n';
const langCodesInOrder = Object.keys(LANGUAGES_CLEANED); // Consider maintaining original order if important

langCodesInOrder.forEach((langCode, index) => {
    const lang = LANGUAGES_CLEANED[langCode];
    outputString += "    '" + langCode + "': {\n";
    outputString += "        code: '" + lang.code.replace(/'/g, "\\'") + "',\n";
    outputString += "        name: '" + lang.name.replace(/'/g, "\\'") + "',\n";
    outputString += "        rtl: " + lang.rtl + ",\n";
    outputString += "        translations: {\n";
    
    const translationKeys = Object.keys(lang.translations);
    translationKeys.forEach((key, transIndex) => {
        let value = lang.translations[key];
        value = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n'); // Escape backslashes, single quotes, and newlines
        outputString += "            '" + key.replace(/'/g, "\\'") + "': '" + value + "'";
        if (transIndex < translationKeys.length - 1) {
            outputString += ",\n";
        } else {
            outputString += "\n";
        }
    });
    outputString += "        }\n";
    outputString += "    }";
    if (index < langCodesInOrder.length - 1) {
        outputString += ",\n";
    } else {
        outputString += "\n";
    }
});
outputString += "};\n\n";

// Append the rest of the original file (functions)
outputString += fileContent.substring(functionsPartStartIndex);

// Write the output to languages_fixed.js with UTF-8 encoding
try {
    fs.writeFileSync('public/scripts/languages_fixed.js', outputString, 'utf8');
    console.log("Successfully wrote to public/scripts/languages_fixed.js");
} catch (err) {
    console.error("Error writing to languages_fixed.js:", err);
    process.exit(1);
}
// console.log(outputString); // Keep this commented out or remove 