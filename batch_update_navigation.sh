#!/bin/bash

# 批量更新工具子页面的移动端导航

echo "开始批量更新工具子页面的移动端导航..."

# 定义需要处理的页面列表
PAGES=(
    "public/image-compressor-new.html"
    "public/image-converter-new.html"
    "public/image-filter-effects-new.html"
    "public/image-resizer-new.html"
    "public/image-rotator-new.html"
    "public/image-watermark-tool-new.html"
    "public/audio-compressor-real.html"
    "public/audio-converter-real.html"
    "public/audio-effects-real.html"
    "public/audio-merger-real.html"
    "public/audio-trimmer-real.html"
    "public/bitrate-converter-real.html"
    "public/document-converter-real.html"
    "public/frame-rate-converter-real.html"
    "public/metadata-editor-real.html"
    "public/pdf-compressor-real.html"
    "public/pdf-merger-real.html"
    "public/pdf-splitter-real.html"
    "public/resolution-changer-real.html"
    "public/subtitle-editor-real.html"
    "public/text-extractor-real.html"
    "public/video-compressor-real.html"
    "public/video-converter-real.html"
    "public/video-effects-real.html"
    "public/video-merger-real.html"
    "public/video-trimmer-real.html"
    "public/volume-normalizer-real.html"
)

# 计数器
processed=0
total=${#PAGES[@]}

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "处理页面: $page"
        
        # 检查是否已经有brand-left结构
        if grep -q "brand-left" "$page"; then
            echo "  ✓ $page 已经有brand-left结构，跳过"
        else
            echo "  → 更新 $page 的导航结构"
            
            # 创建临时文件
            temp_file="${page}.tmp"
            
            # 使用sed进行替换
            sed 's|<a href="/" class="logo">|<div class="header-controls">\n                <div class="brand-left">\n                    <button class="hamburger" id="hamburgerBtn" aria-label="Open Menu"><span></span></button>\n                    <div class="logo">\n                        <svg viewBox="0 0 24 24">\n                            <path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 2c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19zM12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z"/>\n                        </svg>\n                        <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>\n                    </div>\n                </div>\n                <nav class="nav-links" id="mobileNavLinks">|g' "$page" > "$temp_file"
            
            # 检查sed是否成功
            if [ $? -eq 0 ]; then
                mv "$temp_file" "$page"
                echo "  ✓ 已更新 $page"
            else
                echo "  ✗ 更新 $page 失败"
                rm -f "$temp_file"
            fi
        fi
        
        ((processed++))
    else
        echo "  ✗ 文件不存在: $page"
    fi
done

echo "批量更新完成！处理了 $processed/$total 个页面。"
echo "请手动检查并完善剩余的CSS样式和JavaScript引用。"