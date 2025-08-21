const fs = require('fs');

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

// 获取英文和中文简体的翻译
const enTranslations = LANGUAGES.en.translations;
const zhTranslations = LANGUAGES.zh.translations;

console.log('分析中文简体缺失的翻译键...\n');

// 找出中文简体缺失的键
const missingKeys = [];
for (const key in enTranslations) {
    if (!zhTranslations[key]) {
        missingKeys.push({
            key: key,
            englishValue: enTranslations[key]
        });
    }
}

console.log(`中文简体缺失的翻译数量: ${missingKeys.length}\n`);

// 按类别分组显示
const categories = {
    'about_': '关于页面',
    'faq_': '常见问题',
    'blog_': '博客页面', 
    'privacy_': '隐私政策',
    'terms_': '使用条款',
    'transfer_': '传输功能',
    'history_': '历史记录',
    'filter_': '筛选功能',
    'sort_': '排序功能',
    'nav_': '导航菜单',
    'tool_': '工具相关',
    'feature_': '功能特性',
    'category_': '分类标题'
};

const categorizedKeys = {};
const uncategorizedKeys = [];

missingKeys.forEach(item => {
    let categorized = false;
    for (const [prefix, categoryName] of Object.entries(categories)) {
        if (item.key.startsWith(prefix)) {
            if (!categorizedKeys[categoryName]) {
                categorizedKeys[categoryName] = [];
            }
            categorizedKeys[categoryName].push(item);
            categorized = true;
            break;
        }
    }
    if (!categorized) {
        uncategorizedKeys.push(item);
    }
});

// 输出分类结果
console.log('=== 按类别分组的缺失翻译 ===\n');

for (const [categoryName, items] of Object.entries(categorizedKeys)) {
    console.log(`${categoryName} (${items.length}个):`);
    items.forEach(item => {
        console.log(`  "${item.key}": "${item.englishValue}"`);
    });
    console.log('');
}

if (uncategorizedKeys.length > 0) {
    console.log(`其他未分类 (${uncategorizedKeys.length}个):`);
    uncategorizedKeys.forEach(item => {
        console.log(`  "${item.key}": "${item.englishValue}"`);
    });
    console.log('');
}

// 生成中文翻译建议
const chineseTranslations = {
    // 基础功能
    'files': '文件',
    'texts': '文本',
    
    // 关于页面
    'about_page_title': '关于 - DropShare',
    'about_header_title': '关于 DropShare',
    'about_what_is_title': '什么是 DropShare？',
    'about_what_is_p1': 'DropShare 是一个强大的在线文件共享工具，让您可以在同一网络上的设备之间快速、安全地传输文件。无需注册账户，无需安装软件，只需打开浏览器即可开始使用。',
    'about_how_it_works_title': 'DropShare 如何工作？',
    'about_how_it_works_p1': 'DropShare 使用 WebRTC 技术在设备之间建立点对点连接。您的文件直接在设备间传输，不会上传到我们的服务器，确保您的隐私和安全。',
    'about_no_setup_title': '无需设置',
    'about_no_setup_p1': '不需要复杂的配置或安装过程。只需在浏览器中打开 DropShare，即可立即开始传输文件。支持所有现代浏览器。',
    'about_privacy_title': '隐私保护',
    'about_privacy_p1': '您的文件永远不会存储在我们的服务器上。所有传输都是端到端加密的，确保只有您和接收方可以访问文件内容。',
    'about_cross_platform_title': '跨平台兼容',
    'about_cross_platform_p1': '无论您使用的是 Windows、Mac、Android 还是 iOS 设备，DropShare 都能完美运行。只要有现代浏览器，就能使用 DropShare。',
    'about_open_source_title': '开源项目',
    'about_open_source_p1': 'DropShare 是一个开源项目，代码公开透明。您可以在 GitHub 上查看源代码，也欢迎贡献代码或提出改进建议。',
    
    // 常见问题
    'faq_page_title': '常见问题 - DropShare',
    
    // 博客页面
    'blog_page_title': '博客 - DropShare',
    'blog_header_title': 'DropShare 博客',
    'blog_latest_posts': '最新文章',
    'blog_read_more': '阅读更多',
    'blog_posted_on': '发布于',
    'blog_by_author': '作者：',
    'blog_post_1_title': '欢迎使用 DropShare',
    'blog_post_1_excerpt': '了解如何开始使用 DropShare 进行快速文件共享。',
    'blog_post_1_content': '欢迎使用 DropShare！这是一个革命性的文件共享工具，让您可以在设备之间轻松传输文件。',
    'blog_post_2_title': 'DropShare 的安全性',
    'blog_post_2_excerpt': '了解 DropShare 如何保护您的文件和隐私。',
    'blog_post_2_content': 'DropShare 使用端到端加密技术，确保您的文件传输过程完全安全。',
    'blog_post_3_title': '跨平台文件共享的未来',
    'blog_post_3_excerpt': '探索跨平台文件共享技术的发展趋势。',
    'blog_post_3_content': '随着技术的发展，跨平台文件共享变得越来越重要。DropShare 正在引领这一趋势。',
    
    // 隐私政策相关
    'privacy_page_title': '隐私政策 - DropShare',
    
    // 使用条款相关
    'terms_page_title': '使用条款 - DropShare',
    'terms_last_updated_date': '2024年1月15日',
    'terms_section3_intro': '使用 DropShare 服务时，您同意遵守以下条款：',
    'terms_section3_item1': '不得上传违法、有害或侵犯他人权利的内容',
    'terms_section3_item2': '不得使用服务进行恶意活动或传播恶意软件',
    'terms_section3_item3': '不得尝试破坏或干扰服务的正常运行',
    'terms_section3_item4': '不得侵犯其他用户的隐私或权利',
    'terms_section3_item5': '不得滥用服务资源或进行商业用途（除非获得许可）',
    'terms_section3_item6': '必须遵守适用的法律法规和第三方服务条款',
    'terms_section4_content1': '我们保留在必要时暂停或终止服务的权利，包括但不限于：系统维护、安全问题、违反使用条款等情况。',
    'terms_section4_content2': '在服务中断时，我们将尽力提前通知用户，并尽快恢复服务。',
    'terms_section5_content1': 'DropShare 服务按"现状"提供，我们不对服务的可用性、准确性或完整性做出任何保证。',
    'terms_section5_content2': '用户使用服务的风险由其自行承担。在法律允许的最大范围内，我们不承担任何直接或间接损失的责任。',
    'terms_section5_item1': '服务中断或数据丢失造成的损失',
    'terms_section5_item2': '第三方行为或内容造成的损失',
    'terms_section5_item3': '技术故障或网络问题造成的损失',
    'terms_section5_item4': '误用服务或违反条款造成的后果',
    'terms_section6_item1': '这些条款的任何修改将在网站上公布，继续使用服务即表示接受修改后的条款。',
    'terms_section6_item2': '如果您不同意修改后的条款，请停止使用 DropShare 服务。',
    
    // 传输功能
    'transfer_history': '传输历史',
    
    // 历史记录
    'history': '历史',
    'no_history': '暂无历史记录',
    'search_history': '搜索历史...',
    
    // 筛选功能
    'filter_all': '全部',
    'filter_sent': '已发送',
    'filter_received': '已接收',
    'filter_files': '文件',
    'filter_messages': '消息',
    
    // 排序功能
    'sort_by': '排序方式',
    'sort_time_desc': '最新优先',
    'sort_time_asc': '最旧优先',
    'sort_size_desc': '最大优先',
    'sort_size_asc': '最小优先',
    'sort_name_asc': '名称 A-Z',
    'sort_name_desc': '名称 Z-A',
    
    // 统计数据
    'total_transfers': '总传输次数',
    'total_size': '总传输大小',
    'most_common_type': '最常见类型',
    'export_history': '导出历史',
    'clear_history': '清空历史',
    'confirm_clear': '确定要清空所有传输历史吗？',
    'export_json': '导出为 JSON',
    'export_csv': '导出为 CSV',
    'sent_to': '发送给',
    'received_from': '接收自',
    'file_size': '文件大小',
    'transfer_time': '传输时间',
    'transfer_status': '传输状态',
    'status_completed': '已完成',
    'status_failed': '失败',
    'status_cancelled': '已取消',
    'message_content': '消息内容',
    'all_types': '所有类型',
    'all_directions': '所有方向',
    'all_file_types': '所有文件类型',
    'clear_filters': '清除筛选',
    'time': '时间',
    'type': '类型',
    'direction': '方向',
    'name': '名称',
    'size': '大小',
    'device': '设备',
    'export': '导出',
    'sent': '已发送',
    'received': '已接收',
    'back_to_home': '返回首页'
};

console.log('=== 推荐的中文翻译 ===\n');
console.log('以下是为缺失键推荐的中文翻译：\n');

missingKeys.forEach(item => {
    const translation = chineseTranslations[item.key] || `[需要翻译: ${item.englishValue}]`;
    console.log(`"${item.key}": "${translation}",`);
});

// 保存翻译到文件
const translationsForMissingKeys = {};
missingKeys.forEach(item => {
    translationsForMissingKeys[item.key] = chineseTranslations[item.key] || item.englishValue;
});

fs.writeFileSync('./zh_missing_translations.json', JSON.stringify(translationsForMissingKeys, null, 2), 'utf8');
console.log('\n翻译建议已保存到: zh_missing_translations.json');