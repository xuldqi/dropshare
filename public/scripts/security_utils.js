// Security Utilities for DropShare
// Provides basic security functions and validation

class SecurityUtils {
    static sanitizeFileName(filename) {
        if (!filename) return 'untitled';
        
        // Remove dangerous characters
        return filename
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\.\./g, '_')
            .trim()
            .substring(0, 255);
    }
    
    static validateFileSize(size, maxSize = 100 * 1024 * 1024) { // 100MB default
        return size > 0 && size <= maxSize;
    }
    
    static isAllowedMimeType(mimeType) {
        const dangerous = [
            'application/x-executable',
            'application/x-msdownload',
            'application/x-msdos-program'
        ];
        
        return !dangerous.includes(mimeType);
    }
}

// Export for use
window.SecurityUtils = SecurityUtils;