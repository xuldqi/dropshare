#!/bin/bash

echo "=== 修复 UI JavaScript 错误 ==="

cd /var/www/dropshare || exit 1

echo "1. 修复 ui.js 中的DOM操作错误..."

# 创建修复后的通知系统
cat > "public/scripts/notification.js" << 'EOF'
// 安全的通知系统
class NotificationManager {
    constructor() {
        this.createNotificationContainer();
        this.bindEvents();
        console.log('✅ NotificationManager loaded');
    }

    createNotificationContainer() {
        // 确保通知容器存在
        if (!document.getElementById('notifications')) {
            const container = document.createElement('div');
            container.id = 'notifications';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(container);
        }
    }

    bindEvents() {
        Events.on('notify-user', (event) => {
            this.show(event.detail);
        });

        Events.on('server-connected', () => {
            this.show('Connected to server', 'success');
        });

        Events.on('server-disconnected', () => {
            this.show('Connection lost. Retrying...', 'warning');
        });
    }

    show(message, type = 'info') {
        if (!message) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : '#0c5460'};
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            font-size: 14px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.textContent = message;

        const container = document.getElementById('notifications');
        if (container) {
            container.appendChild(notification);

            // 3秒后自动移除
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, 3000);
        }
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 全局实例
window.notificationManager = new NotificationManager();
EOF

echo "✓ notification.js 已创建"

echo ""
echo "2. 更新 HTML 文件引用..."

# 在所有HTML文件中添加notification.js
for html_file in public/*.html; do
    if [[ -f "$html_file" ]]; then
        if ! grep -q "notification.js" "$html_file"; then
            sed -i '/<script.*src.*events.js/a\    <script src="scripts/notification.js?v='$(date +%s)'"></script>' "$html_file"
            echo "✓ 已更新: $(basename $html_file)"
        fi
    fi
done

echo ""
echo "3. 重启服务并测试..."

pkill -f "node.*index.js"
sleep 2
nohup node index.js > server.log 2>&1 &

echo "✓ 服务已重启"

echo ""
echo "=== UI错误修复完成 ==="
echo "现在强制刷新浏览器测试 (Ctrl+Shift+R)"