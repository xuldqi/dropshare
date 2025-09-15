#!/usr/bin/env python3
"""
修复所有工具页面的语言选择器，添加完整的9种语言选项
"""

import os
import glob
import re

def get_all_tool_pages():
    """获取所有工具页面"""
    # 获取所有HTML文件
    all_pages = glob.glob('public/*.html')
    
    # 排除主要页面
    excluded_pages = [
        'public/index.html', 'public/share.html', 'public/rooms.html',
        'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
        'public/privacy.html', 'public/about.html', 'public/blog.html',
        'public/simple-test.html', 'public/test-share-rooms.html', 'public/index-modern.html', 'public/about-light.html',
        'public/terms.html', 'public/faq.html', 'public/history.html', 'public/analytics.html'
    ]
    
    # 过滤出工具页面
    tool_pages = [page for page in all_pages if page not in excluded_pages]
    
    return tool_pages

def fix_language_selector(file_path):
    """修复单个文件的语言选择器"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有语言选择器
        if 'language-selector' not in content:
            print(f"  - 跳过 {file_path} (没有语言选择器)")
            return False
        
        # 检查是否已经有完整的9种语言
        if 'Français' in content and 'Deutsch' in content and 'Português' in content and 'Español' in content:
            print(f"  - 跳过 {file_path} (已经有完整的9种语言)")
            return False
        
        # 找到语言选择器部分
        pattern = r'(<select id="language-selector"[^>]*>.*?</select>)'
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            print(f"  - 跳过 {file_path} (找不到语言选择器)")
            return False
        
        old_selector = match.group(1)
        
        # 创建完整的语言选择器
        new_selector = '''<select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="pt">Português</option>
                            <option value="es">Español</option>
                        </select>'''
        
        # 替换语言选择器
        new_content = content.replace(old_selector, new_selector)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ 修复了 {file_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ 处理 {file_path} 失败: {e}")
        return False

def main():
    print("🔧 修复所有工具页面的语言选择器...")
    
    # 获取所有工具页面
    tool_pages = get_all_tool_pages()
    print(f"找到 {len(tool_pages)} 个工具页面")
    
    # 修复每个页面
    fixed_count = 0
    for page in tool_pages:
        print(f"\n处理页面: {page}")
        if fix_language_selector(page):
            fixed_count += 1
    
    print(f"\n🎉 修复完成！")
    print(f"  - 总页面数: {len(tool_pages)}")
    print(f"  - 修复页面数: {fixed_count}")
    print(f"  - 跳过页面数: {len(tool_pages) - fixed_count}")

if __name__ == "__main__":
    main()

"""
修复所有工具页面的语言选择器，添加完整的9种语言选项
"""

import os
import glob
import re

def get_all_tool_pages():
    """获取所有工具页面"""
    # 获取所有HTML文件
    all_pages = glob.glob('public/*.html')
    
    # 排除主要页面
    excluded_pages = [
        'public/index.html', 'public/share.html', 'public/rooms.html',
        'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
        'public/privacy.html', 'public/about.html', 'public/blog.html',
        'public/simple-test.html', 'public/test-share-rooms.html', 'public/index-modern.html', 'public/about-light.html',
        'public/terms.html', 'public/faq.html', 'public/history.html', 'public/analytics.html'
    ]
    
    # 过滤出工具页面
    tool_pages = [page for page in all_pages if page not in excluded_pages]
    
    return tool_pages

def fix_language_selector(file_path):
    """修复单个文件的语言选择器"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有语言选择器
        if 'language-selector' not in content:
            print(f"  - 跳过 {file_path} (没有语言选择器)")
            return False
        
        # 检查是否已经有完整的9种语言
        if 'Français' in content and 'Deutsch' in content and 'Português' in content and 'Español' in content:
            print(f"  - 跳过 {file_path} (已经有完整的9种语言)")
            return False
        
        # 找到语言选择器部分
        pattern = r'(<select id="language-selector"[^>]*>.*?</select>)'
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            print(f"  - 跳过 {file_path} (找不到语言选择器)")
            return False
        
        old_selector = match.group(1)
        
        # 创建完整的语言选择器
        new_selector = '''<select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="pt">Português</option>
                            <option value="es">Español</option>
                        </select>'''
        
        # 替换语言选择器
        new_content = content.replace(old_selector, new_selector)
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ 修复了 {file_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ 处理 {file_path} 失败: {e}")
        return False

def main():
    print("🔧 修复所有工具页面的语言选择器...")
    
    # 获取所有工具页面
    tool_pages = get_all_tool_pages()
    print(f"找到 {len(tool_pages)} 个工具页面")
    
    # 修复每个页面
    fixed_count = 0
    for page in tool_pages:
        print(f"\n处理页面: {page}")
        if fix_language_selector(page):
            fixed_count += 1
    
    print(f"\n🎉 修复完成！")
    print(f"  - 总页面数: {len(tool_pages)}")
    print(f"  - 修复页面数: {fixed_count}")
    print(f"  - 跳过页面数: {len(tool_pages) - fixed_count}")

if __name__ == "__main__":
    main()
