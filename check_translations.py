#!/usr/bin/env python3
"""
检查所有页面的翻译键是否都已经添加到 languages.js 中
"""

import os
import re
import glob

# 获取所有HTML页面
all_pages = glob.glob('public/*.html')

# 排除不需要检查的页面
excluded_pages = [
    'public/index.html', 'public/share.html', 'public/rooms.html',
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/privacy.html', 'public/about.html', 'public/blog.html',
    'public/simple-test.html', 'public/test-share-rooms.html', 'public/index-modern.html', 'public/about-light.html',
    'public/terms.html', 'public/faq.html', 'public/history.html', 'public/analytics.html'
]

# 过滤出需要检查的页面
tool_pages = [page for page in all_pages if page not in excluded_pages]

print(f"检查 {len(tool_pages)} 个工具页面的翻译键...")

# 收集所有翻译键
missing_translations = []

for page in tool_pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取页面标题和副标题的翻译键
        title_matches = re.findall(r'data-i18n="([^"]+)"', content)
        
        for key in title_matches:
            if key not in ['site_name', 'nav_transfer', 'nav_rooms', 'nav_images', 'nav_audio', 'nav_video', 'nav_files']:
                missing_translations.append((page, key))
                
    except Exception as e:
        print(f"  ✗ 处理 {page} 失败: {e}")

print(f"\n找到 {len(missing_translations)} 个翻译键需要检查:")

# 读取 languages.js 文件
try:
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        languages_content = f.read()
    
    # 检查每个翻译键是否存在于 languages.js 中
    missing_in_js = []
    for page, key in missing_translations:
        if key not in languages_content:
            missing_in_js.append((page, key))
    
    if missing_in_js:
        print(f"\n❌ 发现 {len(missing_in_js)} 个翻译键缺失:")
        for page, key in missing_in_js:
            print(f"  - {page}: {key}")
    else:
        print(f"\n✅ 所有翻译键都已存在于 languages.js 中！")
    
    # 统计翻译键数量
    english_keys = re.findall(r'(\w+):\s*[\'"][^\'"]+[\'"]', languages_content)
    print(f"\n📊 统计信息:")
    print(f"  - 总翻译键数量: {len(english_keys)}")
    print(f"  - 检查的页面数量: {len(tool_pages)}")
    print(f"  - 缺失的翻译键: {len(missing_in_js)}")
    
except Exception as e:
    print(f"❌ 读取 languages.js 失败: {e}")

# 生成缺失的翻译键
if missing_in_js:
    print(f"\n🔧 生成缺失的翻译键:")
    
    # 按页面分组
    page_keys = {}
    for page, key in missing_in_js:
        if page not in page_keys:
            page_keys[page] = []
        page_keys[page].append(key)
    
    # 生成翻译键内容
    english_translations = []
    chinese_translations = []
    
    for page, keys in page_keys.items():
        print(f"\n页面: {page}")
        for key in keys:
            # 简单生成翻译内容
            if 'title' in key:
                if 'image' in key:
                    english_text = 'Image Tool'
                    chinese_text = '图片工具'
                elif 'audio' in key:
                    english_text = 'Audio Tool'
                    chinese_text = '音频工具'
                elif 'video' in key:
                    english_text = 'Video Tool'
                    chinese_text = '视频工具'
                elif 'document' in key:
                    english_text = 'Document Tool'
                    chinese_text = '文档工具'
                else:
                    english_text = 'Tool'
                    chinese_text = '工具'
            else:
                english_text = 'Professional online file processing tool'
                chinese_text = '专业的在线文件处理工具'
            
            english_translations.append(f"      {key}: '{english_text}',")
            chinese_translations.append(f"      {key}: '{chinese_text}',")
            print(f"  - {key}: {english_text}")
    
    # 保存到文件
    with open('missing_translations.txt', 'w', encoding='utf-8') as f:
        f.write("// 缺失的英文翻译键\n")
        for trans in english_translations:
            f.write(trans + '\n')
        f.write("\n// 缺失的中文翻译键\n")
        for trans in chinese_translations:
            f.write(trans + '\n')
    
    print(f"\n📝 缺失的翻译键已保存到 missing_translations.txt")

"""
检查所有页面的翻译键是否都已经添加到 languages.js 中
"""

import os
import re
import glob

# 获取所有HTML页面
all_pages = glob.glob('public/*.html')

# 排除不需要检查的页面
excluded_pages = [
    'public/index.html', 'public/share.html', 'public/rooms.html',
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/privacy.html', 'public/about.html', 'public/blog.html',
    'public/simple-test.html', 'public/test-share-rooms.html', 'public/index-modern.html', 'public/about-light.html',
    'public/terms.html', 'public/faq.html', 'public/history.html', 'public/analytics.html'
]

# 过滤出需要检查的页面
tool_pages = [page for page in all_pages if page not in excluded_pages]

print(f"检查 {len(tool_pages)} 个工具页面的翻译键...")

# 收集所有翻译键
missing_translations = []

for page in tool_pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取页面标题和副标题的翻译键
        title_matches = re.findall(r'data-i18n="([^"]+)"', content)
        
        for key in title_matches:
            if key not in ['site_name', 'nav_transfer', 'nav_rooms', 'nav_images', 'nav_audio', 'nav_video', 'nav_files']:
                missing_translations.append((page, key))
                
    except Exception as e:
        print(f"  ✗ 处理 {page} 失败: {e}")

print(f"\n找到 {len(missing_translations)} 个翻译键需要检查:")

# 读取 languages.js 文件
try:
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        languages_content = f.read()
    
    # 检查每个翻译键是否存在于 languages.js 中
    missing_in_js = []
    for page, key in missing_translations:
        if key not in languages_content:
            missing_in_js.append((page, key))
    
    if missing_in_js:
        print(f"\n❌ 发现 {len(missing_in_js)} 个翻译键缺失:")
        for page, key in missing_in_js:
            print(f"  - {page}: {key}")
    else:
        print(f"\n✅ 所有翻译键都已存在于 languages.js 中！")
    
    # 统计翻译键数量
    english_keys = re.findall(r'(\w+):\s*[\'"][^\'"]+[\'"]', languages_content)
    print(f"\n📊 统计信息:")
    print(f"  - 总翻译键数量: {len(english_keys)}")
    print(f"  - 检查的页面数量: {len(tool_pages)}")
    print(f"  - 缺失的翻译键: {len(missing_in_js)}")
    
except Exception as e:
    print(f"❌ 读取 languages.js 失败: {e}")

# 生成缺失的翻译键
if missing_in_js:
    print(f"\n🔧 生成缺失的翻译键:")
    
    # 按页面分组
    page_keys = {}
    for page, key in missing_in_js:
        if page not in page_keys:
            page_keys[page] = []
        page_keys[page].append(key)
    
    # 生成翻译键内容
    english_translations = []
    chinese_translations = []
    
    for page, keys in page_keys.items():
        print(f"\n页面: {page}")
        for key in keys:
            # 简单生成翻译内容
            if 'title' in key:
                if 'image' in key:
                    english_text = 'Image Tool'
                    chinese_text = '图片工具'
                elif 'audio' in key:
                    english_text = 'Audio Tool'
                    chinese_text = '音频工具'
                elif 'video' in key:
                    english_text = 'Video Tool'
                    chinese_text = '视频工具'
                elif 'document' in key:
                    english_text = 'Document Tool'
                    chinese_text = '文档工具'
                else:
                    english_text = 'Tool'
                    chinese_text = '工具'
            else:
                english_text = 'Professional online file processing tool'
                chinese_text = '专业的在线文件处理工具'
            
            english_translations.append(f"      {key}: '{english_text}',")
            chinese_translations.append(f"      {key}: '{chinese_text}',")
            print(f"  - {key}: {english_text}")
    
    # 保存到文件
    with open('missing_translations.txt', 'w', encoding='utf-8') as f:
        f.write("// 缺失的英文翻译键\n")
        for trans in english_translations:
            f.write(trans + '\n')
        f.write("\n// 缺失的中文翻译键\n")
        for trans in chinese_translations:
            f.write(trans + '\n')
    
    print(f"\n📝 缺失的翻译键已保存到 missing_translations.txt")
