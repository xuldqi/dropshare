#!/usr/bin/env python3
"""
修复所有工具页面的翻译初始化问题
"""

import os
import glob
import re

def get_tool_pages():
    """获取所有工具页面"""
    tool_pages = [
        'public/audio-tools.html',
        'public/document-tools.html'
    ]
    return tool_pages

def fix_translation_init(file_path):
    """修复单个文件的翻译初始化"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有 translatePage() 调用
        if 'translatePage(); // 添加翻译调用' in content:
            print(f"  - 跳过 {file_path} (已经有翻译调用)")
            return False
        
        # 查找初始化代码模式
        pattern = r'(initializeLanguageSelector\(\);\s*)(setTimeout\(\(\) => \{)'
        
        if re.search(pattern, content, re.DOTALL):
            # 添加 translatePage() 调用
            new_content = re.sub(
                pattern,
                r'\1translatePage(); // 添加翻译调用\n                    \2',
                content,
                flags=re.DOTALL
            )
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"  ✓ 修复了 {file_path}")
            return True
        else:
            print(f"  - 跳过 {file_path} (找不到初始化模式)")
            return False
        
    except Exception as e:
        print(f"  ✗ 处理 {file_path} 失败: {e}")
        return False

def main():
    print("🔧 修复工具页面的翻译初始化...")
    
    # 获取所有工具页面
    tool_pages = get_tool_pages()
    print(f"找到 {len(tool_pages)} 个工具页面")
    
    # 修复每个页面
    fixed_count = 0
    for page in tool_pages:
        print(f"\n处理页面: {page}")
        if fix_translation_init(page):
            fixed_count += 1
    
    print(f"\n🎉 修复完成！")
    print(f"  - 总页面数: {len(tool_pages)}")
    print(f"  - 修复页面数: {fixed_count}")
    print(f"  - 跳过页面数: {len(tool_pages) - fixed_count}")

if __name__ == "__main__":
    main()

"""
修复所有工具页面的翻译初始化问题
"""

import os
import glob
import re

def get_tool_pages():
    """获取所有工具页面"""
    tool_pages = [
        'public/audio-tools.html',
        'public/document-tools.html'
    ]
    return tool_pages

def fix_translation_init(file_path):
    """修复单个文件的翻译初始化"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有 translatePage() 调用
        if 'translatePage(); // 添加翻译调用' in content:
            print(f"  - 跳过 {file_path} (已经有翻译调用)")
            return False
        
        # 查找初始化代码模式
        pattern = r'(initializeLanguageSelector\(\);\s*)(setTimeout\(\(\) => \{)'
        
        if re.search(pattern, content, re.DOTALL):
            # 添加 translatePage() 调用
            new_content = re.sub(
                pattern,
                r'\1translatePage(); // 添加翻译调用\n                    \2',
                content,
                flags=re.DOTALL
            )
            
            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"  ✓ 修复了 {file_path}")
            return True
        else:
            print(f"  - 跳过 {file_path} (找不到初始化模式)")
            return False
        
    except Exception as e:
        print(f"  ✗ 处理 {file_path} 失败: {e}")
        return False

def main():
    print("🔧 修复工具页面的翻译初始化...")
    
    # 获取所有工具页面
    tool_pages = get_tool_pages()
    print(f"找到 {len(tool_pages)} 个工具页面")
    
    # 修复每个页面
    fixed_count = 0
    for page in tool_pages:
        print(f"\n处理页面: {page}")
        if fix_translation_init(page):
            fixed_count += 1
    
    print(f"\n🎉 修复完成！")
    print(f"  - 总页面数: {len(tool_pages)}")
    print(f"  - 修复页面数: {fixed_count}")
    print(f"  - 跳过页面数: {len(tool_pages) - fixed_count}")

if __name__ == "__main__":
    main()
