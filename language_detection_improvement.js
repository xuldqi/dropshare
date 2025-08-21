/**
 * 改进的语言检测逻辑补丁
 * 这个文件包含了对现有语言检测系统的改进建议
 */

// 改进的语言管理器初始化方法
const improvedLanguageManager = {
    // 验证保存的语言是否与浏览器语言合理匹配
    validateSavedLanguage: function(savedLang, browserLang) {
        if (!savedLang || !browserLang) return false;
        
        // 获取浏览器的主要语言代码
        const browserMainLang = browserLang.split('-')[0].toLowerCase();
        
        // 如果保存的语言与浏览器主要语言差异太大，可能存在问题
        const savedMainLang = savedLang.split('-')[0].toLowerCase();
        
        // 定义语言族群，这些语言之间的切换是合理的
        const languageFamilies = [
            ['zh', 'zh-tw'],  // 中文族群
            ['en'],           // 英语
            ['ja'],           // 日语
            ['ko'],           // 韩语
            ['ar'],           // 阿拉伯语
            ['ru'],           // 俄语
            ['fr'],           // 法语
            ['de'],           // 德语
            ['es'],           // 西班牙语
            ['pt']            // 葡萄牙语
        ];
        
        // 检查是否在同一语言族群内
        for (const family of languageFamilies) {
            if (family.includes(savedMainLang) && family.includes(browserMainLang)) {
                return true;
            }
        }
        
        // 如果不在同一族群，检查是否是用户可能的有意设置
        // 例如，中文用户学习英语，设置为英语是合理的
        const commonSecondaryLanguages = ['en', 'zh'];
        if (commonSecondaryLanguages.includes(savedMainLang)) {
            return true;
        }
        
        return false;
    },
    
    // 改进的初始化方法
    improvedInit: function() {
        const savedLang = this.getSavedLanguage();
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const detectedLang = this.detectLanguage();
        
        console.log('语言检测调试信息:');
        console.log('- 浏览器语言:', browserLang);
        console.log('- 保存的语言:', savedLang);
        console.log('- 检测的语言:', detectedLang);
        
        if (savedLang && LANGUAGES[savedLang]) {
            // 验证保存的语言是否合理
            if (this.validateSavedLanguage(savedLang, browserLang)) {
                console.log('- 使用保存的语言:', savedLang);
                this.setLanguage(savedLang);
            } else {
                console.warn('- 保存的语言与浏览器语言不匹配，重置为检测语言');
                console.warn(`  保存的: ${savedLang}, 浏览器: ${browserLang}`);
                
                // 清除不合理的语言设置
                this.clearSavedLanguage();
                
                // 使用检测的语言
                this.setLanguage(detectedLang);
                
                // 提示用户
                if (typeof window !== 'undefined' && window.console) {
                    console.info('DropShare: 检测到语言设置异常已自动修复');
                }
            }
        } else {
            console.log('- 使用检测的语言:', detectedLang);
            this.setLanguage(detectedLang);
        }
    },
    
    // 清除保存的语言设置
    clearSavedLanguage: function() {
        try {
            localStorage.removeItem('dropshare_language');
            return true;
        } catch (e) {
            console.error('清除语言设置失败:', e);
            return false;
        }
    },
    
    // 改进的语言检测，支持更多中文变体
    improvedDetectLanguage: function() {
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        const langCode = browserLang.toLowerCase();
        
        console.log('正在检测语言:', browserLang, '->', langCode);
        
        // 精确匹配
        if (LANGUAGES[langCode]) {
            return langCode;
        }
        
        // 中文特殊处理
        if (langCode.startsWith('zh')) {
            if (langCode.includes('tw') || langCode.includes('hk') || langCode.includes('mo')) {
                return LANGUAGES['zh-tw'] ? 'zh-tw' : 'zh';
            }
            return 'zh';
        }
        
        // 其他语言的简化匹配
        const langMappings = {
            'ja': 'ja',
            'ko': 'ko', 
            'ar': 'ar',
            'ru': 'ru',
            'fr': 'fr',
            'de': 'de',
            'es': 'es',
            'pt': 'pt'
        };
        
        for (const [prefix, code] of Object.entries(langMappings)) {
            if (langCode.startsWith(prefix) && LANGUAGES[code]) {
                return code;
            }
        }
        
        // 默认返回英语
        return 'en';
    },
    
    // 重置语言设置的公共方法
    resetLanguageSettings: function() {
        this.clearSavedLanguage();
        const detectedLang = this.improvedDetectLanguage();
        this.setLanguage(detectedLang);
        
        // 重新应用翻译
        if (typeof document !== 'undefined') {
            const i18nElements = document.querySelectorAll('[data-i18n]');
            i18nElements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = this.t(key);
                if (translation !== key) {
                    element.textContent = translation;
                }
            });
        }
        
        return detectedLang;
    }
};

// 应用补丁的方法
function applyLanguageDetectionPatch() {
    if (typeof window !== 'undefined' && window.LanguageManager) {
        // 添加改进的方法到现有的 LanguageManager
        window.LanguageManager.validateSavedLanguage = improvedLanguageManager.validateSavedLanguage;
        window.LanguageManager.improvedInit = improvedLanguageManager.improvedInit;
        window.LanguageManager.clearSavedLanguage = improvedLanguageManager.clearSavedLanguage;
        window.LanguageManager.improvedDetectLanguage = improvedLanguageManager.improvedDetectLanguage;
        window.LanguageManager.resetLanguageSettings = improvedLanguageManager.resetLanguageSettings;
        
        // 提供全局重置方法
        window.resetDropShareLanguage = function() {
            return window.LanguageManager.resetLanguageSettings();
        };
        
        console.log('✅ 语言检测补丁已应用');
        console.log('📝 可以使用 resetDropShareLanguage() 重置语言设置');
    } else {
        console.error('❌ 未找到 LanguageManager，无法应用补丁');
    }
}

// 自动应用补丁（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    // 等待页面加载完成后应用补丁
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLanguageDetectionPatch);
    } else {
        applyLanguageDetectionPatch();
    }
}

// 导出供 Node.js 环境使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        improvedLanguageManager,
        applyLanguageDetectionPatch
    };
}