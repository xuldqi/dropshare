const fs = require('fs');

// 新增英语翻译键值 - 补充常用功能和改进用户体验
const newEnglishTranslations = {
    // 文件管理增强
    'file_manager': 'File Manager',
    'select_all': 'Select All',
    'deselect_all': 'Deselect All',
    'delete_selected': 'Delete Selected',
    'move_to_folder': 'Move to Folder',
    'create_folder': 'Create Folder',
    'rename_file': 'Rename File',
    'file_properties': 'File Properties',
    'duplicate_file': 'Duplicate File',
    'compress_files': 'Compress Files',
    'extract_files': 'Extract Files',
    
    // 传输增强
    'transfer_speed': 'Transfer Speed',
    'estimated_time': 'Estimated Time',
    'transfer_progress': 'Transfer Progress',
    'pause_transfer': 'Pause Transfer',
    'resume_transfer': 'Resume Transfer',
    'cancel_transfer': 'Cancel Transfer',
    'retry_transfer': 'Retry Transfer',
    'transfer_queue': 'Transfer Queue',
    'max_file_size': 'Maximum File Size',
    'transfer_limit': 'Transfer Limit',
    
    // 设备管理
    'device_manager': 'Device Manager',
    'trusted_devices': 'Trusted Devices',
    'blocked_devices': 'Blocked Devices',
    'device_nickname': 'Device Nickname',
    'device_status': 'Device Status',
    'device_online': 'Online',
    'device_offline': 'Offline',
    'device_connecting': 'Connecting',
    'device_connected': 'Connected',
    'device_disconnected': 'Disconnected',
    
    // 安全和隐私
    'security_settings': 'Security Settings',
    'privacy_mode': 'Privacy Mode',
    'encrypt_transfers': 'Encrypt Transfers',
    'require_approval': 'Require Approval',
    'auto_accept': 'Auto Accept',
    'password_protect': 'Password Protection',
    'set_password': 'Set Password',
    'enter_password': 'Enter Password',
    'password_required': 'Password Required',
    'invalid_password': 'Invalid Password',
    
    // 通知和警告
    'notifications': 'Notifications',
    'enable_notifications': 'Enable Notifications',
    'sound_alerts': 'Sound Alerts',
    'desktop_notifications': 'Desktop Notifications',
    'transfer_complete_notification': 'Transfer Complete Notification',
    'new_device_notification': 'New Device Notification',
    'error_notification': 'Error Notification',
    'warning': 'Warning',
    'information': 'Information',
    'success': 'Success',
    'error': 'Error',
    
    // 用户界面改进
    'theme': 'Theme',
    'dark_mode': 'Dark Mode',
    'light_mode': 'Light Mode',
    'auto_theme': 'Auto Theme',
    'font_size': 'Font Size',
    'zoom_level': 'Zoom Level',
    'full_screen': 'Full Screen',
    'minimize': 'Minimize',
    'maximize': 'Maximize',
    'restore': 'Restore',
    'refresh': 'Refresh',
    'reload': 'Reload',
    
    // 高级功能
    'advanced_settings': 'Advanced Settings',
    'debug_mode': 'Debug Mode',
    'developer_options': 'Developer Options',
    'connection_info': 'Connection Info',
    'network_diagnostics': 'Network Diagnostics',
    'speed_test': 'Speed Test',
    'bandwidth_usage': 'Bandwidth Usage',
    'connection_quality': 'Connection Quality',
    'latency': 'Latency',
    'packet_loss': 'Packet Loss',
    
    // 帮助和支持
    'help_center': 'Help Center',
    'user_guide': 'User Guide',
    'tutorials': 'Tutorials',
    'video_tutorials': 'Video Tutorials',
    'troubleshooting': 'Troubleshooting',
    'contact_support': 'Contact Support',
    'report_bug': 'Report Bug',
    'feature_request': 'Feature Request',
    'feedback': 'Feedback',
    'rate_app': 'Rate App',
    
    // 文件预览
    'preview': 'Preview',
    'preview_not_available': 'Preview Not Available',
    'image_preview': 'Image Preview',
    'video_preview': 'Video Preview',
    'audio_preview': 'Audio Preview',
    'document_preview': 'Document Preview',
    'text_preview': 'Text Preview',
    'download_to_preview': 'Download to Preview',
    
    // 搜索和过滤增强
    'advanced_search': 'Advanced Search',
    'search_by_name': 'Search by Name',
    'search_by_type': 'Search by Type',
    'search_by_size': 'Search by Size',
    'search_by_date': 'Search by Date',
    'filter_options': 'Filter Options',
    'date_range': 'Date Range',
    'size_range': 'Size Range',
    'file_type_filter': 'File Type Filter',
    'custom_filter': 'Custom Filter',
    
    // 批量操作
    'batch_operations': 'Batch Operations',
    'batch_download': 'Batch Download',
    'batch_upload': 'Batch Upload',
    'batch_delete': 'Batch Delete',
    'batch_rename': 'Batch Rename',
    'batch_move': 'Batch Move',
    'batch_copy': 'Batch Copy',
    'select_operation': 'Select Operation',
    'apply_to_selected': 'Apply to Selected',
    
    // 云同步和备份
    'cloud_sync': 'Cloud Sync',
    'auto_backup': 'Auto Backup',
    'backup_settings': 'Backup Settings',
    'restore_backup': 'Restore Backup',
    'sync_status': 'Sync Status',
    'last_sync': 'Last Sync',
    'sync_in_progress': 'Sync in Progress',
    'sync_complete': 'Sync Complete',
    'sync_failed': 'Sync Failed',
    
    // 协作功能
    'collaboration': 'Collaboration',
    'share_with_team': 'Share with Team',
    'team_members': 'Team Members',
    'permissions': 'Permissions',
    'read_only': 'Read Only',
    'read_write': 'Read & Write',
    'admin_access': 'Admin Access',
    'invite_users': 'Invite Users',
    'manage_users': 'Manage Users',
    
    // 性能优化
    'performance': 'Performance',
    'optimize_performance': 'Optimize Performance',
    'cache_settings': 'Cache Settings',
    'clear_cache': 'Clear Cache',
    'memory_usage': 'Memory Usage',
    'cpu_usage': 'CPU Usage',
    'disk_usage': 'Disk Usage',
    'network_usage': 'Network Usage',
    
    // 无障碍功能
    'accessibility': 'Accessibility',
    'screen_reader': 'Screen Reader',
    'high_contrast': 'High Contrast',
    'large_text': 'Large Text',
    'keyboard_navigation': 'Keyboard Navigation',
    'voice_commands': 'Voice Commands',
    'accessibility_mode': 'Accessibility Mode',
    
    // 快捷键和手势
    'shortcuts': 'Shortcuts',
    'keyboard_shortcuts': 'Keyboard Shortcuts',
    'gesture_controls': 'Gesture Controls',
    'custom_shortcuts': 'Custom Shortcuts',
    'hotkeys': 'Hotkeys',
    'quick_actions': 'Quick Actions'
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

console.log('开始为英语添加新的翻译键值...');

// 获取当前英语翻译
const enTranslations = LANGUAGES.en.translations;
const originalCount = Object.keys(enTranslations).length;

// 添加新的翻译
let addedCount = 0;
for (const [key, value] of Object.entries(newEnglishTranslations)) {
    if (!enTranslations[key]) {
        enTranslations[key] = value;
        addedCount++;
    }
}

console.log(`原有英语翻译数量: ${originalCount}`);
console.log(`添加翻译数量: ${addedCount}`);
console.log(`更新后翻译数量: ${Object.keys(enTranslations).length}`);

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
    
    const translations = langCode === 'en' ? enTranslations : lang.translations;
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
const outputPath = './public/scripts/i18n/languages_en_enhanced.js';
fs.writeFileSync(outputPath, newContent, 'utf8');

console.log(`\n英语翻译增强完成！新文件已保存到: ${outputPath}`);

// 同时更新独立的英语语言文件
const enFilePath = './public/scripts/i18n/languages/en.js';
if (fs.existsSync(enFilePath)) {
    let enFileContent = fs.readFileSync(enFilePath, 'utf8');
    let enFileAddedCount = 0;
    
    // 检查并添加缺失的翻译
    for (const [key, value] of Object.entries(newEnglishTranslations)) {
        const keyPattern = new RegExp(`"${key}"\\s*:`);
        
        if (!keyPattern.test(enFileContent)) {
            // 在文件末尾的 "}" 前添加新的翻译
            const lastBraceIndex = enFileContent.lastIndexOf('}');
            const beforeBrace = enFileContent.substring(0, lastBraceIndex).trim();
            const afterBrace = enFileContent.substring(lastBraceIndex);
            
            // 确保在最后一个键后添加逗号（如果还没有的话）
            const needsComma = !beforeBrace.endsWith(',');
            const comma = needsComma ? ',' : '';
            const escapedTranslation = value.replace(/"/g, '\\"');
            
            enFileContent = beforeBrace + comma + 
                           `\n    "${key}": "${escapedTranslation}"` + 
                           '\n' + afterBrace;
            
            enFileAddedCount++;
        }
    }
    
    if (enFileAddedCount > 0) {
        fs.writeFileSync(enFilePath, enFileContent, 'utf8');
        console.log(`独立英语语言文件已更新，添加了 ${enFileAddedCount} 个翻译`);
    }
}

// 生成新增翻译的分类报告
console.log('\n=== 新增英语翻译分类报告 ===');
const categories = {
    'file_': '文件管理',
    'transfer_': '传输功能',
    'device_': '设备管理',
    'security_': '安全设置',
    'notifications': '通知系统',
    'theme': '界面主题',
    'advanced_': '高级功能',
    'help_': '帮助支持',
    'preview': '文件预览',
    'search_': '搜索过滤',
    'batch_': '批量操作',
    'cloud_': '云同步',
    'collaboration': '协作功能',
    'performance': '性能优化',
    'accessibility': '无障碍',
    'shortcuts': '快捷操作'
};

const categorizedNew = {};
const uncategorizedNew = [];

Object.entries(newEnglishTranslations).forEach(([key, value]) => {
    let categorized = false;
    for (const [prefix, categoryName] of Object.entries(categories)) {
        if (key.includes(prefix)) {
            if (!categorizedNew[categoryName]) {
                categorizedNew[categoryName] = [];
            }
            categorizedNew[categoryName].push({key, value});
            categorized = true;
            break;
        }
    }
    if (!categorized) {
        uncategorizedNew.push({key, value});
    }
});

for (const [categoryName, items] of Object.entries(categorizedNew)) {
    console.log(`\n${categoryName} (${items.length}个):`);
    items.slice(0, 5).forEach(item => {
        console.log(`  ${item.key}: ${item.value}`);
    });
    if (items.length > 5) {
        console.log(`  ... 还有 ${items.length - 5} 个`);
    }
}

console.log(`\n总计添加了 ${addedCount} 个新的英语翻译键值，涵盖多个功能领域`);