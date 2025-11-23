# DropShare Chrome扩展 - 快速开始

## 5分钟快速上手

### 步骤1: 准备文件
1. 确保你有 `chrome-extension-example` 文件夹
2. 创建 `icons` 文件夹并添加图标（或使用占位图标）

### 步骤2: 安装扩展
1. 打开Chrome，访问 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `chrome-extension-example` 文件夹

### 步骤3: 启动服务器
```bash
cd /path/to/dropshare
node index.js
```

### 步骤4: 测试
1. 打开两个Chrome浏览器窗口
2. 在两个窗口中都安装扩展
3. 点击扩展图标
4. 选择一个设备
5. 选择文件并发送

## 创建图标（快速方法）

### 方法1: 使用占位图标
创建 `icons` 文件夹，然后使用在线工具生成：
- 访问 https://www.favicon-generator.org/
- 上传任何图片
- 下载生成的图标
- 重命名为 `icon16.png`, `icon48.png`, `icon128.png`

### 方法2: 使用项目Logo
如果项目中有Logo文件：
```bash
# 使用ImageMagick（如果已安装）
mkdir icons
convert logo.png -resize 16x16 icons/icon16.png
convert logo.png -resize 48x48 icons/icon48.png
convert logo.png -resize 128x128 icons/icon128.png
```

### 方法3: 使用Python脚本
创建 `create_icons.py`:
```python
from PIL import Image
import os

os.makedirs('icons', exist_ok=True)
img = Image.open('logo.png')  # 你的Logo文件

for size in [16, 48, 128]:
    resized = img.resize((size, size))
    resized.save(f'icons/icon{size}.png')
    print(f'Created icon{size}.png')
```

运行:
```bash
pip install Pillow
python create_icons.py
```

## 常见问题

### Q: 扩展无法加载？
A: 检查：
- manifest.json格式是否正确
- 图标文件是否存在
- 所有文件是否在正确位置

### Q: 无法连接到服务器？
A: 检查：
- 服务器是否运行（`node index.js`）
- 服务器地址是否正确（默认: `ws://localhost:8080/server/webrtc`）
- 防火墙设置

### Q: 无法发现设备？
A: 检查：
- 所有设备是否都安装了扩展
- 所有设备是否都连接到服务器
- 是否在同一局域网

### Q: 文件传输失败？
A: 检查：
- WebRTC连接是否建立
- 网络连接是否稳定
- 查看控制台错误信息

## 下一步

- 查看 `INSTALL.md` 了解详细安装步骤
- 查看 `SUMMARY.md` 了解功能特性
- 查看 `CHROME_EXTENSION_ANALYSIS.md` 了解技术细节

## 需要帮助？

1. 查看控制台日志
2. 检查服务器日志
3. 查看GitHub Issues
4. 提交Bug报告

---

**提示**: 如果遇到问题，首先检查浏览器控制台和扩展的Service Worker日志！


