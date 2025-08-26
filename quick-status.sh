#!/bin/bash

echo "=== DropShare 快速状态检查 ==="

# 检查服务是否响应
if curl -s --connect-timeout 3 http://localhost:8080 > /dev/null; then
    echo "✓ 服务正常运行 (http://localhost:8080)"
    
    # 检查具体响应
    response=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080)
    echo "  HTTP状态码: $response"
    
else
    echo "✗ 服务未响应或无法连接"
    
    # 快速检查可能的问题
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q dropshare; then
        echo "  Docker容器正在运行"
    elif ps aux | grep -v grep | grep -q "node.*index.js"; then
        echo "  Node.js进程正在运行"
    else
        echo "  未发现运行的服务"
        echo "  建议运行: ./restart-server.sh"
    fi
fi

# 显示最近的日志（如果有）
if [[ -f "server.log" ]]; then
    echo ""
    echo "最近的日志："
    tail -3 server.log
fi