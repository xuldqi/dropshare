#!/bin/bash

# 为所有HTML页面添加统一导航结构的脚本

NAVIGATION_TEMPLATE='<!-- 统一导航模板 -->
<nav class="top-navbar">
    <div class="navbar-container">
        <!-- Brand LOGO -->
        <a href="/" class="navbar-brand">
            <svg class="brand-icon" viewBox="0 0 24 24">
                <use xlink:href="#wifi-tethering" />
            </svg>
            <span data-i18n="brand">DropShare</span>
        </a>
        
        <!-- Navigation menu -->
        <ul class="navbar-nav">
            <li class="nav-item">
                <a href="/share.html" class="nav-link" data-i18n="nav.transfer">Transfer</a>
            </li>
            <li class="nav-item">
                <a href="/share.html#rooms" class="nav-link" data-i18n="nav.rooms">Rooms</a>
            </li>
            <li class="nav-item">
                <a href="image-tools.html" class="nav-link" data-i18n="nav.images">Images</a>
            </li>
            <li class="nav-item">
                <a href="audio-tools.html" class="nav-link" data-i18n="nav.audio">Audio</a>
            </li>
            <li class="nav-item">
                <a href="video-tools.html" class="nav-link" data-i18n="nav.video">Video</a>
            </li>
            <li class="nav-item">
                <a href="document-tools.html" class="nav-link" data-i18n="nav.documents">Documents</a>
            </li>
            <li class="nav-item language-selector">
                <!-- 语言选择器将由i18n.js动态生成 -->
            </li>
        </ul>
    </div>
</nav>'

echo "开始为所有HTML页面添加统一导航..."

# 获取所有HTML文件
all_pages=$(find /Users/macmima1234/Documents/project/dropshare/public -name "*.html")

count=0
for file in $all_pages; do
    echo "处理文件: $file"
    
    # 检查文件是否有内容
    if [ ! -s "$file" ]; then
        echo "  ⚠ 跳过空文件: $file"
        continue
    fi
    
    # 检查是否已有<body>标签
    if grep -q "<body" "$file"; then
        # 在<body>开始标签后添加导航
        sed -i.bak "s|<body[^>]*>|&\n${NAVIGATION_TEMPLATE}|" "$file"
        echo "  ✓ 已添加导航到 $file"
        ((count++))
    else
        echo "  ⚠ 警告: $file 没有找到<body>标签"
    fi
done

echo "统一导航添加完成！共处理了 $count 个文件。"