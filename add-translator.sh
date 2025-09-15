#!/bin/bash

# 为所有没有翻译器的HTML页面添加i18n.js脚本

# 获取所有没有i18n.js的HTML文件
missing_pages=$(find /Users/macmima1234/Documents/project/dropshare/public -name "*.html" -exec grep -L "locales/i18n.js" {} \;)

echo "开始为以下页面添加翻译器："
echo "$missing_pages"

# 为每个页面添加翻译器
for file in $missing_pages; do
    echo "处理文件: $file"
    
    # 检查是否已有</head>标签
    if grep -q "</head>" "$file"; then
        # 在</head>之前添加翻译器脚本
        sed -i.bak 's|</head>|    <script src="/locales/i18n.js"></script>\
</head>|' "$file"
        echo "  ✓ 已添加翻译器到 $file"
    else
        echo "  ⚠ 警告: $file 没有找到</head>标签"
    fi
done

echo "翻译器添加完成！"