# DropShare Chrome Extension

这是一个基于WebRTC的Chrome扩展，用于在局域网内的浏览器之间进行P2P文件传输。

## 🚀 快速开始

**5分钟快速上手**: 查看 [QUICKSTART.md](./QUICKSTART.md)

## ✨ 功能特性

- ✅ **WebRTC P2P文件传输** - 直接在浏览器之间传输文件
- ✅ **自动设备发现** - 自动发现局域网内的其他设备
- ✅ **多文件传输** - 支持一次发送多个文件
- ✅ **传输进度显示** - 实时显示传输进度和速度
- ✅ **通知系统** - 文件接收时显示通知
- ✅ **错误处理** - 完善的错误处理和自动重连
- ✅ **离线工作** - 使用本地信令服务器，无需互联网

## 📦 安装

### 前置要求
- Chrome浏览器 (版本88+)
- DropShare服务器运行中 (默认: `localhost:8080`)
- 两个或更多设备 (同一局域网)

### 安装步骤

1. **图标文件** ✅ (已生成)
   - 图标文件已自动生成在 `icons/` 文件夹中
   - 如果需要自定义，可以运行 `python3 generate_icons.py` 重新生成
   - 或者查看 [create-icons.md](./create-icons.md) 了解如何创建自定义图标

2. **安装扩展**
   - 打开Chrome，访问 `chrome://extensions/`
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `chrome-extension-example` 文件夹

3. **启动服务器**
   ```bash
   node index.js
   ```

4. **开始使用**
   - 点击扩展图标
   - 选择目标设备
   - 选择文件并发送

详细安装指南: 查看 [INSTALL.md](./INSTALL.md)

## 📁 文件结构

```
chrome-extension-example/
├── manifest.json              # 扩展配置 (Manifest V3)
├── background.js              # 后台Service Worker
├── popup.html                 # Popup界面
├── popup.js                   # Popup脚本
├── icons/                     # 扩展图标 ✅ (已生成)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── generate_icons.py          # 图标生成脚本
├── README.md                  # 本文档
├── QUICKSTART.md              # 快速开始指南
├── INSTALL.md                 # 详细安装指南
├── create-icons.md            # 图标创建指南
├── SUMMARY.md                 # 功能总结
└── CHROME_EXTENSION_ANALYSIS.md  # 技术分析文档
```

## 🎯 使用方法

### 发送文件
1. 点击扩展图标打开popup
2. 在设备列表中选择目标设备
3. 点击"选择文件"按钮，选择一个或多个文件
4. 点击"发送文件"按钮
5. 等待传输完成

### 接收文件
1. 扩展会在后台运行
2. 收到文件时会显示通知
3. 文件会自动保存到下载文件夹

## 🔧 技术细节

### WebRTC连接流程
1. 连接到信令服务器 (WebSocket)
2. 获取设备列表
3. 建立WebRTC连接 (交换SDP和ICE候选)
4. 通过DataChannel传输文件

### 消息协议

**信令消息 (WebSocket)**:
```json
{
  "type": "signal",
  "to": "peer-id",
  "signal": {
    "type": "offer|answer|ice-candidate",
    "sdp": "...",
    "candidate": "..."
  }
}
```

**文件传输消息 (DataChannel)**:
```json
{
  "type": "header",
  "name": "filename.txt",
  "mime": "text/plain",
  "size": 1024
}
```

### 权限说明
- `storage`: 存储设备ID和设置
- `notifications`: 显示文件传输通知
- `downloads`: 保存接收的文件
- `alarms`: 定期刷新设备列表
- `host_permissions`: 连接WebSocket服务器

## 🐛 故障排除

### 无法连接到服务器
- ✅ 检查DropShare服务器是否运行
- ✅ 检查服务器地址是否正确 (默认: `ws://localhost:8080/server/webrtc`)
- ✅ 检查防火墙设置
- ✅ 查看扩展的Service Worker日志

### 无法发现设备
- ✅ 确保所有设备都在同一局域网
- ✅ 确保所有设备都安装了扩展
- ✅ 确保所有设备都连接到服务器
- ✅ 等待几秒钟让设备列表刷新

### 文件传输失败
- ✅ 检查WebRTC连接是否建立
- ✅ 检查网络连接是否稳定
- ✅ 检查文件大小是否超出限制
- ✅ 查看浏览器控制台错误信息

详细故障排除: 查看 [INSTALL.md](./INSTALL.md#故障排除)

## 📚 文档

- **[QUICKSTART.md](./QUICKSTART.md)** - 5分钟快速上手
- **[INSTALL.md](./INSTALL.md)** - 详细安装指南
- **[create-icons.md](./create-icons.md)** - 图标创建指南
- **[SUMMARY.md](./SUMMARY.md)** - 功能总结和技术细节
- **[CHROME_EXTENSION_ANALYSIS.md](./CHROME_EXTENSION_ANALYSIS.md)** - 技术分析文档

## 🔮 未来改进

### 短期计划
- [ ] 添加设置页面
- [ ] 优化大文件传输
- [ ] 添加传输历史
- [ ] 改进错误处理

### 长期计划
- [ ] 局域网自动发现 (mDNS)
- [ ] 文件传输加密
- [ ] 支持断点续传
- [ ] 添加拖拽支持
- [ ] 多语言支持

## 🧪 测试

### 测试清单
- [ ] 扩展成功安装
- [ ] 可以连接到服务器
- [ ] 可以显示设备列表
- [ ] 可以选择文件
- [ ] 可以发送文件
- [ ] 可以接收文件
- [ ] 传输进度正常显示
- [ ] 文件完整接收
- [ ] 通知正常显示
- [ ] 多文件传输正常

## 💡 开发调试

### 查看日志
1. **Background Service Worker**: `chrome://extensions/` → 找到扩展 → 点击"service worker"
2. **Popup**: 右键扩展图标 → "检查弹出式窗口"
3. **网络请求**: 开发者工具 → Network → 过滤WebSocket

### 常见问题
- 查看控制台日志
- 检查服务器日志
- 查看网络请求
- 检查权限设置

## ⚠️ 注意事项

1. **图标文件**: 扩展需要图标文件才能正常显示，请按照 `create-icons.md` 创建
2. **服务器配置**: 默认连接到 `localhost:8080`，可以通过chrome.storage修改
3. **文件大小**: 大文件传输可能受内存限制，建议单文件不超过2GB
4. **网络环境**: 局域网内传输最快，跨网络需要服务器支持

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 初始版本
- ✅ 支持基本的文件传输
- ✅ 支持设备发现
- ✅ 支持进度显示
- ✅ 支持通知

## 📞 支持

如果遇到问题：
1. 查看 [INSTALL.md](./INSTALL.md) 中的故障排除部分
2. 查看浏览器控制台日志
3. 检查服务器日志
4. 查看GitHub Issues
5. 提交Bug报告

## 📄 许可证

与主项目相同的许可证

---

**状态**: ✅ 可用，待测试  
**版本**: 1.0.0  
**最后更新**: 2024年1月

