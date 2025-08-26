#!/bin/bash

echo "=== DropShare 服务重启工具 ==="
echo "开始时间: $(date)"
echo ""

# 安全检查
if [[ $EUID -eq 0 ]]; then
    echo "⚠ 警告：以root用户运行，请确保这是有意的"
fi

# 选择重启方式
echo "请选择重启方式："
echo "1. Docker 部署 (推荐)"
echo "2. 直接 Node.js 进程"
echo "3. 完全清理重启"
echo "4. 仅重启后端服务"
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo "=== Docker 部署重启 ==="
        if command -v docker-compose &> /dev/null; then
            echo "停止现有容器..."
            docker-compose down
            
            echo "清理旧容器和镜像..."
            docker system prune -f
            
            echo "重新构建并启动..."
            docker-compose up -d --build
            
            echo "等待服务启动..."
            sleep 10
            
            echo "检查服务状态..."
            docker-compose ps
            
        elif command -v docker &> /dev/null; then
            echo "使用 docker 命令..."
            docker stop dropshare 2>/dev/null || true
            docker rm dropshare 2>/dev/null || true
            docker build -t dropshare .
            docker run -d --name dropshare -p 8080:8080 dropshare
        else
            echo "✗ Docker 未安装，无法使用此选项"
            exit 1
        fi
        ;;
        
    2)
        echo "=== Node.js 进程重启 ==="
        echo "停止现有Node.js进程..."
        pkill -f "node.*index.js" || true
        pkill -f "npm.*start" || true
        
        echo "等待进程完全停止..."
        sleep 3
        
        echo "安装/更新依赖..."
        npm install
        
        echo "启动服务..."
        if command -v pm2 &> /dev/null; then
            pm2 delete dropshare 2>/dev/null || true
            pm2 start index.js --name dropshare
            pm2 save
        else
            echo "后台启动 Node.js 服务..."
            nohup node index.js > server.log 2>&1 &
        fi
        ;;
        
    3)
        echo "=== 完全清理重启 ==="
        echo "停止所有相关进程..."
        pkill -f "node.*index.js" || true
        pkill -f "npm.*start" || true
        docker-compose down 2>/dev/null || true
        docker stop dropshare 2>/dev/null || true
        docker rm dropshare 2>/dev/null || true
        
        echo "清理缓存和临时文件..."
        rm -f server.log
        rm -f nohup.out
        rm -rf node_modules/.cache
        
        echo "重新安装依赖..."
        npm install
        
        echo "使用 Docker 重新部署..."
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d --build
        else
            docker build -t dropshare .
            docker run -d --name dropshare -p 8080:8080 dropshare
        fi
        ;;
        
    4)
        echo "=== 仅重启后端服务 ==="
        echo "停止后端进程..."
        pkill -f "node.*index.js" || true
        
        echo "检查端口占用..."
        if command -v lsof &> /dev/null; then
            lsof -ti:8080 | xargs kill -9 2>/dev/null || true
            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        fi
        
        echo "重启后端服务..."
        nohup node index.js > server.log 2>&1 &
        ;;
        
    *)
        echo "无效选项，退出"
        exit 1
        ;;
esac

echo ""
echo "等待服务完全启动..."
sleep 5

echo "=== 服务状态检查 ==="
# 检查端口
if command -v netstat &> /dev/null; then
    netstat -tulpn | grep -E ":8080|:3000" || echo "未发现监听端口"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep -E ":8080|:3000" || echo "未发现监听端口"
fi

# 检查HTTP响应
echo "检查服务响应..."
for url in "http://localhost:8080" "http://localhost:3000"; do
    if command -v curl &> /dev/null; then
        if curl -s --connect-timeout 5 "$url" > /dev/null; then
            echo "✓ $url 响应正常"
        else
            echo "✗ $url 无响应"
        fi
    fi
done

echo ""
echo "=== 重启完成 ==="
echo "完成时间: $(date)"
echo ""
echo "后续操作："
echo "1. 查看日志: tail -f server.log"
echo "2. 检查状态: docker-compose ps (如使用Docker)"
echo "3. 访问服务: http://localhost:8080"
echo "4. 如有问题，运行: ./server-diagnosis.sh"