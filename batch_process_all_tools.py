#!/usr/bin/env python3
"""
批量处理所有工具页面，添加统一的导航栏和语言选择器
"""

import os
import re
import glob

# 获取所有工具页面
tool_pages = []
for pattern in ['public/image-*.html', 'public/audio-*.html', 'public/video-*.html', 'public/document-*.html']:
    tool_pages.extend(glob.glob(pattern))

# 过滤掉已经处理过的页面和工具页面
excluded_pages = [
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/image-compressor-new.html', 'public/image-converter-new.html', 'public/image-cropper-new.html',
    'public/image-background-remover-new.html', 'public/image-resizer-new.html', 'public/image-rotator-new.html',
    'public/audio-converter-ffmpeg-stable.html', 'public/audio-compressor-real.html', 'public/audio-effects-real.html',
    'public/audio-merger-real.html', 'public/video-converter-real.html', 'public/video-compressor-real.html',
    'public/video-merger-real.html', 'public/document-converter-real.html', 'public/document-processor.html'
]

tool_pages = [page for page in tool_pages if page not in excluded_pages]

print(f"找到 {len(tool_pages)} 个需要处理的工具页面:")
for page in tool_pages:
    print(f"  - {page}")

# 统一的header模板
unified_header = '''    <header class="header">
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

# CSS样式
css_addition = '''
        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'''

# JavaScript功能
js_addition = '''
    <script src="scripts/i18n/languages.js"></script>
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

def process_page(file_path):
    """处理单个页面"""
    print(f"处理页面: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 替换header
        header_pattern = r'<header class="header">.*?</header>'
        if re.search(header_pattern, content, re.DOTALL):
            content = re.sub(header_pattern, unified_header, content, flags=re.DOTALL)
            print(f"  ✓ 替换了header")
        
        # 2. 添加CSS样式
        if '.nav-links a.active' in content and '.header-controls' not in content:
            content = content.replace(
                '.nav-links a.active {\n            color: #3367d6;\n            background: #e3f2fd;\n            font-weight: 600;\n        }',
                '.nav-links a.active {\n            color: #3367d6;\n            background: #e3f2fd;\n            font-weight: 600;\n        }' + css_addition
            )
            print(f"  ✓ 添加了CSS样式")
        
        # 3. 添加JavaScript功能
        if '</script>' in content and 'scripts/i18n/languages.js' not in content:
            # 在最后一个</script>之前添加
            last_script_pos = content.rfind('</script>')
            if last_script_pos != -1:
                content = content[:last_script_pos] + js_addition + '\n    ' + content[last_script_pos:]
                print(f"  ✓ 添加了JavaScript功能")
        
        # 4. 添加翻译键到页面标题
        title_pattern = r'<h1 class="page-title">([^<]+)</h1>'
        if re.search(title_pattern, content):
            def replace_title(match):
                title = match.group(1).strip()
                # 生成翻译键名
                tool_name = os.path.basename(file_path).replace('.html', '').replace('-', '_')
                translation_key = f"{tool_name}_title"
                return f'<h1 class="page-title" data-i18n="{translation_key}">{title}</h1>'
            
            content = re.sub(title_pattern, replace_title, content)
            print(f"  ✓ 添加了页面标题翻译键")
        
        # 5. 添加翻译键到页面副标题
        subtitle_pattern = r'<p class="page-subtitle">([^<]+)</p>'
        if re.search(subtitle_pattern, content):
            def replace_subtitle(match):
                subtitle = match.group(1).strip()
                # 生成翻译键名
                tool_name = os.path.basename(file_path).replace('.html', '').replace('-', '_')
                translation_key = f"{tool_name}_subtitle"
                return f'<p class="page-subtitle" data-i18n="{translation_key}">{subtitle}</p>'
            
            content = re.sub(subtitle_pattern, replace_subtitle, content)
            print(f"  ✓ 添加了页面副标题翻译键")
        
        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ 页面处理完成")
        return True
        
    except Exception as e:
        print(f"  ✗ 处理失败: {e}")
        return False

# 批量处理所有页面
success_count = 0
for page in tool_pages:
    if process_page(page):
        success_count += 1
    print()

print(f"批量处理完成！成功处理了 {success_count}/{len(tool_pages)} 个页面")

"""
批量处理所有工具页面，添加统一的导航栏和语言选择器
"""

import os
import re
import glob

# 获取所有工具页面
tool_pages = []
for pattern in ['public/image-*.html', 'public/audio-*.html', 'public/video-*.html', 'public/document-*.html']:
    tool_pages.extend(glob.glob(pattern))

# 过滤掉已经处理过的页面和工具页面
excluded_pages = [
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/image-compressor-new.html', 'public/image-converter-new.html', 'public/image-cropper-new.html',
    'public/image-background-remover-new.html', 'public/image-resizer-new.html', 'public/image-rotator-new.html',
    'public/audio-converter-ffmpeg-stable.html', 'public/audio-compressor-real.html', 'public/audio-effects-real.html',
    'public/audio-merger-real.html', 'public/video-converter-real.html', 'public/video-compressor-real.html',
    'public/video-merger-real.html', 'public/document-converter-real.html', 'public/document-processor.html'
]

tool_pages = [page for page in tool_pages if page not in excluded_pages]

print(f"找到 {len(tool_pages)} 个需要处理的工具页面:")
for page in tool_pages:
    print(f"  - {page}")

# 统一的header模板
unified_header = '''    <header class="header">
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

# CSS样式
css_addition = '''
        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'''

# JavaScript功能
js_addition = '''
    <script src="scripts/i18n/languages.js"></script>
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

def process_page(file_path):
    """处理单个页面"""
    print(f"处理页面: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 1. 替换header
        header_pattern = r'<header class="header">.*?</header>'
        if re.search(header_pattern, content, re.DOTALL):
            content = re.sub(header_pattern, unified_header, content, flags=re.DOTALL)
            print(f"  ✓ 替换了header")
        
        # 2. 添加CSS样式
        if '.nav-links a.active' in content and '.header-controls' not in content:
            content = content.replace(
                '.nav-links a.active {\n            color: #3367d6;\n            background: #e3f2fd;\n            font-weight: 600;\n        }',
                '.nav-links a.active {\n            color: #3367d6;\n            background: #e3f2fd;\n            font-weight: 600;\n        }' + css_addition
            )
            print(f"  ✓ 添加了CSS样式")
        
        # 3. 添加JavaScript功能
        if '</script>' in content and 'scripts/i18n/languages.js' not in content:
            # 在最后一个</script>之前添加
            last_script_pos = content.rfind('</script>')
            if last_script_pos != -1:
                content = content[:last_script_pos] + js_addition + '\n    ' + content[last_script_pos:]
                print(f"  ✓ 添加了JavaScript功能")
        
        # 4. 添加翻译键到页面标题
        title_pattern = r'<h1 class="page-title">([^<]+)</h1>'
        if re.search(title_pattern, content):
            def replace_title(match):
                title = match.group(1).strip()
                # 生成翻译键名
                tool_name = os.path.basename(file_path).replace('.html', '').replace('-', '_')
                translation_key = f"{tool_name}_title"
                return f'<h1 class="page-title" data-i18n="{translation_key}">{title}</h1>'
            
            content = re.sub(title_pattern, replace_title, content)
            print(f"  ✓ 添加了页面标题翻译键")
        
        # 5. 添加翻译键到页面副标题
        subtitle_pattern = r'<p class="page-subtitle">([^<]+)</p>'
        if re.search(subtitle_pattern, content):
            def replace_subtitle(match):
                subtitle = match.group(1).strip()
                # 生成翻译键名
                tool_name = os.path.basename(file_path).replace('.html', '').replace('-', '_')
                translation_key = f"{tool_name}_subtitle"
                return f'<p class="page-subtitle" data-i18n="{translation_key}">{subtitle}</p>'
            
            content = re.sub(subtitle_pattern, replace_subtitle, content)
            print(f"  ✓ 添加了页面副标题翻译键")
        
        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✓ 页面处理完成")
        return True
        
    except Exception as e:
        print(f"  ✗ 处理失败: {e}")
        return False

# 批量处理所有页面
success_count = 0
for page in tool_pages:
    if process_page(page):
        success_count += 1
    print()

print(f"批量处理完成！成功处理了 {success_count}/{len(tool_pages)} 个页面")
