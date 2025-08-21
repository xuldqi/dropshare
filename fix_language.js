// DropShare 语言修复脚本
// 在浏览器控制台中运行此脚本来修复语言问题

(function() {
    console.log('🔧 DropShare 语言修复工具');
    console.log('=======================');
    
    // 检查当前状态
    const browserLang = navigator.language || navigator.userLanguage;
    const savedLang = localStorage.getItem('dropshare_language');
    
    console.log('📱 浏览器语言:', browserLang);
    console.log('💾 保存的语言:', savedLang || '无');
    
    // 检测问题
    if (savedLang === 'ja' && !browserLang.startsWith('ja')) {
        console.log('❌ 发现问题: localStorage中保存了日语，但浏览器不是日语');
        console.log('🔧 正在修复...');
        
        // 清除错误的语言设置
        localStorage.removeItem('dropshare_language');
        console.log('✅ 已清除错误的语言设置');
        
        // 根据浏览器语言设置正确的语言
        let correctLang = 'en'; // 默认英文
        if (browserLang.startsWith('zh')) {
            if (browserLang.includes('tw') || browserLang.includes('hk')) {
                correctLang = 'zh-tw';
            } else {
                correctLang = 'zh';
            }
        }
        
        localStorage.setItem('dropshare_language', correctLang);
        console.log('✅ 已设置正确的语言:', correctLang);
        
        // 重新加载页面
        console.log('🔄 即将重新加载页面...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } else if (!savedLang) {
        console.log('ℹ️ 未发现保存的语言设置，将使用自动检测');
    } else {
        console.log('✅ 语言设置正常');
    }
    
    // 提供手动修复选项
    window.fixLanguage = {
        clearStorage: function() {
            localStorage.removeItem('dropshare_language');
            console.log('✅ 语言设置已清除');
            window.location.reload();
        },
        setChinese: function() {
            localStorage.setItem('dropshare_language', 'zh');
            console.log('✅ 已设置为中文');
            window.location.reload();
        },
        setEnglish: function() {
            localStorage.setItem('dropshare_language', 'en');
            console.log('✅ 已设置为英文');
            window.location.reload();
        },
        setJapanese: function() {
            localStorage.setItem('dropshare_language', 'ja');
            console.log('✅ 已设置为日语');
            window.location.reload();
        }
    };
    
    console.log('');
    console.log('🛠️ 手动修复选项:');
    console.log('fixLanguage.clearStorage()  - 清除语言设置');
    console.log('fixLanguage.setChinese()    - 设置为中文');
    console.log('fixLanguage.setEnglish()    - 设置为英文');
    console.log('fixLanguage.setJapanese()   - 设置为日语');
})();