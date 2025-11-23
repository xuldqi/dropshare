# 创建扩展图标

## 方法1: 使用现有Logo

如果你有DropShare的Logo文件，可以：

1. 使用图像编辑软件（如Photoshop、GIMP）调整大小
2. 导出为PNG格式
3. 保存为以下尺寸：
   - `icon16.png` - 16x16像素
   - `icon48.png` - 48x48像素
   - `icon128.png` - 128x128像素

## 方法2: 使用在线工具

1. 访问 https://www.favicon-generator.org/
2. 上传你的Logo或图标
3. 生成不同尺寸的图标
4. 下载并重命名

## 方法3: 使用命令行工具

### 使用ImageMagick

```bash
# 安装ImageMagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick
# Windows: 下载安装包

# 创建图标（假设你有icon.png源文件）
convert icon.png -resize 16x16 icons/icon16.png
convert icon.png -resize 48x48 icons/icon48.png
convert icon.png -resize 128x128 icons/icon128.png
```

### 使用sips (macOS)

```bash
# 创建icons文件夹
mkdir -p icons

# 使用sips调整大小
sips -z 16 16 icon.png --out icons/icon16.png
sips -z 48 48 icon.png --out icons/icon48.png
sips -z 128 128 icon.png --out icons/icon128.png
```

## 方法4: 使用Python脚本

创建 `create_icons.py`:

```python
from PIL import Image
import os

# 创建icons文件夹
os.makedirs('icons', exist_ok=True)

# 打开源图像
img = Image.open('icon.png')

# 生成不同尺寸
sizes = [16, 48, 128]
for size in sizes:
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f'icons/icon{size}.png')
    print(f'Created icon{size}.png')

print('All icons created!')
```

运行:
```bash
pip install Pillow
python create_icons.py
```

## 方法5: 使用临时占位图标

如果需要快速测试，可以创建简单的占位图标：

1. 创建一个简单的SVG图标
2. 转换为PNG
3. 调整大小

或者使用在线占位图标生成器：
- https://dummyimage.com/
- https://placeholder.com/

## 图标设计建议

1. **简洁明了**: 图标应该在小尺寸下也能识别
2. **高对比度**: 确保在不同背景下都清晰可见
3. **相关主题**: 使用文件传输相关的图标（如箭头、文件夹等）
4. **品牌一致**: 与DropShare的品牌风格保持一致

## 快速测试图标

创建简单的测试图标（使用Base64编码的1x1像素PNG）：

但更好的方法是使用实际的图标文件。如果你暂时没有图标，可以：

1. 从项目中的 `public/images/` 文件夹找到Logo
2. 或者创建一个简单的文件传输图标
3. 或者使用在线图标库（如Flaticon、Icons8）

## 注意事项

- 图标必须是PNG格式
- 图标必须是正方形（宽高相等）
- 图标应该透明背景（PNG支持透明度）
- 图标文件大小应该尽可能小（优化后）
- 确保图标在不同尺寸下都清晰可见


