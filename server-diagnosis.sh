#!/bin/bash

echo "=== DropShare 服务器诊断工具 ==="
echo "检查时间: $(date)"
echo ""

# 检查Docker状态
echo "1. 检查Docker服务状态："
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo "✓ Docker 服务正常运行"
    else
        echo "✗ Docker 服务未运行或无权限"
    fi
else
    echo "✗ Docker 未安装"
fi
echo ""

# 检查容器状态
echo "2. 检查DropShare容器状态："
if command -v docker &> /dev/null; then
    containers=$(docker ps -a --filter "name=dropshare" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
    if [[ -n "$containers" ]]; then
        echo "$containers"
    else
        echo "未找到 dropshare 相关容器"
    fi
else
    echo "Docker 不可用，跳过容器检查"
fi
echo ""

# 检查端口占用
echo "3. 检查端口占用情况："
ports=("8080" "3000" "80" "443")
for port in "${ports[@]}"; do
    if command -v netstat &> /dev/null; then
        result=$(netstat -tulpn 2>/dev/null | grep ":$port ")
        if [[ -n "$result" ]]; then
            echo "端口 $port: 已占用"
            echo "  $result"
        else
            echo "端口 $port: 空闲"
        fi
    elif command -v ss &> /dev/null; then
        result=$(ss -tulpn | grep ":$port ")
        if [[ -n "$result" ]]; then
            echo "端口 $port: 已占用"
            echo "  $result"
        else
            echo "端口 $port: 空闲"
        fi
    else
        echo "无法检查端口状态（缺少 netstat 或 ss 命令）"
        break
    fi
done
echo ""

# 检查Node.js进程
echo "4. 检查Node.js进程："
if command -v ps &> /dev/null; then
    node_processes=$(ps aux | grep -E "(node|npm)" | grep -v grep)
    if [[ -n "$node_processes" ]]; then
        echo "发现Node.js进程："
        echo "$node_processes"
    else
        echo "未发现Node.js进程"
    fi
else
    echo "无法检查进程（缺少 ps 命令）"
fi
echo ""

# 检查服务响应
echo "5. 检查服务响应："
urls=("http://localhost:8080" "http://localhost:3000")
for url in "${urls[@]}"; do
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout 5 "$url" 2>/dev/null)
        if [[ "$response" == "200" ]]; then
            echo "✓ $url 响应正常 (HTTP $response)"
        elif [[ -n "$response" ]]; then
            echo "⚠ $url 响应异常 (HTTP $response)"
        else
            echo "✗ $url 无响应或连接超时"
        fi
    else
        echo "无法测试URL响应（缺少 curl 命令）"
        break
    fi
done
echo ""

# 检查磁盘空间
echo "6. 检查磁盘空间："
if command -v df &> /dev/null; then
    df -h / | tail -n 1 | awk '{print "根目录使用率: " $5 " (可用: " $4 ")"}'
else
    echo "无法检查磁盘空间"
fi
echo ""

# 检查内存使用
echo "7. 检查内存使用："
if command -v free &> /dev/null; then
    free -h | awk 'NR==2{print "内存使用: " $3 "/" $2 " (" int($3/$2*100) "%)"}'
elif [[ -r /proc/meminfo ]]; then
    total=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024)}')
    available=$(grep MemAvailable /proc/meminfo | awk '{print int($2/1024)}')
    used=$((total - available))
    echo "内存使用: ${used}MB/${total}MB ($(( used * 100 / total ))%)"
else
    echo "无法检查内存使用"
fi
echo ""

# 检查日志文件
echo "8. 检查最近的错误日志："
log_files=("/var/log/nginx/error.log" "/var/log/syslog" "server.log" "dropshare.log")
for log_file in "${log_files[@]}"; do
    if [[ -r "$log_file" ]]; then
        echo "--- $log_file (最近10行错误) ---"
        if command -v tail &> /dev/null; then
            tail -10 "$log_file" | grep -i error || echo "无错误日志"
        fi
        echo ""
    fi
done

echo "=== 诊断完成 ==="
echo ""
echo "建议操作："
echo "1. 如果容器未运行，使用: docker-compose up -d"
echo "2. 如果端口被占用，使用: ./restart-server.sh"
echo "3. 如果服务无响应，检查应用日志"
echo "4. 如果内存不足，重启服务器或清理内存"