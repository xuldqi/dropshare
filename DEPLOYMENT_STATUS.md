# DropShare 部署状态报告

## 当前配置

### 部署方式
- **主要方式**: Docker + Docker Compose
- **备用方式**: 直接Node.js运行
- **端口**: 8080 (默认)
- **Node版本**: 16-alpine (Docker中)

### 服务结构
```
dropshare/
├── index.js           # 主服务器文件
├── docker-compose.yml # Docker部署配置  
├── Dockerfile         # 容器构建配置
└── public/           # 前端静态文件
```

### Docker配置
- 容器名: `dropshare`
- 重启策略: `always`
- 端口映射: `8080:8080`
- 挂载卷: `./public:/app/public`

## 常见问题及解决方案

### 1. 连接丢失问题 (Connection lost: Retry in 5 seconds)

**可能原因:**
- 后端服务未启动
- 端口被占用或防火墙阻止
- 容器崩溃或重启
- 网络配置问题

**解决步骤:**
1. 运行快速检查: `./quick-status.sh`
2. 查看详细诊断: `./server-diagnosis.sh`
3. 重启服务: `./restart-server.sh`

### 2. 端口占用问题

**检查命令:**
```bash
netstat -tulpn | grep :8080
# 或
ss -tulpn | grep :8080
```

**解决方法:**
- 杀死占用进程: `sudo kill $(lsof -t -i:8080)`
- 或使用其他端口: `PORT=8081 node index.js`

### 3. Docker相关问题

**常用命令:**
```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f dropshare

# 重启容器
docker-compose restart dropshare

# 完全重建
docker-compose down && docker-compose up -d --build
```

## 监控检查点

### 自动化检查
- [ ] 服务HTTP响应 (localhost:8080)
- [ ] 容器运行状态
- [ ] 端口监听状态
- [ ] 磁盘空间充足
- [ ] 内存使用正常

### 手动检查
- [ ] 前端页面加载正常
- [ ] WebSocket连接建立
- [ ] 文件传输功能正常
- [ ] 多设备连接测试

## 部署脚本说明

### 1. server-diagnosis.sh
- **功能**: 全面诊断服务器状态
- **使用**: `./server-diagnosis.sh`
- **检查项**: Docker状态、容器状态、端口占用、进程检查、服务响应等

### 2. restart-server.sh
- **功能**: 智能重启服务
- **使用**: `./restart-server.sh` (交互式选择重启方式)
- **选项**: Docker重启、Node.js重启、完全清理重启、仅后端重启

### 3. quick-status.sh  
- **功能**: 快速状态检查
- **使用**: `./quick-status.sh`
- **输出**: 简洁的服务状态和建议操作

## 生产环境建议

### 安全配置
- [ ] 配置HTTPS/SSL
- [ ] 设置防火墙规则
- [ ] 限制访问IP范围
- [ ] 启用访问日志

### 性能优化
- [ ] 配置反向代理 (Nginx)
- [ ] 启用gzip压缩
- [ ] 设置静态文件缓存
- [ ] 监控内存使用

### 高可用性
- [ ] 配置进程管理器 (PM2)
- [ ] 设置健康检查
- [ ] 配置自动重启
- [ ] 备份重要配置

## 故障排除流程

1. **快速检查**: `./quick-status.sh`
2. **详细诊断**: `./server-diagnosis.sh` 
3. **查看日志**: `tail -f server.log` 或 `docker-compose logs`
4. **尝试重启**: `./restart-server.sh`
5. **如问题持续**: 检查系统资源、网络配置、防火墙设置

## 联系支持

如果问题无法解决，请提供以下信息：
- 诊断脚本输出
- 错误日志截图
- 系统环境信息
- 重现步骤

最后更新: $(date)