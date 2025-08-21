const fs = require('fs');

// 读取languages.js文件分析缺失的键
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

// 分析缺失的键
const enTranslations = LANGUAGES.en.translations;
const zhTranslations = LANGUAGES.zh.translations;
const zhTwTranslations = LANGUAGES['zh-tw'].translations;

const missingInZh = [];
const missingInZhTw = [];

for (const key in enTranslations) {
    if (!zhTranslations[key]) {
        missingInZh.push(key);
    }
    if (!zhTwTranslations[key]) {
        missingInZhTw.push(key);
    }
}

console.log(`中文简体缺失: ${missingInZh.length} 个键`);
console.log(`中文繁体缺失: ${missingInZhTw.length} 个键`);

// 技术术语和格式名称 - 通常保持原文或使用英文
const technicalTerms = new Set([
    'MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'MP4', 'AVI', 'MOV', 'WebM', 'MKV',
    'PDF', 'DOCX', 'TXT', 'RTF', 'HTML', 'JSON', 'CSV', 'ZIP', 'RAR',
    'WebRTC', 'API', 'URL', 'HTTP', 'HTTPS', 'SSL', 'TLS', 'VPN',
    'CPU', 'RAM', 'GPU', 'USB', 'WiFi', 'LAN', 'IP', 'DNS', 'TCP',
    'DTLS', 'SRTP', 'P2P', 'QR', 'OCR', 'AI', 'ML', 'AR', 'VR'
]);

// 智能翻译映射 - 区分需要翻译和保持原文的键
const smartTranslations = {
    // 文件管理相关
    'file_manager': { zh: '文件管理器', zhTw: '檔案管理器' },
    'select_all': { zh: '全选', zhTw: '全選' },
    'deselect_all': { zh: '取消全选', zhTw: '取消全選' },
    'delete_selected': { zh: '删除所选', zhTw: '刪除所選' },
    'move_to_folder': { zh: '移动到文件夹', zhTw: '移至資料夾' },
    'create_folder': { zh: '新建文件夹', zhTw: '新建資料夾' },
    'rename_file': { zh: '重命名文件', zhTw: '重新命名檔案' },
    'file_properties': { zh: '文件属性', zhTw: '檔案內容' },
    'duplicate_file': { zh: '复制文件', zhTw: '複製檔案' },
    'compress_files': { zh: '压缩文件', zhTw: '壓縮檔案' },
    'extract_files': { zh: '解压文件', zhTw: '解壓縮檔案' },
    
    // 传输功能相关
    'transfer_speed': { zh: '传输速度', zhTw: '傳輸速度' },
    'estimated_time': { zh: '预计时间', zhTw: '預計時間' },
    'transfer_progress': { zh: '传输进度', zhTw: '傳輸進度' },
    'pause_transfer': { zh: '暂停传输', zhTw: '暫停傳輸' },
    'resume_transfer': { zh: '继续传输', zhTw: '繼續傳輸' },
    'cancel_transfer': { zh: '取消传输', zhTw: '取消傳輸' },
    'retry_transfer': { zh: '重试传输', zhTw: '重試傳輸' },
    'transfer_queue': { zh: '传输队列', zhTw: '傳輸佇列' },
    'transfer_limit': { zh: '传输限制', zhTw: '傳輸限制' },
    'max_file_size': { zh: '最大文件大小', zhTw: '最大檔案大小' },
    
    // 设备管理相关
    'device_manager': { zh: '设备管理器', zhTw: '裝置管理器' },
    'trusted_devices': { zh: '信任设备', zhTw: '信任裝置' },
    'blocked_devices': { zh: '阻止设备', zhTw: '封鎖裝置' },
    'device_nickname': { zh: '设备昵称', zhTw: '裝置暱稱' },
    'device_status': { zh: '设备状态', zhTw: '裝置狀態' },
    'device_online': { zh: '在线', zhTw: '線上' },
    'device_offline': { zh: '离线', zhTw: '離線' },
    'device_connecting': { zh: '连接中', zhTw: '連接中' },
    'device_connected': { zh: '已连接', zhTw: '已連接' },
    'device_disconnected': { zh: '已断开', zhTw: '已中斷' },
    
    // 安全和隐私相关
    'security_settings': { zh: '安全设置', zhTw: '安全設定' },
    'privacy_mode': { zh: '隐私模式', zhTw: '隱私模式' },
    'encrypt_transfers': { zh: '加密传输', zhTw: '加密傳輸' },
    'require_approval': { zh: '需要确认', zhTw: '需要確認' },
    'auto_accept': { zh: '自动接受', zhTw: '自動接受' },
    'password_protect': { zh: '密码保护', zhTw: '密碼保護' },
    'set_password': { zh: '设置密码', zhTw: '設定密碼' },
    'enter_password': { zh: '输入密码', zhTw: '輸入密碼' },
    'password_required': { zh: '需要密码', zhTw: '需要密碼' },
    'invalid_password': { zh: '密码错误', zhTw: '密碼錯誤' },
    
    // 通知系统相关
    'notifications': { zh: '通知', zhTw: '通知' },
    'enable_notifications': { zh: '启用通知', zhTw: '啟用通知' },
    'sound_alerts': { zh: '声音提醒', zhTw: '聲音提醒' },
    'desktop_notifications': { zh: '桌面通知', zhTw: '桌面通知' },
    'transfer_complete_notification': { zh: '传输完成通知', zhTw: '傳輸完成通知' },
    'new_device_notification': { zh: '新设备通知', zhTw: '新裝置通知' },
    'error_notification': { zh: '错误通知', zhTw: '錯誤通知' },
    'warning': { zh: '警告', zhTw: '警告' },
    'information': { zh: '信息', zhTw: '資訊' },
    'success': { zh: '成功', zhTw: '成功' },
    'error': { zh: '错误', zhTw: '錯誤' },
    
    // 界面主题相关
    'theme': { zh: '主题', zhTw: '主題' },
    'dark_mode': { zh: '深色模式', zhTw: '深色模式' },
    'light_mode': { zh: '浅色模式', zhTw: '淺色模式' },
    'auto_theme': { zh: '自动主题', zhTw: '自動主題' },
    'font_size': { zh: '字体大小', zhTw: '字型大小' },
    'zoom_level': { zh: '缩放级别', zhTw: '縮放級別' },
    'full_screen': { zh: '全屏', zhTw: '全螢幕' },
    'minimize': { zh: '最小化', zhTw: '最小化' },
    'maximize': { zh: '最大化', zhTw: '最大化' },
    'restore': { zh: '还原', zhTw: '還原' },
    'refresh': { zh: '刷新', zhTw: '重新整理' },
    'reload': { zh: '重新加载', zhTw: '重新載入' },
    
    // 高级功能相关
    'advanced_settings': { zh: '高级设置', zhTw: '進階設定' },
    'debug_mode': { zh: '调试模式', zhTw: '偵錯模式' },
    'developer_options': { zh: '开发者选项', zhTw: '開發人員選項' },
    'connection_info': { zh: '连接信息', zhTw: '連接資訊' },
    'network_diagnostics': { zh: '网络诊断', zhTw: '網路診斷' },
    'speed_test': { zh: '速度测试', zhTw: '速度測試' },
    'bandwidth_usage': { zh: '带宽使用情况', zhTw: '頻寬使用情況' },
    'connection_quality': { zh: '连接质量', zhTw: '連接品質' },
    'latency': { zh: '延迟', zhTw: '延遲' },
    'packet_loss': { zh: '丢包率', zhTw: '封包遺失率' },
    
    // 帮助支持相关
    'help_center': { zh: '帮助中心', zhTw: '協助中心' },
    'user_guide': { zh: '用户指南', zhTw: '使用者指南' },
    'tutorials': { zh: '教程', zhTw: '教學課程' },
    'video_tutorials': { zh: '视频教程', zhTw: '影片教學' },
    'troubleshooting': { zh: '故障排除', zhTw: '疑難排解' },
    'contact_support': { zh: '联系支持', zhTw: '聯絡支援' },
    'report_bug': { zh: '报告错误', zhTw: '回報錯誤' },
    'feature_request': { zh: '功能请求', zhTw: '功能要求' },
    'feedback': { zh: '反馈', zhTw: '意見回饋' },
    'rate_app': { zh: '为应用评分', zhTw: '為應用程式評分' },
    
    // 文件预览相关
    'preview': { zh: '预览', zhTw: '預覽' },
    'preview_not_available': { zh: '无法预览', zhTw: '無法預覽' },
    'image_preview': { zh: '图片预览', zhTw: '圖片預覽' },
    'video_preview': { zh: '视频预览', zhTw: '影片預覽' },
    'audio_preview': { zh: '音频预览', zhTw: '音訊預覽' },
    'document_preview': { zh: '文档预览', zhTw: '文件預覽' },
    'text_preview': { zh: '文本预览', zhTw: '文字預覽' },
    'download_to_preview': { zh: '下载以预览', zhTw: '下載以預覽' },
    
    // 搜索过滤相关
    'advanced_search': { zh: '高级搜索', zhTw: '進階搜尋' },
    'search_by_name': { zh: '按名称搜索', zhTw: '依名稱搜尋' },
    'search_by_type': { zh: '按类型搜索', zhTw: '依類型搜尋' },
    'search_by_size': { zh: '按大小搜索', zhTw: '依大小搜尋' },
    'search_by_date': { zh: '按日期搜索', zhTw: '依日期搜尋' },
    'filter_options': { zh: '筛选选项', zhTw: '篩選選項' },
    'date_range': { zh: '日期范围', zhTw: '日期範圍' },
    'size_range': { zh: '大小范围', zhTw: '大小範圍' },
    'file_type_filter': { zh: '文件类型筛选', zhTw: '檔案類型篩選' },
    'custom_filter': { zh: '自定义筛选', zhTw: '自訂篩選' },
    
    // 批量操作相关
    'batch_operations': { zh: '批量操作', zhTw: '批次作業' },
    'batch_download': { zh: '批量下载', zhTw: '批次下載' },
    'batch_upload': { zh: '批量上传', zhTw: '批次上傳' },
    'batch_delete': { zh: '批量删除', zhTw: '批次刪除' },
    'batch_rename': { zh: '批量重命名', zhTw: '批次重新命名' },
    'batch_move': { zh: '批量移动', zhTw: '批次移動' },
    'batch_copy': { zh: '批量复制', zhTw: '批次複製' },
    'select_operation': { zh: '选择操作', zhTw: '選擇作業' },
    'apply_to_selected': { zh: '应用到所选项', zhTw: '套用至所選項目' },
    
    // 云同步相关
    'cloud_sync': { zh: '云同步', zhTw: '雲端同步' },
    'auto_backup': { zh: '自动备份', zhTw: '自動備份' },
    'backup_settings': { zh: '备份设置', zhTw: '備份設定' },
    'restore_backup': { zh: '恢复备份', zhTw: '還原備份' },
    'sync_status': { zh: '同步状态', zhTw: '同步狀態' },
    'last_sync': { zh: '上次同步', zhTw: '上次同步' },
    'sync_in_progress': { zh: '同步中', zhTw: '同步中' },
    'sync_complete': { zh: '同步完成', zhTw: '同步完成' },
    'sync_failed': { zh: '同步失败', zhTw: '同步失敗' },
    
    // 协作功能相关
    'collaboration': { zh: '协作', zhTw: '協作' },
    'share_with_team': { zh: '与团队共享', zhTw: '與團隊共用' },
    'team_members': { zh: '团队成员', zhTw: '團隊成員' },
    'permissions': { zh: '权限', zhTw: '權限' },
    'read_only': { zh: '只读', zhTw: '唯讀' },
    'read_write': { zh: '读写', zhTw: '讀寫' },
    'admin_access': { zh: '管理员访问', zhTw: '管理員存取' },
    'invite_users': { zh: '邀请用户', zhTw: '邀請使用者' },
    'manage_users': { zh: '管理用户', zhTw: '管理使用者' },
    
    // 性能优化相关
    'performance': { zh: '性能', zhTw: '效能' },
    'optimize_performance': { zh: '优化性能', zhTw: '最佳化效能' },
    'cache_settings': { zh: '缓存设置', zhTw: '快取設定' },
    'clear_cache': { zh: '清除缓存', zhTw: '清除快取' },
    'memory_usage': { zh: '内存使用情况', zhTw: '記憶體使用情況' },
    'cpu_usage': { zh: 'CPU使用情况', zhTw: 'CPU使用情況' },
    'disk_usage': { zh: '磁盘使用情况', zhTw: '磁碟使用情況' },
    'network_usage': { zh: '网络使用情况', zhTw: '網路使用情況' },
    
    // 无障碍功能相关
    'accessibility': { zh: '无障碍功能', zhTw: '協助工具' },
    'screen_reader': { zh: '屏幕阅读器', zhTw: '螢幕閱讀程式' },
    'high_contrast': { zh: '高对比度', zhTw: '高對比' },
    'large_text': { zh: '大文本', zhTw: '大文字' },
    'keyboard_navigation': { zh: '键盘导航', zhTw: '鍵盤導覽' },
    'voice_commands': { zh: '语音命令', zhTw: '語音指令' },
    'accessibility_mode': { zh: '无障碍模式', zhTw: '協助工具模式' },
    
    // 快捷键相关
    'shortcuts': { zh: '快捷键', zhTw: '快速鍵' },
    'keyboard_shortcuts': { zh: '键盘快捷键', zhTw: '鍵盤快速鍵' },
    'gesture_controls': { zh: '手势控制', zhTw: '手勢控制' },
    'custom_shortcuts': { zh: '自定义快捷键', zhTw: '自訂快速鍵' },
    'hotkeys': { zh: '热键', zhTw: '快速鍵' },
    'quick_actions': { zh: '快捷操作', zhTw: '快速動作' }
};

// 判断是否为技术术语的函数
function isTechnicalTerm(key, value) {
    // 检查键名或值是否包含技术术语
    const upperValue = value.toUpperCase();
    for (const term of technicalTerms) {
        if (upperValue.includes(term) || key.toUpperCase().includes(term)) {
            return true;
        }
    }
    
    // 检查是否为格式列表（包含逗号分隔的格式）
    if (value.includes(',') && /^[A-Z0-9, ]+$/.test(value)) {
        return true;
    }
    
    // 检查是否为单一大写技术术语
    if (/^[A-Z]{2,}$/.test(value) || /^[A-Z]{2,}[0-9]+$/.test(value)) {
        return true;
    }
    
    return false;
}

// 分析并补充翻译
console.log('\n=== 智能翻译分析 ===');

let needTranslation = 0;
let keepOriginal = 0;
let zhAdded = 0;
let zhTwAdded = 0;

// 为中文简体补充翻译
for (const key of missingInZh) {
    const englishValue = enTranslations[key];
    
    if (isTechnicalTerm(key, englishValue)) {
        // 技术术语保持原文
        zhTranslations[key] = englishValue;
        keepOriginal++;
    } else if (smartTranslations[key]) {
        // 使用智能翻译
        zhTranslations[key] = smartTranslations[key].zh;
        needTranslation++;
        zhAdded++;
    } else {
        // 暂时使用英文，标记需要人工翻译
        zhTranslations[key] = `[需要翻译] ${englishValue}`;
        needTranslation++;
    }
}

// 为中文繁体补充翻译
for (const key of missingInZhTw) {
    const englishValue = enTranslations[key];
    
    if (isTechnicalTerm(key, englishValue)) {
        // 技术术语保持原文
        zhTwTranslations[key] = englishValue;
    } else if (smartTranslations[key]) {
        // 使用智能翻译
        zhTwTranslations[key] = smartTranslations[key].zhTw;
        zhTwAdded++;
    } else {
        // 暂时使用英文，标记需要人工翻译
        zhTwTranslations[key] = `[需要翻译] ${englishValue}`;
    }
}

console.log(`需要翻译的键: ${needTranslation} 个`);
console.log(`保持原文的键: ${keepOriginal} 个`);
console.log(`中文简体智能翻译: ${zhAdded} 个`);
console.log(`中文繁体智能翻译: ${zhTwAdded} 个`);

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

// 写入文件
const outputPath = './public/scripts/i18n/languages_chinese_complete.js';
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n中文翻译完善完成！新文件已保存到: ${outputPath}`);

// 同时更新独立的语言文件
const zhFilePath = './public/scripts/i18n/languages/zh.js';
const zhTwFilePath = './public/scripts/i18n/languages/zh-tw.js';

// 更新中文简体文件
if (fs.existsSync(zhFilePath)) {
    let zhFileContent = fs.readFileSync(zhFilePath, 'utf8');
    let zhFileAddedCount = 0;
    
    for (const key of missingInZh) {
        const keyPattern = new RegExp(`"${key}"\\s*:`);
        
        if (!keyPattern.test(zhFileContent)) {
            const lastBraceIndex = zhFileContent.lastIndexOf('}');
            const beforeBrace = zhFileContent.substring(0, lastBraceIndex).trim();
            const afterBrace = zhFileContent.substring(lastBraceIndex);
            
            const needsComma = !beforeBrace.endsWith(',');
            const comma = needsComma ? ',' : '';
            const translation = zhTranslations[key].replace(/"/g, '\\"');
            
            zhFileContent = beforeBrace + comma + 
                           `\n    "${key}": "${translation}"` + 
                           '\n' + afterBrace;
            
            zhFileAddedCount++;
        }
    }
    
    if (zhFileAddedCount > 0) {
        fs.writeFileSync(zhFilePath, zhFileContent, 'utf8');
        console.log(`中文简体独立文件已更新，添加了 ${zhFileAddedCount} 个翻译`);
    }
}

// 更新中文繁体文件
if (fs.existsSync(zhTwFilePath)) {
    let zhTwFileContent = fs.readFileSync(zhTwFilePath, 'utf8');
    let zhTwFileAddedCount = 0;
    
    for (const key of missingInZhTw) {
        const keyPattern = new RegExp(`"${key}"\\s*:`);
        
        if (!keyPattern.test(zhTwFileContent)) {
            const lastBraceIndex = zhTwFileContent.lastIndexOf('}');
            const beforeBrace = zhTwFileContent.substring(0, lastBraceIndex).trim();
            const afterBrace = zhTwFileContent.substring(lastBraceIndex);
            
            const needsComma = !beforeBrace.endsWith(',');
            const comma = needsComma ? ',' : '';
            const translation = zhTwTranslations[key].replace(/"/g, '\\"');
            
            zhTwFileContent = beforeBrace + comma + 
                             `\n    "${key}": "${translation}"` + 
                             '\n' + afterBrace;
            
            zhTwFileAddedCount++;
        }
    }
    
    if (zhTwFileAddedCount > 0) {
        fs.writeFileSync(zhTwFilePath, zhTwFileContent, 'utf8');
        console.log(`中文繁体独立文件已更新，添加了 ${zhTwFileAddedCount} 个翻译`);
    }
}

console.log('\n=== 翻译分类统计 ===');
console.log(`✅ 智能翻译的功能键: ${zhAdded} 个`);
console.log(`⚪ 保持原文的技术术语: ${keepOriginal} 个`);
console.log(`⚠️  仍需人工翻译: ${needTranslation - zhAdded} 个`);

console.log('\n现在中文简体和繁体的翻译完整度应该接近100%了！');