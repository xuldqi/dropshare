#!/bin/bash

# 修复导航添加脚本 - 使用临时文件避免sed的换行问题

echo "开始为所有HTML页面添加统一导航..."

# 创建临时导航文件
cat > /tmp/navigation_template.html << 'EOF'
<!-- 统一导航模板 -->
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
</nav>

EOF

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
    
    # 检查是否已有top-navbar
    if grep -q "top-navbar" "$file"; then
        echo "  ⚠ 文件已有导航: $file"
        continue
    fi
    
    # 检查是否已有<body>标签
    if grep -q "<body" "$file"; then
        # 使用awk在<body>后插入导航
        awk '
        /<body[^>]*>/ {
            print $0
            while ((getline line < "/tmp/navigation_template.html") > 0) {
                print line
            }
            close("/tmp/navigation_template.html")
            next
        }
        {print}
        ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        
        echo "  ✓ 已添加导航到 $file"
        ((count++))
    else
        echo "  ⚠ 警告: $file 没有找到<body>标签"
    fi
done

# 清理临时文件
rm -f /tmp/navigation_template.html

echo "统一导航添加完成！共处理了 $count 个文件。"