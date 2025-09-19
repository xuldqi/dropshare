const fs = require('fs');
const path = require('path');

// 全面项目检测脚本
class ProjectAuditor {
    constructor() {
        this.publicDir = '/Users/macmima1234/Documents/project/dropshare/public';
        this.results = {
            translation: { complete: [], incomplete: [], errors: [] },
            functionality: { working: [], broken: [], missing: [] },
            accessibility: { accessible: [], inaccessible: [], errors: [] },
            fileTransfer: { features: [], status: 'unknown' }
        };
    }

    // 1. 检查翻译完整性
    async checkTranslations() {
        console.log('🌍 检查翻译完整性...\n');
        
        const languageFiles = ['en.json', 'zh-CN.json', 'zh-TW.json', 'ja.json', 'ko.json', 'fr.json', 'de.json', 'pt.json', 'es.json'];
        const translations = {};
        
        // 读取所有语言文件
        for (const file of languageFiles) {
            const filePath = path.join(this.publicDir, 'locales', file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                translations[file] = JSON.parse(content);
            } catch (error) {
                this.results.translation.errors.push(`${file}: ${error.message}`);
            }
        }
        
        // 以英文为基准检查缺失翻译
        const baseKeys = Object.keys(translations['en.json'] || {});
        console.log(`📝 基准翻译键数量: ${baseKeys.length}`);
        
        for (const [lang, keys] of Object.entries(translations)) {
            if (lang === 'en.json') continue;
            
            const missingKeys = baseKeys.filter(key => !(key in keys));
            const extraKeys = Object.keys(keys).filter(key => !baseKeys.includes(key));
            
            if (missingKeys.length === 0 && extraKeys.length === 0) {
                this.results.translation.complete.push(lang);
                console.log(`✅ ${lang}: 完整 (${Object.keys(keys).length} 键)`);
            } else {
                this.results.translation.incomplete.push({
                    language: lang,
                    missing: missingKeys.length,
                    extra: extraKeys.length,
                    missingKeys: missingKeys.slice(0, 5), // 只显示前5个
                    extraKeys: extraKeys.slice(0, 5)
                });
                console.log(`⚠️  ${lang}: 缺失 ${missingKeys.length} 键, 多余 ${extraKeys.length} 键`);
            }
        }
    }

    // 2. 检查页面功能性
    async checkPageFunctionality() {
        console.log('\n🔧 检查页面功能性...\n');
        
        const htmlFiles = fs.readdirSync(this.publicDir)
            .filter(file => file.endsWith('.html'))
            .filter(file => !file.includes('test') && !file.includes('debug'));
        
        for (const file of htmlFiles) {
            const filePath = path.join(this.publicDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            const issues = [];
            
            // 检查基本HTML结构
            if (!content.includes('<title>')) issues.push('缺少 title 标签');
            if (!content.includes('<!DOCTYPE html>')) issues.push('缺少 DOCTYPE');
            
            // 检查翻译支持
            if (!content.includes('data-i18n=') && !file.includes('index')) {
                issues.push('缺少翻译标记');
            }
            
            // 检查脚本引用
            if (content.includes('ffmpeg') && !content.includes('unpkg.com/@ffmpeg/ffmpeg')) {
                issues.push('FFmpeg 引用可能有问题');
            }
            
            // 检查页面标题
            if (!content.includes('<h1') && !file.includes('index') && !file.includes('about') && !file.includes('terms') && !file.includes('privacy')) {
                issues.push('缺少页面标题');
            }
            
            if (issues.length === 0) {
                this.results.functionality.working.push(file);
                console.log(`✅ ${file}: 正常`);
            } else {
                this.results.functionality.broken.push({ file, issues });
                console.log(`❌ ${file}: ${issues.join(', ')}`);
            }
        }
    }

    // 3. 检查页面可访问性
    async checkPageAccessibility() {
        console.log('\n🚪 检查页面可访问性...\n');
        
        const importantPages = [
            'index.html',
            'audio-tools.html',
            'video-tools.html', 
            'image-tools.html',
            'document-tools.html',
            'share.html',
            'audio-compressor-real.html',
            'video-converter-real.html',
            'image-resizer-new.html',
            'metadata-editor-real.html',
            'volume-normalizer-stable.html'
        ];
        
        for (const page of importantPages) {
            const filePath = path.join(this.publicDir, page);
            
            if (!fs.existsSync(filePath)) {
                this.results.accessibility.inaccessible.push(page);
                console.log(`❌ ${page}: 文件不存在`);
                continue;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const issues = [];
            
            // 检查基本可访问性
            if (!content.includes('<title>')) issues.push('无标题');
            if (!content.includes('charset=')) issues.push('无字符编码');
            if (!content.includes('viewport')) issues.push('无移动端适配');
            
            if (issues.length === 0) {
                this.results.accessibility.accessible.push(page);
                console.log(`✅ ${page}: 可正常访问`);
            } else {
                this.results.accessibility.errors.push({ page, issues });
                console.log(`⚠️  ${page}: ${issues.join(', ')}`);
            }
        }
    }

    // 4. 检查文件传输功能
    async checkFileTransferFeatures() {
        console.log('\n📁 检查文件传输和房间功能...\n');
        
        // 检查 share.html 的传输功能
        const shareFile = path.join(this.publicDir, 'share.html');
        if (fs.existsSync(shareFile)) {
            const content = fs.readFileSync(shareFile, 'utf8');
            
            const features = [];
            
            // 检查房间功能
            if (content.includes('room') || content.includes('Room')) {
                features.push('房间功能');
            }
            
            // 检查文件上传
            if (content.includes('input[type="file"]') || content.includes('file upload')) {
                features.push('文件上传');
            }
            
            // 检查拖拽功能
            if (content.includes('dragover') || content.includes('drop')) {
                features.push('拖拽上传');
            }
            
            // 检查WebRTC
            if (content.includes('RTCPeerConnection') || content.includes('webrtc')) {
                features.push('P2P传输');
            }
            
            // 检查设备发现
            if (content.includes('device') || content.includes('Device')) {
                features.push('设备发现');
            }
            
            this.results.fileTransfer.features = features;
            console.log(`📤 传输功能: ${features.join(', ')}`);
            
            if (features.length >= 3) {
                this.results.fileTransfer.status = 'complete';
                console.log('✅ 文件传输功能看起来完整');
            } else {
                this.results.fileTransfer.status = 'incomplete';
                console.log('⚠️  文件传输功能可能不完整');
            }
        } else {
            console.log('❌ share.html 文件不存在');
            this.results.fileTransfer.status = 'missing';
        }

        // 检查关键的JS文件
        const jsFiles = ['device-selector.js', 'add-share-integration.js'];
        for (const jsFile of jsFiles) {
            const jsPath = path.join(this.publicDir, jsFile);
            if (fs.existsSync(jsPath)) {
                console.log(`✅ ${jsFile}: 存在`);
            } else {
                console.log(`❌ ${jsFile}: 缺失`);
            }
        }
    }

    // 生成详细报告
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 项目检测报告');
        console.log('='.repeat(60));
        
        console.log('\n📊 翻译完整性:');
        console.log(`✅ 完整: ${this.results.translation.complete.length} 语言`);
        console.log(`⚠️  不完整: ${this.results.translation.incomplete.length} 语言`);
        console.log(`❌ 错误: ${this.results.translation.errors.length} 个`);
        
        if (this.results.translation.incomplete.length > 0) {
            console.log('\n缺失翻译详情:');
            this.results.translation.incomplete.forEach(item => {
                console.log(`  ${item.language}: 缺失 ${item.missing} 键, 多余 ${item.extra} 键`);
            });
        }
        
        console.log('\n🔧 页面功能性:');
        console.log(`✅ 正常: ${this.results.functionality.working.length} 页面`);
        console.log(`❌ 有问题: ${this.results.functionality.broken.length} 页面`);
        
        if (this.results.functionality.broken.length > 0) {
            console.log('\n功能问题详情:');
            this.results.functionality.broken.forEach(item => {
                console.log(`  ${item.file}: ${item.issues.join(', ')}`);
            });
        }
        
        console.log('\n🚪 页面可访问性:');
        console.log(`✅ 可访问: ${this.results.accessibility.accessible.length} 页面`);
        console.log(`⚠️  有警告: ${this.results.accessibility.errors.length} 页面`);
        console.log(`❌ 不可访问: ${this.results.accessibility.inaccessible.length} 页面`);
        
        console.log('\n📁 文件传输功能:');
        console.log(`状态: ${this.results.fileTransfer.status}`);
        console.log(`功能: ${this.results.fileTransfer.features.join(', ')}`);
        
        // 总体评分
        const totalScore = this.calculateScore();
        console.log('\n' + '='.repeat(60));
        console.log(`🎯 项目总体评分: ${totalScore}/100`);
        console.log('='.repeat(60));
        
        if (totalScore >= 90) {
            console.log('🎉 项目状态: 优秀');
        } else if (totalScore >= 80) {
            console.log('👍 项目状态: 良好');
        } else if (totalScore >= 70) {
            console.log('⚠️  项目状态: 需要改进');
        } else {
            console.log('🔧 项目状态: 需要大量修复');
        }
    }
    
    calculateScore() {
        let score = 0;
        
        // 翻译完整性 (30分)
        const translationScore = (this.results.translation.complete.length / 8) * 30;
        score += translationScore;
        
        // 页面功能性 (40分)
        const totalPages = this.results.functionality.working.length + this.results.functionality.broken.length;
        const functionalityScore = totalPages > 0 ? (this.results.functionality.working.length / totalPages) * 40 : 0;
        score += functionalityScore;
        
        // 页面可访问性 (20分)
        const accessibilityScore = (this.results.accessibility.accessible.length / 11) * 20;
        score += accessibilityScore;
        
        // 文件传输功能 (10分)
        const transferScore = this.results.fileTransfer.status === 'complete' ? 10 : 
                             this.results.fileTransfer.status === 'incomplete' ? 5 : 0;
        score += transferScore;
        
        return Math.round(score);
    }

    async runFullAudit() {
        console.log('🚀 开始全面项目检测...\n');
        
        await this.checkTranslations();
        await this.checkPageFunctionality(); 
        await this.checkPageAccessibility();
        await this.checkFileTransferFeatures();
        
        this.generateReport();
    }
}

// 运行检测
const auditor = new ProjectAuditor();
auditor.runFullAudit().catch(console.error);