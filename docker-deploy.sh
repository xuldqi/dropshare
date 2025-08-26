#!/bin/bash

echo "=== DropShare Docker 部署脚本 ==="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker 环境检查通过"

# 停止现有服务
echo "停止现有服务..."
pkill -f "node.*index.js" 2>/dev/null || true
docker-compose down 2>/dev/null || true

# 构建并启动服务
echo "构建 Docker 镜像..."
docker-compose build

echo "启动服务..."
docker-compose up -d

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo "检查服务状态..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker 容器运行中"
else
    echo "❌ Docker 容器启动失败"
    docker-compose logs
    exit 1
fi

# 测试服务
if curl -s --connect-timeout 5 http://localhost:8080 >/dev/null; then
    echo "✅ DropShare 服务正常"
else
    echo "❌ DropShare 服务异常"
fi

echo ""
echo "=== 部署完成 ==="
echo "🌐 访问地址: http://dropshare.tech"
echo "📊 查看日志: docker-compose logs -f"
echo "🔄 重启服务: docker-compose restart"
echo "⏹️  停止服务: docker-compose down"