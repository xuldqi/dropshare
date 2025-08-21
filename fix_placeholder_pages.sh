#!/bin/bash

# 快速修复占位页面的国际化支持

declare -A pages=(
    ["image-cropper.html"]="image_cropper_heading|✂️ 图片裁剪器"
    ["image-rotator.html"]="image_rotator_heading|🔄 图片旋转器"
)

for page in "${!pages[@]}"; do
    echo "修复 $page..."
    
    IFS='|' read -r heading_key heading_text <<< "${pages[$page]}"
    
    # 添加语言选择器和国际化属性
    sed -i.bak -E '
        # 修复h1元素
        s|<h1>([^<]+)</h1>|<h1 data-i18n="'"$heading_key"'">\1</h1>|g
        
        # 添加语言选择器到header-buttons
        s|<div class="header-buttons">|<div class="header-buttons"><div class="control-buttons"><div class="lang-selector"><select id="language-selector" title="Select Language" data-i18n="title_select_language"><option value="en">English</option><option value="zh">中文简体</option><option value="zh-tw">中文繁體</option><option value="ja">日本語</option><option value="fr">Français</option><option value="es">Español</option><option value="de">Deutsch</option><option value="pt">Português</option><option value="ru">Русский</option><option value="ar">العربية</option><option value="ko">한국어</option></select></div></div>|
        
        # 修复返回按钮
        s|<a href="image-tools.html" class="back-button">← 图片工具</a>|<a href="image-tools.html" class="back-button" data-i18n="back_to_image_tools">← 图片工具</a>|
        s|<a href="index.html" class="back-button">🏠 首页</a>|<a href="index.html" class="back-button" data-i18n="btn_home">🏠 首页</a>|
        
        # 修复其他元素
        s|<h2 class="tool-title">即将推出</h2>|<h2 class="tool-title" data-i18n="coming_soon">即将推出</h2>|
        s|<h3>🎯 预期功能</h3>|<h3 data-i18n="expected_features">🎯 预期功能</h3>|
        s|<div class="coming-soon">🚧</div>|<div class="coming-soon" data-i18n="coming_soon_icon">🚧</div>|
        s|<button class="notify-btn" onclick="alert.*">|<button class="notify-btn" onclick="showNotifyMessage()" data-i18n="btn_notify_launch">|
    ' "$page"
    
    echo "✅ $page 修复完成"
done

echo "所有页面修复完成！"