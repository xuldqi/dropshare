#!/usr/bin/env python3
"""
生成DropShare Chrome扩展图标
使用Pillow库创建简单的图标
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """创建指定尺寸的图标"""
    # 创建图像，使用透明背景
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 定义颜色
    primary_color = (37, 99, 235)  # 蓝色 #2563eb
    secondary_color = (59, 130, 246)  # 浅蓝色 #3b82f6
    white = (255, 255, 255, 255)
    
    # 绘制背景圆形
    margin = size // 10
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=primary_color,
        outline=None
    )
    
    # 绘制文件传输图标（两个箭头）
    center_x = size // 2
    center_y = size // 2
    arrow_size = size // 3
    
    # 绘制向上的箭头（发送）
    arrow_points_up = [
        (center_x, center_y - arrow_size // 2),
        (center_x - arrow_size // 3, center_y),
        (center_x - arrow_size // 6, center_y),
        (center_x - arrow_size // 6, center_y + arrow_size // 3),
        (center_x + arrow_size // 6, center_y + arrow_size // 3),
        (center_x + arrow_size // 6, center_y),
        (center_x + arrow_size // 3, center_y),
    ]
    draw.polygon(arrow_points_up, fill=white)
    
    # 绘制向下的箭头（接收）
    arrow_points_down = [
        (center_x, center_y + arrow_size // 2),
        (center_x - arrow_size // 3, center_y),
        (center_x - arrow_size // 6, center_y),
        (center_x - arrow_size // 6, center_y - arrow_size // 3),
        (center_x + arrow_size // 6, center_y - arrow_size // 3),
        (center_x + arrow_size // 6, center_y),
        (center_x + arrow_size // 3, center_y),
    ]
    draw.polygon(arrow_points_down, fill=white)
    
    # 保存图像
    img.save(output_path, 'PNG')
    print(f'✅ Created {output_path} ({size}x{size})')

def create_simple_icon(size, output_path):
    """创建更简单的图标（如果上面的太复杂）"""
    # 创建图像
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 定义颜色
    primary_color = (37, 99, 235)  # 蓝色 #2563eb
    white = (255, 255, 255, 255)
    center_x = size // 2
    
    # 绘制圆形背景
    margin = size // 10
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=primary_color,
        outline=None
    )
    
    # 绘制简单的双向箭头
    arrow_size = size // 4
    arrow_width = arrow_size // 2
    
    # 向上箭头
    up_arrow_y = center_y = size // 2 - arrow_size // 3
    up_arrow_points = [
        (center_x, up_arrow_y),
        (center_x - arrow_width, up_arrow_y + arrow_size // 2),
        (center_x + arrow_width, up_arrow_y + arrow_size // 2),
    ]
    draw.polygon(up_arrow_points, fill=white)
    
    # 向下箭头
    down_arrow_y = center_y + arrow_size // 2 + size // 20
    down_arrow_points = [
        (center_x, down_arrow_y + arrow_size // 2),
        (center_x - arrow_width, down_arrow_y),
        (center_x + arrow_width, down_arrow_y),
    ]
    draw.polygon(down_arrow_points, fill=white)
    
    # 保存图像
    img.save(output_path, 'PNG')
    print(f'✅ Created {output_path} ({size}x{size})')

def main():
    # 创建icons文件夹
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # 生成不同尺寸的图标
    sizes = [16, 48, 128]
    
    print('🎨 Generating DropShare extension icons...')
    print('=' * 50)
    
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon{size}.png')
        if size >= 48:
            # 大图标使用复杂版本
            create_icon(size, output_path)
        else:
            # 小图标使用简单版本
            create_simple_icon(size, output_path)
    
    print('=' * 50)
    print('✨ All icons generated successfully!')
    print(f'📁 Icons saved in: {os.path.abspath(icons_dir)}/')

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print('❌ Error: Pillow library not installed')
        print('💡 Please install it using: pip install Pillow')
        print('   or: pip3 install Pillow')
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()

