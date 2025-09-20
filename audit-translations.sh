#!/bin/bash

echo "=== 翻译文件审计报告 ==="
echo

# 基准文件
BASE_FILE="public/locales/en.json"
if [ ! -f "$BASE_FILE" ]; then
    echo "❌ 基准文件 $BASE_FILE 不存在"
    exit 1
fi

# 获取英文键列表
EN_KEYS=$(grep -o '"[^"]*"[[:space:]]*:' "$BASE_FILE" | sed 's/"//g' | sed 's/[[:space:]]*://' | sort)
TOTAL_EN_KEYS=$(echo "$EN_KEYS" | wc -l)

echo "📊 英文基准文件包含 $TOTAL_EN_KEYS 个翻译键"
echo

# 检查每个语言文件
for lang_file in public/locales/*.json; do
    if [ "$lang_file" = "$BASE_FILE" ]; then
        continue
    fi
    
    lang=$(basename "$lang_file" .json)
    echo "🔍 检查 $lang..."
    
    if [ ! -f "$lang_file" ]; then
        echo "  ❌ 文件不存在"
        continue
    fi
    
    # 检查JSON语法
    if ! python3 -m json.tool "$lang_file" > /dev/null 2>&1; then
        echo "  ❌ JSON语法错误"
        continue
    fi
    
    # 获取该语言的键列表
    LANG_KEYS=$(grep -o '"[^"]*"[[:space:]]*:' "$lang_file" | sed 's/"//g' | sed 's/[[:space:]]*://' | sort)
    TOTAL_LANG_KEYS=$(echo "$LANG_KEYS" | wc -l)
    
    # 找出缺失的键
    MISSING_KEYS=$(comm -23 <(echo "$EN_KEYS") <(echo "$LANG_KEYS"))
    MISSING_COUNT=$(echo "$MISSING_KEYS" | grep -v '^$' | wc -l)
    
    # 找出多余的键
    EXTRA_KEYS=$(comm -13 <(echo "$EN_KEYS") <(echo "$LANG_KEYS"))
    EXTRA_COUNT=$(echo "$EXTRA_KEYS" | grep -v '^$' | wc -l)
    
    echo "  📊 总键数: $TOTAL_LANG_KEYS (英文: $TOTAL_EN_KEYS)"
    echo "  ❌ 缺失: $MISSING_COUNT 个键"
    echo "  ➕ 多余: $EXTRA_COUNT 个键"
    
    if [ $MISSING_COUNT -gt 0 ]; then
        echo "  📝 缺失的键:"
        echo "$MISSING_KEYS" | grep -v '^$' | head -10 | sed 's/^/    - /'
        if [ $MISSING_COUNT -gt 10 ]; then
            echo "    ... 还有 $((MISSING_COUNT - 10)) 个"
        fi
    fi
    echo
done

echo "✅ 翻译审计完成"
