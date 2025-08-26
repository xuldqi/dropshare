#!/bin/bash

echo "=== 紧急回滚到备份状态 ==="
echo "时间: $(date)"

# 检查权限
if [[ $EUID -ne 0 ]]; then
    echo "此脚本需要root权限运行"
    echo "请使用: sudo $0"
    exit 1
fi

echo "1. 停止当前服务..."
pkill -f "node.*index.js" 2>/dev/null || true
sleep 2

echo "2. 查找最新备份..."

# 查找最新的备份目录
backup_dir=$(ls -td /var/www/dropshare_backup_* 2>/dev/null | head -1)

if [[ -n "$backup_dir" && -d "$backup_dir" ]]; then
    echo "找到备份: $backup_dir"
    
    echo "3. 恢复备份..."
    
    # 删除当前损坏的版本
    rm -rf "/var/www/dropshare"
    
    # 恢复备份
    mv "$backup_dir" "/var/www/dropshare"
    
    echo "✓ 备份已恢复"
    
else
    echo "✗ 未找到备份目录"
    echo "手动恢复方案:"
    echo "1. 检查是否有其他备份: ls -la /var/www/dropshare_backup_*"
    echo "2. 或者重新克隆仓库: cd /var/www && git clone [仓库地址] dropshare"
    exit 1
fi

echo "4. 进入恢复的目录..."
cd /var/www/dropshare

echo "5. 检查恢复状态..."
if [[ -f "index.js" && -d "public" ]]; then
    echo "✓ 核心文件已恢复"
else
    echo "✗ 恢复可能不完整"
fi

echo "6. 重新安装依赖..."
npm install 2>/dev/null || echo "npm install 可能有问题"

echo "7. 启动服务..."
nohup node index.js > server.log 2>&1 &
sleep 3

echo "8. 检查服务状态..."
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ 服务已恢复运行"
else
    echo "❌ 服务启动失败"
    echo "错误日志:"
    tail -5 server.log 2>/dev/null || echo "无日志文件"
fi

# 测试HTTP连接
if curl -s --connect-timeout 3 http://localhost:8080 >/dev/null; then
    echo "✅ HTTP服务恢复正常"
else
    echo "❌ HTTP服务异常"
fi

echo ""
echo "=== 紧急回滚完成 ==="
echo "请立即测试: http://dropshare.tech"
echo ""
echo "如果仍有问题："
echo "1. 检查服务日志: tail -f server.log"
echo "2. 手动重启: pkill -f node && cd /var/www/dropshare && node index.js"