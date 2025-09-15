#!/usr/bin/env python3
"""
批量更新工具页面的导航栏和语言选择器
"""

import os
import re

# 工具页面列表
TOOL_PAGES = [
    "audio-compressor-real.html",
    "audio-trimmer-real.html", 
    "audio-merger-real.html",
    "audio-effects-real.html",
    "video-converter-new.html",
    "video-compressor-new.html",
    "document-converter-new.html",
    "pdf-tools-new.html"
]

# 标准header模板
HEADER_TEMPLATE = '''    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>
            </div>

            <div class="header-controls">
                <nav class="nav-links">
                    <a href="share.html" data-i18n="nav_transfer">Transfer</a>
                    <a href="share.html#rooms" data-i18n="nav_rooms">Rooms</a>
                    <a href="image-tools.html" data-i18n="nav_images">Images</a>
                    <a href="audio-tools.html" data-i18n="nav_audio">Audio</a>
                    <a href="video-tools.html" data-i18n="nav_video">Video</a>
                    <a href="document-tools.html" data-i18n="nav_files">Files</a>
                </nav>

                <div class="control-buttons">
                    <!-- Language Selector -->
                    <div class="language-selector">
                        <select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </header>'''

# CSS添加
CSS_ADDITIONS = '''        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'''

# JavaScript添加
JS_ADDITIONS = '''    <script src="scripts/i18n/languages.js"></script>
    <script>
        // Language selector functions
        function initializeLanguageSelector() {
            const languageSelector = document.getElementById('language-selector');
            
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
                
                languageSelector.addEventListener('change', function() {
                    const selectedLang = this.value;
                    window.DROPSHARE_I18N.changeLanguage(selectedLang);
                    translatePage();
                });
            }
        }

        function syncLanguageSelector() {
            const languageSelector = document.getElementById('language-selector');
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
            }
        }

        function translatePage() {
            if (!window.DROPSHARE_I18N) return;
            
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = window.DROPSHARE_I18N.t(key);
                
                if (translation && translation !== key) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.value = translation;
                    } else if (element.hasAttribute('data-i18n-placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });
        }

        // Initialize language system when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (typeof window.DROPSHARE_I18N !== 'undefined') {
                    initializeLanguageSelector();
                    setTimeout(() => {
                        syncLanguageSelector();
                        translatePage();
                    }, 100);
                }
            }, 100);
        });
    </script>'''

def update_tool_page(filepath):
    """更新单个工具页面"""
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        return False
    
    # 读取文件内容
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 创建备份
    backup_path = filepath + '.backup'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # 替换header
    header_pattern = r'<header class="header">.*?</header>'
    content = re.sub(header_pattern, HEADER_TEMPLATE, content, flags=re.DOTALL)
    
    # 添加CSS样式
    if '.control-buttons' not in content:
        css_pattern = r'(\.nav-links a\.active \{[^}]+\})'
        content = re.sub(css_pattern, r'\1\n' + CSS_ADDITIONS, content)
    
    # 添加JavaScript
    if 'scripts/i18n/languages.js' not in content:
        # 在</body>前添加JavaScript
        content = content.replace('</body>', JS_ADDITIONS + '\n</body>')
    
    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已更新: {filepath}")
    return True

def main():
    """主函数"""
    print("开始批量更新工具页面...")
    
    updated_count = 0
    for page in TOOL_PAGES:
        filepath = f"public/{page}"
        if update_tool_page(filepath):
            updated_count += 1
    
    print(f"完成! 共更新了 {updated_count} 个文件")

if __name__ == "__main__":
    main()

"""
批量更新工具页面的导航栏和语言选择器
"""

import os
import re

# 工具页面列表
TOOL_PAGES = [
    "audio-compressor-real.html",
    "audio-trimmer-real.html", 
    "audio-merger-real.html",
    "audio-effects-real.html",
    "video-converter-new.html",
    "video-compressor-new.html",
    "document-converter-new.html",
    "pdf-tools-new.html"
]

# 标准header模板
HEADER_TEMPLATE = '''    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>
            </div>

            <div class="header-controls">
                <nav class="nav-links">
                    <a href="share.html" data-i18n="nav_transfer">Transfer</a>
                    <a href="share.html#rooms" data-i18n="nav_rooms">Rooms</a>
                    <a href="image-tools.html" data-i18n="nav_images">Images</a>
                    <a href="audio-tools.html" data-i18n="nav_audio">Audio</a>
                    <a href="video-tools.html" data-i18n="nav_video">Video</a>
                    <a href="document-tools.html" data-i18n="nav_files">Files</a>
                </nav>

                <div class="control-buttons">
                    <!-- Language Selector -->
                    <div class="language-selector">
                        <select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </header>'''

# CSS添加
CSS_ADDITIONS = '''        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'''

# JavaScript添加
JS_ADDITIONS = '''    <script src="scripts/i18n/languages.js"></script>
    <script>
        // Language selector functions
        function initializeLanguageSelector() {
            const languageSelector = document.getElementById('language-selector');
            
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
                
                languageSelector.addEventListener('change', function() {
                    const selectedLang = this.value;
                    window.DROPSHARE_I18N.changeLanguage(selectedLang);
                    translatePage();
                });
            }
        }

        function syncLanguageSelector() {
            const languageSelector = document.getElementById('language-selector');
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
            }
        }

        function translatePage() {
            if (!window.DROPSHARE_I18N) return;
            
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.getAttribute('data-i18n');
                const translation = window.DROPSHARE_I18N.t(key);
                
                if (translation && translation !== key) {
                    if (element.tagName === 'INPUT' && element.type === 'text') {
                        element.value = translation;
                    } else if (element.hasAttribute('data-i18n-placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });
        }

        // Initialize language system when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (typeof window.DROPSHARE_I18N !== 'undefined') {
                    initializeLanguageSelector();
                    setTimeout(() => {
                        syncLanguageSelector();
                        translatePage();
                    }, 100);
                }
            }, 100);
        });
    </script>'''

def update_tool_page(filepath):
    """更新单个工具页面"""
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        return False
    
    # 读取文件内容
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 创建备份
    backup_path = filepath + '.backup'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    # 替换header
    header_pattern = r'<header class="header">.*?</header>'
    content = re.sub(header_pattern, HEADER_TEMPLATE, content, flags=re.DOTALL)
    
    # 添加CSS样式
    if '.control-buttons' not in content:
        css_pattern = r'(\.nav-links a\.active \{[^}]+\})'
        content = re.sub(css_pattern, r'\1\n' + CSS_ADDITIONS, content)
    
    # 添加JavaScript
    if 'scripts/i18n/languages.js' not in content:
        # 在</body>前添加JavaScript
        content = content.replace('</body>', JS_ADDITIONS + '\n</body>')
    
    # 写回文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"已更新: {filepath}")
    return True

def main():
    """主函数"""
    print("开始批量更新工具页面...")
    
    updated_count = 0
    for page in TOOL_PAGES:
        filepath = f"public/{page}"
        if update_tool_page(filepath):
            updated_count += 1
    
    print(f"完成! 共更新了 {updated_count} 个文件")

if __name__ == "__main__":
    main()
