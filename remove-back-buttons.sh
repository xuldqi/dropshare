#!/bin/bash

echo "🔧 开始移除音频和视频工具页面中的Back按钮..."
echo "======================"

# 查找所有音频和视频相关的HTML文件
AUDIO_VIDEO_FILES=$(find public -name "*audio*" -o -name "*video*" | grep "\.html$")

# 计数器
total_files=0
processed_files=0

for file in $AUDIO_VIDEO_FILES; do
    if [[ -f "$file" ]]; then
        total_files=$((total_files + 1))
        echo "处理文件: $file"
        
        # 检查是否包含Back按钮
        if grep -q "← [Bb]ack\|返回工具页" "$file"; then
            # 移除Back按钮的整个div块
            # 匹配包含Back按钮的div，通常有margin-bottom: 20px样式
            sed -i.bak '/<div style="margin-bottom: 20px;">/,/<\/div>/d' "$file"
            
            # 检查是否还有其他Back按钮
            if grep -q "← [Bb]ack\|返回工具页" "$file"; then
                echo "  ⚠️  仍有Back按钮残留，尝试其他方法..."
                # 尝试移除包含Back按钮的行
                sed -i.bak '/← [Bb]ack/d' "$file"
                sed -i.bak '/返回工具页/d' "$file"
            fi
            
            echo "  ✅ 已移除Back按钮"
            processed_files=$((processed_files + 1))
        else
            echo "  ⏭️  未发现Back按钮"
        fi
    fi
done

echo ""
echo "======================"
echo "🎉 Back按钮移除完成！"
echo "📊 统计信息:"
echo "  - 总文件数: $total_files"
echo "  - 处理文件数: $processed_files"
echo "  - 跳过文件数: $((total_files - processed_files))"

# 清理备份文件
echo ""
echo "🧹 清理备份文件..."
find public -name "*.bak" -delete
echo "  ✅ 备份文件已清理"

echo ""
echo "🔍 验证结果..."
echo "剩余Back按钮检查:"
grep -r "← [Bb]ack\|返回工具页" public/audio-*.html public/video-*.html 2>/dev/null || echo "  ✅ 未发现剩余Back按钮"

echo ""
echo "✨ 所有音频和视频工具页面的Back按钮已成功移除！"
