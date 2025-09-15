#!/usr/bin/env python3
"""
为新处理的工具页面添加翻译键到 languages.js
"""

import os
import re
import glob

# 获取所有新处理的工具页面
tool_pages = []
for pattern in ['public/image-*.html', 'public/audio-*.html', 'public/video-*.html', 'public/document-*.html']:
    tool_pages.extend(glob.glob(pattern))

# 过滤掉工具页面和已经处理过的页面
excluded_pages = [
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/image-compressor-new.html', 'public/image-converter-new.html', 'public/image-cropper-new.html',
    'public/image-background-remover-new.html', 'public/image-resizer-new.html', 'public/image-rotator-new.html',
    'public/audio-converter-ffmpeg-stable.html', 'public/audio-compressor-real.html', 'public/audio-effects-real.html',
    'public/audio-merger-real.html', 'public/video-converter-real.html', 'public/video-compressor-real.html',
    'public/video-merger-real.html', 'public/document-converter-real.html', 'public/document-processor.html'
]

tool_pages = [page for page in tool_pages if page not in excluded_pages]

print(f"为新处理的 {len(tool_pages)} 个页面添加翻译键:")

# 收集所有翻译键
translation_keys = []

for page in tool_pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取页面标题和副标题
        title_match = re.search(r'<h1 class="page-title" data-i18n="([^"]+)">([^<]+)</h1>', content)
        subtitle_match = re.search(r'<p class="page-subtitle" data-i18n="([^"]+)">([^<]+)</p>', content)
        
        if title_match:
            key = title_match.group(1)
            title = title_match.group(2)
            translation_keys.append((key, title, 'title'))
            print(f"  - {page}: {key} = {title}")
        
        if subtitle_match:
            key = subtitle_match.group(1)
            subtitle = subtitle_match.group(2)
            translation_keys.append((key, subtitle, 'subtitle'))
            print(f"  - {page}: {key} = {subtitle}")
            
    except Exception as e:
        print(f"  ✗ 处理 {page} 失败: {e}")

print(f"\n收集到 {len(translation_keys)} 个翻译键")

# 生成翻译键内容
english_translations = []
chinese_translations = []

for key, text, type_name in translation_keys:
    english_translations.append(f"      {key}: '{text}',")
    
    # 简单的中文翻译（这里可以根据需要改进）
    if 'image' in key:
        if 'watermark' in key:
            chinese_text = '图片水印工具'
        elif 'filter' in key:
            chinese_text = '图片滤镜工具'
        elif 'compressor' in key:
            chinese_text = '图片压缩器'
        elif 'converter' in key:
            chinese_text = '图片转换器'
        elif 'cropper' in key:
            chinese_text = '图片裁剪器'
        elif 'resizer' in key:
            chinese_text = '图片调整器'
        elif 'rotator' in key:
            chinese_text = '图片旋转器'
        else:
            chinese_text = '图片工具'
    elif 'audio' in key:
        if 'converter' in key:
            chinese_text = '音频转换器'
        elif 'compressor' in key:
            chinese_text = '音频压缩器'
        elif 'effects' in key:
            chinese_text = '音频效果器'
        elif 'merger' in key:
            chinese_text = '音频合并器'
        elif 'trimmer' in key:
            chinese_text = '音频修剪器'
        elif 'processor' in key:
            chinese_text = '音频处理器'
        else:
            chinese_text = '音频工具'
    elif 'video' in key:
        if 'converter' in key:
            chinese_text = '视频转换器'
        elif 'compressor' in key:
            chinese_text = '视频压缩器'
        elif 'effects' in key:
            chinese_text = '视频效果器'
        elif 'merger' in key:
            chinese_text = '视频合并器'
        elif 'trimmer' in key:
            chinese_text = '视频修剪器'
        elif 'info' in key:
            chinese_text = '视频信息工具'
        else:
            chinese_text = '视频工具'
    else:
        chinese_text = '工具'
    
    if type_name == 'subtitle':
        chinese_text += ' - 专业的在线文件处理工具'
    
    chinese_translations.append(f"      {key}: '{chinese_text}',")

print("\n生成的英文翻译键:")
for trans in english_translations:
    print(trans)

print("\n生成的中文翻译键:")
for trans in chinese_translations:
    print(trans)

# 将翻译键写入文件
with open('new_translation_keys.txt', 'w', encoding='utf-8') as f:
    f.write("// 英文翻译键\n")
    for trans in english_translations:
        f.write(trans + '\n')
    f.write("\n// 中文翻译键\n")
    for trans in chinese_translations:
        f.write(trans + '\n')

print(f"\n翻译键已保存到 new_translation_keys.txt")

"""
为新处理的工具页面添加翻译键到 languages.js
"""

import os
import re
import glob

# 获取所有新处理的工具页面
tool_pages = []
for pattern in ['public/image-*.html', 'public/audio-*.html', 'public/video-*.html', 'public/document-*.html']:
    tool_pages.extend(glob.glob(pattern))

# 过滤掉工具页面和已经处理过的页面
excluded_pages = [
    'public/image-tools.html', 'public/audio-tools.html', 'public/video-tools.html', 'public/document-tools.html',
    'public/image-compressor-new.html', 'public/image-converter-new.html', 'public/image-cropper-new.html',
    'public/image-background-remover-new.html', 'public/image-resizer-new.html', 'public/image-rotator-new.html',
    'public/audio-converter-ffmpeg-stable.html', 'public/audio-compressor-real.html', 'public/audio-effects-real.html',
    'public/audio-merger-real.html', 'public/video-converter-real.html', 'public/video-compressor-real.html',
    'public/video-merger-real.html', 'public/document-converter-real.html', 'public/document-processor.html'
]

tool_pages = [page for page in tool_pages if page not in excluded_pages]

print(f"为新处理的 {len(tool_pages)} 个页面添加翻译键:")

# 收集所有翻译键
translation_keys = []

for page in tool_pages:
    try:
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 提取页面标题和副标题
        title_match = re.search(r'<h1 class="page-title" data-i18n="([^"]+)">([^<]+)</h1>', content)
        subtitle_match = re.search(r'<p class="page-subtitle" data-i18n="([^"]+)">([^<]+)</p>', content)
        
        if title_match:
            key = title_match.group(1)
            title = title_match.group(2)
            translation_keys.append((key, title, 'title'))
            print(f"  - {page}: {key} = {title}")
        
        if subtitle_match:
            key = subtitle_match.group(1)
            subtitle = subtitle_match.group(2)
            translation_keys.append((key, subtitle, 'subtitle'))
            print(f"  - {page}: {key} = {subtitle}")
            
    except Exception as e:
        print(f"  ✗ 处理 {page} 失败: {e}")

print(f"\n收集到 {len(translation_keys)} 个翻译键")

# 生成翻译键内容
english_translations = []
chinese_translations = []

for key, text, type_name in translation_keys:
    english_translations.append(f"      {key}: '{text}',")
    
    # 简单的中文翻译（这里可以根据需要改进）
    if 'image' in key:
        if 'watermark' in key:
            chinese_text = '图片水印工具'
        elif 'filter' in key:
            chinese_text = '图片滤镜工具'
        elif 'compressor' in key:
            chinese_text = '图片压缩器'
        elif 'converter' in key:
            chinese_text = '图片转换器'
        elif 'cropper' in key:
            chinese_text = '图片裁剪器'
        elif 'resizer' in key:
            chinese_text = '图片调整器'
        elif 'rotator' in key:
            chinese_text = '图片旋转器'
        else:
            chinese_text = '图片工具'
    elif 'audio' in key:
        if 'converter' in key:
            chinese_text = '音频转换器'
        elif 'compressor' in key:
            chinese_text = '音频压缩器'
        elif 'effects' in key:
            chinese_text = '音频效果器'
        elif 'merger' in key:
            chinese_text = '音频合并器'
        elif 'trimmer' in key:
            chinese_text = '音频修剪器'
        elif 'processor' in key:
            chinese_text = '音频处理器'
        else:
            chinese_text = '音频工具'
    elif 'video' in key:
        if 'converter' in key:
            chinese_text = '视频转换器'
        elif 'compressor' in key:
            chinese_text = '视频压缩器'
        elif 'effects' in key:
            chinese_text = '视频效果器'
        elif 'merger' in key:
            chinese_text = '视频合并器'
        elif 'trimmer' in key:
            chinese_text = '视频修剪器'
        elif 'info' in key:
            chinese_text = '视频信息工具'
        else:
            chinese_text = '视频工具'
    else:
        chinese_text = '工具'
    
    if type_name == 'subtitle':
        chinese_text += ' - 专业的在线文件处理工具'
    
    chinese_translations.append(f"      {key}: '{chinese_text}',")

print("\n生成的英文翻译键:")
for trans in english_translations:
    print(trans)

print("\n生成的中文翻译键:")
for trans in chinese_translations:
    print(trans)

# 将翻译键写入文件
with open('new_translation_keys.txt', 'w', encoding='utf-8') as f:
    f.write("// 英文翻译键\n")
    for trans in english_translations:
        f.write(trans + '\n')
    f.write("\n// 中文翻译键\n")
    for trans in chinese_translations:
        f.write(trans + '\n')

print(f"\n翻译键已保存到 new_translation_keys.txt")
