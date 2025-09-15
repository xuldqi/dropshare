#!/usr/bin/env python3
"""
修复翻译脚本 - 确保所有语言都有完整的翻译
"""

import re

def count_languages():
    """统计当前支持的语言数量"""
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 找到所有语言字典（包括中文）
    languages = re.findall(r"'([a-z-]+)':\s*\{", content)
    print(f"当前支持的语言: {languages}")
    print(f"语言数量: {len(languages)}")
    
    return languages

def check_language_completeness():
    """检查每种语言的翻译完整性"""
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取英文翻译键
    en_match = re.search(r"'en':\s*\{([^}]+)\}", content, re.DOTALL)
    if not en_match:
        print("❌ 找不到英文翻译")
        return
    
    en_content = en_match.group(1)
    en_keys = set(re.findall(r"(\w+):\s*['\"][^'\"]+['\"]", en_content))
    print(f"英文翻译键数量: {len(en_keys)}")
    
    # 检查其他语言
    languages = ['zh-CN', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'pt', 'es']
    
    for lang in languages:
        lang_match = re.search(f"'{lang}':\\s*\\{{([^}}]+)\\}}", content, re.DOTALL)
        if lang_match:
            lang_content = lang_match.group(1)
            lang_keys = set(re.findall(r"(\w+):\s*['\"][^'\"]+['\"]", lang_content))
            missing_keys = en_keys - lang_keys
            print(f"{lang}: {len(lang_keys)}/{len(en_keys)} 翻译键 ({len(missing_keys)} 缺失)")
            if missing_keys:
                print(f"  缺失的键: {list(missing_keys)[:5]}...")
        else:
            print(f"{lang}: ❌ 语言字典不存在")

def main():
    print("🔍 检查翻译状态...")
    
    # 统计语言数量
    languages = count_languages()
    
    print("\n📊 检查翻译完整性...")
    check_language_completeness()
    
    print(f"\n✅ 总结:")
    print(f"   - 支持的语言数量: {len(languages)}")
    print(f"   - 语言列表: {', '.join(languages)}")

if __name__ == "__main__":
    main()



修复翻译脚本 - 确保所有语言都有完整的翻译
"""

import re

def count_languages():
    """统计当前支持的语言数量"""
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 找到所有语言字典（包括中文）
    languages = re.findall(r"'([a-z-]+)':\s*\{", content)
    print(f"当前支持的语言: {languages}")
    print(f"语言数量: {len(languages)}")
    
    return languages

def check_language_completeness():
    """检查每种语言的翻译完整性"""
    with open('public/scripts/i18n/languages.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取英文翻译键
    en_match = re.search(r"'en':\s*\{([^}]+)\}", content, re.DOTALL)
    if not en_match:
        print("❌ 找不到英文翻译")
        return
    
    en_content = en_match.group(1)
    en_keys = set(re.findall(r"(\w+):\s*['\"][^'\"]+['\"]", en_content))
    print(f"英文翻译键数量: {len(en_keys)}")
    
    # 检查其他语言
    languages = ['zh-CN', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'pt', 'es']
    
    for lang in languages:
        lang_match = re.search(f"'{lang}':\\s*\\{{([^}}]+)\\}}", content, re.DOTALL)
        if lang_match:
            lang_content = lang_match.group(1)
            lang_keys = set(re.findall(r"(\w+):\s*['\"][^'\"]+['\"]", lang_content))
            missing_keys = en_keys - lang_keys
            print(f"{lang}: {len(lang_keys)}/{len(en_keys)} 翻译键 ({len(missing_keys)} 缺失)")
            if missing_keys:
                print(f"  缺失的键: {list(missing_keys)[:5]}...")
        else:
            print(f"{lang}: ❌ 语言字典不存在")

def main():
    print("🔍 检查翻译状态...")
    
    # 统计语言数量
    languages = count_languages()
    
    print("\n📊 检查翻译完整性...")
    check_language_completeness()
    
    print(f"\n✅ 总结:")
    print(f"   - 支持的语言数量: {len(languages)}")
    print(f"   - 语言列表: {', '.join(languages)}")

if __name__ == "__main__":
    main()
