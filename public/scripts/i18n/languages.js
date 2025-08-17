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
            
            // Transfer History
            'transfer_history': 'Transfer History',
            'history': 'History',
            'no_history': 'No transfer history yet',
            'search_history': 'Search history...',
            'filter_all': 'All',
            'filter_sent': 'Sent',
            'filter_received': 'Received',
            'filter_files': 'Files',
            'filter_messages': 'Messages',
            'sort_by': 'Sort by',
            'sort_time_desc': 'Latest first',
            'sort_time_asc': 'Oldest first',
            'sort_size_desc': 'Largest first',
            'sort_size_asc': 'Smallest first',
            'sort_name_asc': 'Name A-Z',
            'sort_name_desc': 'Name Z-A',
            'total_transfers': 'Total Transfers',
            'total_size': 'Total Size',
            'most_common_type': 'Most Common Type',
            'export_history': 'Export History',
            'clear_history': 'Clear History',
            'confirm_clear': 'Are you sure you want to clear all transfer history?',
            'export_json': 'Export as JSON',
            'export_csv': 'Export as CSV',
            'sent_to': 'Sent to',
            'received_from': 'Received from',
            'file_size': 'Size',
            'transfer_time': 'Time',
            'transfer_status': 'Status',
            'status_completed': 'Completed',
            'status_failed': 'Failed',
            'status_cancelled': 'Cancelled',
            'message_content': 'Message',
            
            // Basic app info
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
            'you_are_known_as': 'You are known as',
            
            // Navigation menu items
            'nav_send': 'Send',
            'nav_converter': 'Convert',
            'nav_history': 'History',
            'nav_room': 'Private Room',
            'nav_analytics': 'Analytics',
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
            
            // Homepage content
            'hero_title': 'Fast Local File Sharing Across Devices on Your Network',
            'hero_subtitle': 'Instantly share files with nearby devices. No setup required, completely peer-to-peer.',
            'btn_start_sharing': 'Start Sharing Files',
            'btn_multiuser_rooms': 'Multi-user Rooms',
            'section_choose_category': 'Choose Your Tool Category',
            'section_choose_description': 'Select from our comprehensive collection of tools organized by category',
            
            // Page titles
            'about_page_title': 'About DropShare - Easy File Sharing',
            'faq_page_title': 'Frequently Asked Questions - DropShare',
            'blog_page_title': 'DropShare Blog - File Sharing Tips and News',
            'privacy_page_title': 'Privacy Policy - DropShare',
            'terms_page_title': 'Terms of Service - DropShare',
            
            // About page
            'about_header_title': 'About DropShare',
            'about_what_is_title': 'What is DropShare?',
            'about_what_is_p1': 'DropShare is a modern web application that allows you to easily share files between devices on the same network. No setup, no signup, no cloud storage needed - just instant peer-to-peer file sharing.',
            'about_how_it_works_title': 'How It Works',
            'about_how_it_works_p1': 'DropShare uses WebRTC technology to establish a direct connection between devices. Your files are transferred directly from one device to another without going through a server, ensuring privacy and speed.',
            'about_no_setup_title': 'No Setup Required',
            'about_no_setup_p1': 'Just open DropShare in your browser and start sharing files immediately. No account creation or software installation needed.',
            'about_privacy_focused_title': 'Privacy Focused',
            'about_privacy_focused_p1': 'All transfers are peer-to-peer, meaning your files are never stored on our servers. Your data remains private and secure.',
            'about_cross_platform_title': 'Cross-Platform',
            'about_cross_platform_p1': 'Works on all modern devices and browsers including smartphones, tablets, and computers running Windows, macOS, Linux, iOS, or Android.',
            'about_fast_transfers_title': 'Fast Transfers',
            'about_fast_transfers_p1': 'Direct device-to-device connection means faster transfer speeds than cloud-based services.',
            'about_how_to_use_title': 'How to Use DropShare',
            'about_step1_title': 'Step 1: Connect Devices',
            'about_step1_p1': 'Make sure all devices are connected to the same Wi-Fi network or local area network.',
            'about_step2_title': 'Step 2: Open DropShare',
            'about_step2_p1': 'Open DropShare on all devices you want to share files between. Just visit the website in your browser.',
            'about_step3_title': 'Step 3: Select Device',
            'about_step3_p1': 'You\'ll see all available devices on the network. Click on the device you want to send files to.',
            'about_step4_title': 'Step 4: Send Files',
            'about_step4_p1': 'Select the files you want to share. The recipient will get a notification and can accept the transfer.',
            'about_back_button': 'Back to DropShare',
            
            // FAQ page
            'faq_header_title': 'Frequently Asked Questions',
            'faq_general_category': 'General Questions',
            'faq_technical_category': 'Technical Questions',
            'faq_q1': 'What is DropShare?',
            'faq_a1': 'DropShare is a web application that allows you to easily share files between devices connected to the same network. It uses WebRTC technology to create a direct connection between devices, allowing for fast and secure file transfers without storing your files on any server.',
            'faq_q2': 'How does DropShare work?',
            'faq_a2': 'DropShare works by creating a local peer-to-peer connection between devices on the same network. When you open DropShare in your browser, it automatically discovers other devices running DropShare on the same network. You can then select a device and send files or messages directly to it.',
            'faq_q3': 'Is DropShare free to use?',
            'faq_a3': 'Yes, DropShare is completely free to use. There are no hidden fees, subscriptions, or premium features. The service is supported by minimal non-intrusive advertisements.',
            'faq_q4': 'Do I need to create an account to use DropShare?',
            'faq_a4': 'No, DropShare works without accounts, logins, or any setup. Just open the website on your devices and start sharing files immediately.',
            'faq_q5': 'Can I use DropShare on mobile devices?',
            'faq_a5': 'Yes, DropShare works on smartphones and tablets that have a modern browser. It works on iOS, Android, and other mobile platforms.',
            'faq_q6': 'Which browsers are supported?',
            'faq_a6': 'DropShare works with most modern browsers including Chrome, Firefox, Safari, and Edge. For best performance, we recommend using the latest version of your browser.',
            'faq_q7': 'Can I use DropShare if devices are on different networks?',
            'faq_a7': 'DropShare is designed to work between devices on the same local network. If you need to transfer files between devices on different networks, you might want to consider alternatives like email, cloud storage services, or dedicated file transfer tools.',
            
            // Blog page
            'blog_header_title': 'Blog',
            'blog_subtitle': 'File Sharing Tips and News',
            'blog_post1_title': 'Introducing DropShare: Easy File Sharing',
            'blog_post1_date': 'January 10, 2023',
            'blog_post1_content': 'Welcome to DropShare, a modern way to share files between devices. Our mission is to make file sharing as simple and secure as possible.',
            'blog_post2_title': 'Security Features in DropShare',
            'blog_post2_date': 'February 15, 2023',
            'blog_post2_content': 'Security is a top priority for DropShare. In this post, we explain how our peer-to-peer technology keeps your data private and secure.',
            
            // Privacy page
            'privacy_header_title': 'Privacy Policy',
            'privacy_last_updated': 'Last Updated:',
            'privacy_intro': 'Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use DropShare.',
            'privacy_section1_title': 'Information We Collect',
            'privacy_section1_content': 'We collect minimal information needed to provide our service. This includes temporary device names and network information needed to establish connections.',
            'privacy_section2_title': 'How We Use Your Information',
            'privacy_section2_content': 'We use this information only to facilitate file transfers between devices. Your files are transferred directly between devices and never stored on our servers.',
            'privacy_device_info_title': 'Device Information:',
            'privacy_device_info_content': 'We temporarily collect your device name and browser type so that other users on the network can recognize your device. This information will not be permanently stored and will be deleted when you close the application.',
            'privacy_network_info_title': 'Network Information:',
            'privacy_network_info_content': 'We temporarily collect your local IP address so that devices can connect to each other. This information will never be stored on our servers.',
            'privacy_files_messages_title': 'Files and Messages:',
            'privacy_files_messages_content': 'The files and messages you share through DropShare are transferred directly between devices (peer-to-peer) and never stored on our servers.',
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
            'privacy_section8_email': 'Email: privacy@dropshare.example.com',
            
            // Terms page
            'terms_header_title': 'Terms of Service',
            'terms_last_updated': 'Last Updated:',
            'terms_last_updated_date': 'January 15, 2023',
            'terms_intro': 'Please read these Terms of Service carefully before using DropShare.',
            'terms_section1_title': 'Acceptance of Terms',
            'terms_section1_content': 'By using DropShare, you agree to be bound by these Terms of Service and our Privacy Policy.',
            'terms_section2_title': 'Use of Service',
            'terms_section2_content': 'DropShare is provided for lawful purposes only. You are responsible for all content transferred using our service.',
            'terms_section3_title': '3. User Responsibilities',
            'terms_section3_intro': 'As a user of DropShare, you agree to:',
            'terms_section3_item1': 'Use the service in compliance with all applicable laws and regulations.',
            'terms_section3_item2': 'Not use the service to transfer illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable material.',
            'terms_section3_item3': 'Not attempt to access any other user\'s device without permission.',
            'terms_section3_item4': 'Not use the service to distribute malware, viruses, or any other malicious code.',
            'terms_section3_item5': 'Respect the privacy and rights of other users.',
            'terms_section3_item6': 'Accept full responsibility for all files you share through the service.',
            'terms_section4_title': '4. Intellectual Property Rights',
            'terms_section4_content1': 'You retain all ownership rights to the files you share through DropShare. However, by using the service, you grant us the right to facilitate the transfer of your files between devices as requested by you.',
            'terms_section4_content2': 'The DropShare name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of DropShare or its affiliates. You must not use such marks without the prior written permission of DropShare.',
            'terms_section5_title': '5. Disclaimer of Warranties',
            'terms_section5_content1': 'THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. DROPSHARE MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
            'terms_section5_content2': 'DROPSHARE DOES NOT WARRANT THAT:',
            'terms_section5_item1': 'THE SERVICE WILL FUNCTION UNINTERRUPTED, SECURE, OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION;',
            'terms_section5_item2': 'ANY ERRORS OR DEFECTS WILL BE CORRECTED;',
            'terms_section5_item3': 'THE SERVICE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS;',
            'terms_section5_item4': 'THE RESULTS OF USING THE SERVICE WILL MEET YOUR REQUIREMENTS.',
            'terms_section6_title': '6. Limitation of Liability',
            'terms_section6_content': 'IN NO EVENT SHALL DROPSHARE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:',
            'terms_section6_item1': 'YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE;',
            'terms_section6_item2': 'ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE;',
            'terms_section6_item3': 'ANY CONTENT OBTAINED FROM THE SERVICE; AND',
            'terms_section6_item4': 'UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.',
            'terms_section7_title': '7. Indemnification',
            'terms_section7_content': 'You agree to defend, indemnify, and hold harmless DropShare and its licensees and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney\'s fees) arising from your use of and access to the Service.',
            'terms_section8_title': '8. Termination',
            'terms_section8_content': 'We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.',
            'terms_section9_title': '9. Changes to Terms',
            'terms_section9_content': 'We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.',
            'terms_section10_title': '10. Contact Us',
            'terms_section10_content': 'If you have any questions about these Terms, please contact us at:',
            'terms_section10_email': 'Email: support@dropshare.example.com',
            
            // Private Rooms
            'private_rooms': 'Private Rooms',
            'create_room': 'Create Room',
            'join_room': 'Join Room',
            'room_code': 'Room Code',
            'room_name': 'Room Name',
            'room_settings': 'Room Settings',
            'room_members': 'Room Members',
            'leave_room': 'Leave Room',
            'copy_room_code': 'Copy Room Code',
            'room_created': 'Room Created Successfully',
            'room_joined': 'Joined Room Successfully',
            'room_left': 'Left Room',
            'invalid_room_code': 'Invalid Room Code',
            'room_not_found': 'Room Not Found',
            'room_full': 'Room is Full',
            'enter_room_code': 'Enter Room Code',
            'enter_room_name': 'Enter Room Name (Optional)',
            'create': 'Create',
            'join': 'Join',
            'recent_rooms': 'Recent Rooms'
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
            
            // Transfer History
            'transfer_history': '传输历史',
            'history': '历史',
            'no_history': '暂无传输历史',
            'search_history': '搜索历史...',
            'filter_all': '全部',
            'filter_sent': '已发送',
            'filter_received': '已接收',
            'filter_files': '文件',
            'filter_messages': '消息',
            'sort_by': '排序方式',
            'sort_time_desc': '最新优先',
            'sort_time_asc': '最旧优先',
            'sort_size_desc': '最大优先',
            'sort_size_asc': '最小优先',
            'sort_name_asc': '名称A-Z',
            'sort_name_desc': '名称Z-A',
            'total_transfers': '总传输次数',
            'total_size': '总传输大小',
            'most_common_type': '最常见类型',
            'export_history': '导出历史',
            'clear_history': '清空历史',
            'confirm_clear': '确定要清空所有传输历史吗？',
            'export_json': '导出为JSON',
            'export_csv': '导出为CSV',
            'sent_to': '发送给',
            'received_from': '接收自',
            'file_size': '大小',
            'transfer_time': '时间',
            'transfer_status': '状态',
            'status_completed': '已完成',
            'status_failed': '失败',
            'status_cancelled': '已取消',
            'message_content': '消息内容',
            
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
            'you_are_known_as': '您的名称是',
            
            // Navigation menu items
            'nav_send': '发送',
            'nav_converter': '转换',
            'nav_history': '历史',
            'nav_room': '私人房间',
            'nav_analytics': '统计',
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
            
            // 首页内容
            'hero_title': '快速本地文件共享，连接您网络中的所有设备',
            'hero_subtitle': '与附近设备即时分享文件。无需设置，完全点对点传输。',
            'btn_start_sharing': '开始文件分享',
            'btn_multiuser_rooms': '多人房间',
            'section_choose_category': '选择您的工具类别',
            'section_choose_description': '从我们按类别组织的综合工具集合中选择',
            
            // 页面标题
            'faq_page_title': '常见问题 - DropShare',
            'blog_page_title': 'DropShare博客 - 文件共享技巧和新闻',
            'privacy_page_title': '隐私政策 - DropShare',
            'terms_page_title': '服务条款 - DropShare',
            
            // FAQ页面
            'faq_header_title': '常见问题',
            'faq_general_category': '一般问题',
            'faq_technical_category': '技术问题',
            'faq_q1': 'DropShare是什么？',
            'faq_a1': 'DropShare是一款Web应用程序，可让您在连接到同一网络的设备之间轻松共享文件。它使用WebRTC技术在设备之间创建直接连接，无需将文件存储在任何服务器上，即可实现快速安全的文件传输。',
            'faq_q2': 'DropShare是如何工作的？',
            'faq_a2': 'DropShare通过在同一网络上的设备之间创建本地点对点连接来工作。当您在浏览器中打开DropShare时，它会自动发现同一网络上运行DropShare的其他设备。然后，您可以选择一个设备，并直接向其发送文件或消息。',
            'faq_q3': 'DropShare是免费使用的吗？',
            'faq_a3': '是的，DropShare完全免费使用。没有隐藏费用、订阅或高级功能。该服务由最小的非侵入性广告支持。',
            'faq_q4': '我需要创建账户才能使用DropShare吗？',
            'faq_a4': '不需要，DropShare无需账户、登录或任何设置即可工作。只需在设备上打开网站即可立即开始共享文件。',
            'faq_q5': '我可以在移动设备上使用DropShare吗？',
            'faq_a5': '是的，DropShare可在拥有现代浏览器的智能手机和平板电脑上使用。它适用于iOS、Android和其他移动平台。',
            'faq_q6': '支持哪些浏览器？',
            'faq_a6': 'DropShare可以在大多数现代浏览器上运行，包括Chrome、Firefox、Safari和Edge。为获得最佳性能，我们建议使用最新版本的浏览器。',
            'faq_q7': '如果设备在不同的网络上，我可以使用DropShare吗？',
            'faq_a7': 'DropShare设计为在同一本地网络上的设备之间工作。如果您需要在不同网络上的设备之间传输文件，您可能需要考虑其他选择，如电子邮件、云存储服务或专用文件传输工具。',
            
            // Private Rooms
            'private_rooms': '私密房间',
            'create_room': '创建房间',
            'join_room': '加入房间',
            'room_code': '房间代码',
            'room_name': '房间名称',
            'room_settings': '房间设置',
            'room_members': '房间成员',
            'leave_room': '离开房间',
            'copy_room_code': '复制房间代码',
            'room_created': '房间创建成功',
            'room_joined': '成功加入房间',
            'room_left': '已离开房间',
            'invalid_room_code': '无效的房间代码',
            'room_not_found': '未找到房间',
            'room_full': '房间已满',
            'enter_room_code': '输入房间代码',
            'enter_room_name': '输入房间名称（可选）',
            'create': '创建',
            'join': '加入',
            'recent_rooms': '最近的房间'
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
            
            // Transfer History
            'transfer_history': '傳輸歷史',
            'history': '歷史',
            'no_history': '暫無傳輸歷史',
            'search_history': '搜尋歷史...',
            'filter_all': '全部',
            'filter_sent': '已發送',
            'filter_received': '已接收',
            'filter_files': '檔案',
            'filter_messages': '訊息',
            'sort_by': '排序方式',
            'sort_time_desc': '最新優先',
            'sort_time_asc': '最舊優先',
            'sort_size_desc': '最大優先',
            'sort_size_asc': '最小優先',
            'sort_name_asc': '名稱A-Z',
            'sort_name_desc': '名稱Z-A',
            'total_transfers': '總傳輸次數',
            'total_size': '總傳輸大小',
            'most_common_type': '最常見類型',
            'export_history': '匯出歷史',
            'clear_history': '清空歷史',
            'confirm_clear': '確定要清空所有傳輸歷史嗎？',
            'export_json': '匯出為JSON',
            'export_csv': '匯出為CSV',
            'sent_to': '發送給',
            'received_from': '接收自',
            'file_size': '大小',
            'transfer_time': '時間',
            'transfer_status': '狀態',
            'status_completed': '已完成',
            'status_failed': '失敗',
            'status_cancelled': '已取消',
            'message_content': '訊息內容',
            
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
            'you_are_known_as': '您的名稱是',
            
            // Navigation menu items
            'nav_send': '發送',
            'nav_converter': '轉換',
            'nav_history': '歷史',
            'nav_room': '私人房間',
            'nav_analytics': '統計',
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
            
            // 首頁內容
            'hero_title': '快速本地文件共享，連接您網路中的所有裝置',
            'hero_subtitle': '與附近裝置即時分享文件。無需設置，完全點對點傳輸。',
            'btn_start_sharing': '開始文件分享',
            'btn_multiuser_rooms': '多人房間',
            'section_choose_category': '選擇您的工具類別',
            'section_choose_description': '從我們按類別組織的綜合工具集合中選擇',
            
            // Private rooms
            'private_rooms': '私人房間',
            'create_room': '創建房間',
            'join_room': '加入房間',
            'room_code': '房間代碼',
            'room_name': '房間名稱',
            'room_settings': '房間設置',
            'room_members': '房間成員',
            'leave_room': '離開房間',
            'copy_room_code': '複製房間代碼',
            'room_created': '房間創建成功',
            'room_joined': '成功加入房間',
            'room_left': '已離開房間',
            'invalid_room_code': '無效的房間代碼',
            'room_not_found': '未找到房間',
            'room_full': '房間已滿',
            'enter_room_code': '輸入房間代碼',
            'enter_room_name': '輸入房間名稱（可選）',
            'create': '創建',
            'join': '加入',
            'recent_rooms': '最近的房間'
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

// Current language
let currentLanguage = 'en';

// Translate UI elements
function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translate(key);
    });
    
    // 触发语言变更事件，通知所有组件更新
    const event = new CustomEvent('language-changed', {
        detail: { language: currentLanguage }
    });
    document.dispatchEvent(event);
}

// Get translation text
function translate(key) {
    if (LANGUAGES[currentLanguage] && 
        LANGUAGES[currentLanguage].translations && 
        LANGUAGES[currentLanguage].translations[key]) {
        return LANGUAGES[currentLanguage].translations[key];
    }
    return LANGUAGES['en'].translations[key] || key;
}

// Change language
function changeLanguage(langCode) {
    if (LANGUAGES[langCode]) {
        currentLanguage = langCode;
        document.documentElement.lang = langCode;
        document.documentElement.dir = LANGUAGES[langCode].rtl ? 'rtl' : 'ltr';
    
        // Save language setting to local storage
        localStorage.setItem('preferred_language', langCode);
        
        // Update UI
        translateUI();
    
        // Update language selection dropdown
        const langSelect = document.getElementById('language-selector');
        if (langSelect) {
            langSelect.value = langCode;
        }
    }
}

// 获取当前语言
function getCurrentLanguage() {
    return currentLanguage;
}

// Initialize language
function initLanguage() {
    // First try to get language setting from local storage
    const savedLang = localStorage.getItem('preferred_language');
    const initialLang = savedLang || getUserLanguage();
    
    // Set initial language - making sure all UI elements are properly translated
    currentLanguage = initialLang;
    document.documentElement.lang = initialLang;
    document.documentElement.dir = LANGUAGES[initialLang]?.rtl ? 'rtl' : 'ltr';
    
    // Set up language selector
    const langSelect = document.getElementById('language-selector');
    if (langSelect) {
        // Clear any existing options first
        langSelect.innerHTML = '';
        
        // Add language options
        Object.keys(LANGUAGES).forEach(langCode => {
            const langName = LANGUAGES[langCode].name;
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = langName;
            langSelect.appendChild(option);
        });
        
        // Set current selected language
        langSelect.value = currentLanguage;
        
        // Add language change event listener
        langSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    // First translate the UI to prevent flashing of untranslated content
    translateUI();
    
    // Force a second translation after a slight delay to ensure everything is translated
    setTimeout(translateUI, 100);
}

// Initialize language when DOM is loaded
document.addEventListener('DOMContentLoaded', initLanguage);

// Export language functions to global scope for access from other pages
window.DROPSHARE_I18N = {
    changeLanguage: changeLanguage,
    translate: translate,
    init: initLanguage,
    getCurrentLanguage: getCurrentLanguage
};