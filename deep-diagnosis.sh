#!/bin/bash

echo "=== DropShare 深度诊断工具 ==="
echo "时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# 1. 检查基础服务状态
echo "1. 基础服务状态检查"
echo "==================="

# 检查Nginx
if systemctl is-active --quiet nginx; then
    log_success "Nginx 服务运行中"
else
    log_error "Nginx 服务未运行"
    echo "尝试启动Nginx..."
    systemctl start nginx
fi

# 检查端口监听
echo ""
echo "端口监听状态:"
netstat_output=$(netstat -tulpn 2>/dev/null || ss -tulpn)
if echo "$netstat_output" | grep -q ":80 "; then
    log_success "端口 80 正在监听"
else
    log_error "端口 80 未监听"
fi

if echo "$netstat_output" | grep -q ":8080 "; then
    log_success "端口 8080 正在监听"
else
    log_error "端口 8080 未监听"
fi

# 2. 检查DropShare服务
echo ""
echo "2. DropShare 服务检查"
echo "===================="

dropshare_pid=$(pgrep -f "node.*index.js")
if [[ -n "$dropshare_pid" ]]; then
    log_success "DropShare 进程运行中 (PID: $dropshare_pid)"
else
    log_error "DropShare 进程未运行"
    echo "尝试启动DropShare..."
    cd /var/www/dropshare
    nohup node index.js > server.log 2>&1 &
    sleep 3
    dropshare_pid=$(pgrep -f "node.*index.js")
    if [[ -n "$dropshare_pid" ]]; then
        log_success "DropShare 已启动 (PID: $dropshare_pid)"
    else
        log_error "DropShare 启动失败"
    fi
fi

# 3. 网络连接测试
echo ""
echo "3. 网络连接测试"
echo "=============="

# 测试本地8080端口
if curl -s --connect-timeout 5 http://localhost:8080 > /dev/null; then
    log_success "localhost:8080 连接正常"
else
    log_error "localhost:8080 连接失败"
fi

# 测试本地80端口
if curl -s --connect-timeout 5 http://localhost > /dev/null; then
    log_success "localhost:80 连接正常"
else
    log_error "localhost:80 连接失败"
fi

# 测试外部域名
if curl -s --connect-timeout 10 http://dropshare.tech > /dev/null; then
    log_success "dropshare.tech 外部访问正常"
else
    log_error "dropshare.tech 外部访问失败"
fi

# 4. Nginx配置检查
echo ""
echo "4. Nginx 配置检查"
echo "================"

nginx_configs=$(find /etc/nginx -name "*.conf" -type f 2>/dev/null)
if [[ -n "$nginx_configs" ]]; then
    log_success "找到Nginx配置文件"
    
    # 检查配置语法
    if nginx -t 2>/dev/null; then
        log_success "Nginx 配置语法正确"
    else
        log_error "Nginx 配置语法错误"
        nginx -t
    fi
    
    # 检查upstream配置
    echo ""
    echo "检查upstream配置:"
    for config in $nginx_configs; do
        if grep -l "proxy_pass\|upstream" "$config" 2>/dev/null; then
            echo "配置文件: $config"
            grep -n "proxy_pass\|upstream" "$config" 2>/dev/null | head -5
            echo ""
        fi
    done
else
    log_error "未找到Nginx配置文件"
fi

# 5. 防火墙检查
echo ""
echo "5. 防火墙检查"
echo "============"

# UFW检查
if command -v ufw >/dev/null; then
    ufw_status=$(ufw status)
    echo "UFW状态: $ufw_status"
    if echo "$ufw_status" | grep -q "Status: active"; then
        if echo "$ufw_status" | grep -q "80\|8080"; then
            log_success "防火墙已开放HTTP端口"
        else
            log_warning "防火墙可能阻止HTTP端口"
            echo "建议运行: sudo ufw allow 80 && sudo ufw allow 8080"
        fi
    else
        log_success "UFW防火墙未启用"
    fi
fi

# iptables检查
if command -v iptables >/dev/null; then
    if iptables -L INPUT -n | grep -q "ACCEPT.*tcp.*80\|ACCEPT.*tcp.*8080"; then
        log_success "iptables 允许HTTP端口"
    else
        log_warning "iptables 可能阻止HTTP端口"
    fi
fi

# 6. 系统资源检查
echo ""
echo "6. 系统资源检查"
echo "=============="

# 内存使用
mem_info=$(free -h | awk 'NR==2{printf "使用: %s/%s (%.2f%%)", $3,$2,$3*100/$2 }')
echo "内存: $mem_info"

# 磁盘使用
disk_info=$(df -h / | awk 'NR==2{print $5 " 已使用"}')
echo "磁盘: $disk_info"

# CPU负载
load_info=$(uptime | awk -F'load average:' '{print $2}')
echo "负载: $load_info"

# 7. 错误日志分析
echo ""
echo "7. 错误日志分析"
echo "=============="

# Nginx错误日志
nginx_error_log="/var/log/nginx/error.log"
if [[ -f "$nginx_error_log" ]]; then
    echo "最近的Nginx错误 (最新5条):"
    tail -5 "$nginx_error_log" | grep -E "(error|failed|refused)" || echo "无相关错误"
    echo ""
fi

# 系统日志
echo "最近的系统错误 (最新3条):"
journalctl -n 3 --no-pager | grep -iE "(error|failed)" || echo "无相关错误"

# DropShare日志
dropshare_log="/var/www/dropshare/server.log"
if [[ -f "$dropshare_log" ]]; then
    echo ""
    echo "DropShare日志 (最新5行):"
    tail -5 "$dropshare_log"
fi

# 8. WebSocket测试
echo ""
echo "8. WebSocket 连接测试"
echo "==================="

# 创建临时WebSocket测试
cat > /tmp/websocket_test.js << 'EOF'
const WebSocket = require('ws');

console.log('测试WebSocket连接...');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
    console.log('✓ WebSocket连接成功');
    process.exit(0);
});

ws.on('error', function error(err) {
    console.log('✗ WebSocket连接失败:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('✗ WebSocket连接超时');
    process.exit(1);
}, 5000);
EOF

if command -v node >/dev/null; then
    cd /var/www/dropshare
    node /tmp/websocket_test.js 2>/dev/null || log_error "WebSocket测试失败"
else
    log_warning "Node.js不可用，跳过WebSocket测试"
fi

# 9. DNS解析测试
echo ""
echo "9. DNS 解析测试"
echo "=============="

if command -v nslookup >/dev/null; then
    echo "dropshare.tech DNS解析:"
    nslookup dropshare.tech | grep -A2 "Name:"
fi

# 10. 生成修复建议
echo ""
echo "10. 修复建议"
echo "==========="

# 检查常见问题并给出建议
suggestions=()

# 检查是否有端口未监听
if ! netstat -tulpn 2>/dev/null | grep -q ":8080 "; then
    suggestions+=("后端端口8080未监听，运行: cd /var/www/dropshare && node index.js")
fi

if ! netstat -tulpn 2>/dev/null | grep -q ":80 "; then
    suggestions+=("Nginx端口80未监听，运行: sudo systemctl restart nginx")
fi

# 检查防火墙
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
    if ! ufw status | grep -q "80\|8080"; then
        suggestions+=("开放防火墙端口: sudo ufw allow 80 && sudo ufw allow 8080")
    fi
fi

# 输出建议
if [[ ${#suggestions[@]} -gt 0 ]]; then
    echo "建议修复操作:"
    for suggestion in "${suggestions[@]}"; do
        echo "- $suggestion"
    done
else
    log_success "未发现明显问题，可能是网络或DNS问题"
fi

echo ""
echo "=== 诊断完成 ==="
echo "如需更多帮助，请提供此诊断报告"

# 清理临时文件
rm -f /tmp/websocket_test.js