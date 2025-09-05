#!/bin/bash

# Script to integrate sharing functionality into all tool pages

echo "🔗 Starting share integration..."
echo "======================"

# 1. Add sharing scripts to all HTML files
echo "📝 Step 1: Adding sharing scripts to HTML files..."
echo "-----------------------------------"

# HTML file patterns to process
HTML_FILES=(
    "public/*.html"
    "public/*-real.html"
    "public/*-new.html"
)

for pattern in "${HTML_FILES[@]}"; do
    for file in $pattern; do
        if [[ -f "$file" && ! "$file" =~ (share|rooms)\.html ]]; then
            echo "Processing file: $file"
            
            # Check if sharing script is already included
            if ! grep -q "add-share-integration.js" "$file"; then
                # Add sharing script and device selector before </body>
                sed -i.bak '/<\/body>/i\
    <!-- Share Integration -->\
    <script src="device-selector.js"></script>\
    <script src="add-share-integration.js"></script>
' "$file"
                echo "  ✅ 已添加分享脚本"
            else
                echo "  ⏭️  已存在分享脚本"
            fi
        fi
    done
done

echo ""

# 2. 在主页添加分享功能卡片
echo "🏠 第2步: 在主页添加分享功能..."
echo "------------------------------"

if [[ -f "public/index.html" ]]; then
    # 检查是否已经有分享卡片
    if ! grep -q "Device Sharing" "public/index.html"; then
        # 在工具网格中添加分享卡片
        cat >> temp_share_card.html << 'EOF'
            <div class="tool-card" onclick="window.open('/share.html', '_blank')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; cursor: pointer;">
                <div class="tool-icon">📤</div>
                <h3>Device Sharing</h3>
                <p>Share files directly between devices on the same network</p>
                <div class="tool-features">
                    <span>P2P Transfer</span>
                    <span>No Upload Limits</span>
                    <span>Real-time</span>
                </div>
            </div>
EOF
        
        # 找到第一个工具卡片的位置并插入
        if grep -q "tool-card" "public/index.html"; then
            # 在第一个tool-card前插入分享卡片
            sed -i.bak '/class="tool-card"/r temp_share_card.html' "public/index.html"
            echo "  ✅ 已添加分享功能卡片"
        fi
        
        rm -f temp_share_card.html
    else
        echo "  ⏭️  已存在分享功能"
    fi
fi

echo ""

# 3. 更新导航菜单
echo "🧭 第3步: 更新导航菜单..."
echo "-------------------------"

# 需要更新导航的文件
NAV_FILES=("public/index.html" "public/"*.html)

for file in "${NAV_FILES[@]}"; do
    if [[ -f "$file" && ! "$file" =~ (share|rooms)\.html ]]; then
        # 检查是否已经有分享链接
        if ! grep -q 'href.*share\.html' "$file"; then
            # 在导航中添加分享链接
            sed -i.bak 's|<a href="index.html">Home</a>|<a href="index.html">Home</a>\
                <a href="share.html" style="color: #10b981;">Share</a>|' "$file"
            echo "  ✅ 已更新 $file 的导航"
        fi
    fi
done

echo ""

# 4. 为工具页面添加结果分享按钮样式
echo "🎨 第4步: 添加分享按钮样式..."
echo "-----------------------------"

# 创建分享样式文件
cat > public/share-integration.css << 'EOF'
/* 分享功能样式 */
.share-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    margin-left: 10px;
}

.share-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.share-button:active {
    transform: translateY(0);
}

.share-card {
    position: relative;
    overflow: hidden;
}

.share-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.share-card:hover::before {
    left: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .share-button {
        padding: 10px 16px;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 5px;
    }
}
EOF

# 将样式文件链接添加到HTML文件
for file in public/*.html; do
    if [[ -f "$file" ]]; then
        # 检查是否已经包含分享样式
        if ! grep -q "share-integration.css" "$file"; then
            # 在</head>前添加样式链接
            sed -i.bak '/<\/head>/i\
    <link rel="stylesheet" href="share-integration.css">\
    <link rel="stylesheet" href="device-selector.css">
' "$file"
        fi
    fi
done

echo "  ✅ 已添加分享样式"
echo ""

# 5. 清理备份文件
echo "🧹 第5步: 清理备份文件..."
echo "-------------------------"

find public/ -name "*.bak" -delete
echo "  ✅ 已清理备份文件"
echo ""

# 6. 验证集成结果
echo "🔍 第6步: 验证集成结果..."
echo "-------------------------"

echo "分享脚本集成统计:"
echo "- HTML文件处理: $(grep -l "add-share-integration.js" public/*.html | wc -l) 个"
echo "- 样式文件集成: $(grep -l "share-integration.css" public/*.html | wc -l) 个"
echo "- 导航链接添加: $(grep -l 'href.*share\.html' public/*.html | wc -l) 个"

echo ""
echo "主要功能文件:"
echo "- 分享脚本: add-share-integration.js"
echo "- 分享样式: public/share-integration.css"
echo "- 分享页面: public/share.html"
echo "- 房间功能: public/rooms.html"

echo ""
echo "======================"
echo "🎉 分享功能集成完成！"
echo ""
echo "📋 新增功能:"
echo "1. 所有工具页面现在都有'📤 Share to Device'按钮"
echo "2. 主页新增分享功能卡片"
echo "3. 导航菜单添加分享链接"
echo "4. 处理结果可直接分享到其他设备"
echo ""
echo "🔗 使用方法:"
echo "1. 在任何工具处理完文件后，点击'Share to Device'按钮"
echo "2. 或直接访问分享页面进行P2P文件传输"
echo "3. 使用房间功能进行多设备协作"
echo ""
echo "✨ 现在dropshare真正实现了'处理+分享'的完整功能！"
echo "======================"
