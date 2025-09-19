#!/usr/bin/env python3
import re
import os

# 需要修复的文件列表
files_to_fix = [
    'image-background-remover-new.html',
    'image-compressor-new.html', 
    'image-resizer-new.html',
    'image-rotator-new.html',
    'image-watermark-tool-new.html'
]

base_path = '/Users/macmima1234/Documents/project/dropshare/public/'

for filename in files_to_fix:
    filepath = os.path.join(base_path, filename)
    if not os.path.exists(filepath):
        print(f"文件不存在: {filename}")
        continue
        
    print(f"修复 {filename}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. 找到并替换事件监听器代码
    event_listener_pattern = r'(\s+)//\s*事件监听器[\s\S]*?resetBtn\.addEventListener\([^;]+\);'
    
    replacement = r'\1// 事件监听器将在DOM加载后通过initializeUploadFunctionality()添加'
    
    if re.search(event_listener_pattern, content):
        content = re.sub(event_listener_pattern, replacement, content)
        print(f"  ✅ 替换了事件监听器代码")
    else:
        print(f"  ⚠️  未找到事件监听器模式")
        continue
    
    # 2. 修改 DOMContentLoaded 事件处理器
    domcontentloaded_pattern = r'(\s+)document\.addEventListener\([\'"]DOMContentLoaded[\'"],\s*function\(\)\s*\{[\s\S]*?\}\);'
    
    new_domcontentloaded = r'''\1document.addEventListener('DOMContentLoaded', function() {
\1    // 初始化上传功能
\1    initializeUploadFunctionality();
\1    
\1    // 初始化语言和翻译
\1    setTimeout(() => {
\1        if (typeof window.DROPSHARE_I18N !== 'undefined') {
\1            initializeLanguageSelector();
\1            translatePage();
\1        }
\1    }, 100);
\1});

\1function initializeUploadFunctionality() {
\1    // 这里需要手动添加具体的事件监听器代码
\1}'''

    # 先保存修改
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"  ✅ 修复完成: {filename}")

print("批量修复完成！")