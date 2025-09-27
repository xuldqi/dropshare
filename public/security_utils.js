// 安全工具函数
class SecurityUtils {
    // HTML转义函数，防止XSS攻击
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            return String(unsafe || '');
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 安全的innerHTML替代方法
    static safeSetHTML(element, html) {
        // 清空元素
        element.innerHTML = '';
        
        // 创建临时容器并设置转义后的内容
        const temp = document.createElement('div');
        temp.textContent = html;
        
        // 将内容移动到目标元素
        while (temp.firstChild) {
            element.appendChild(temp.firstChild);
        }
    }
    
    // 验证文件名
    static validateFileName(fileName) {
        if (!fileName || typeof fileName !== 'string') {
            return false;
        }
        
        // 检查长度
        if (fileName.length > 255) {
            return false;
        }
        
        // 检查非法字符
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (invalidChars.test(fileName)) {
            return false;
        }
        
        return true;
    }
    
    // 验证房间代码
    static validateRoomCode(roomCode) {
        if (!roomCode || typeof roomCode !== 'string') {
            return false;
        }
        
        // 房间代码应该是8-12位的字母数字组合
        const validPattern = /^[A-Z0-9]{8,12}$/;
        return validPattern.test(roomCode);
    }
    
    // 验证显示名称
    static validateDisplayName(displayName) {
        if (!displayName || typeof displayName !== 'string') {
            return false;
        }
        
        // 长度限制
        if (displayName.length < 1 || displayName.length > 50) {
            return false;
        }
        
        // 移除潜在的HTML标签
        const cleaned = displayName.replace(/<[^>]*>/g, '').trim();
        return cleaned.length > 0;
    }
    
    // 文件大小验证（仅检查基本有效性，不限制大小）
    static validateFileSize(fileSize, maxSize = null) {
        // 本地传输不需要限制文件大小
        return fileSize > 0;
    }
    
    // 清理显示名称
    static sanitizeDisplayName(displayName) {
        if (!displayName) return 'Unknown';
        
        const cleaned = this.escapeHtml(displayName.trim().substring(0, 50));
        return cleaned || 'Unknown';
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.SecurityUtils = SecurityUtils;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityUtils;
}
