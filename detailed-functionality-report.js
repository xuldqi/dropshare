#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/Users/macmima1234/Documents/project/dropshare/public';

// 详细分析每个工具页面的具体功能状态
function analyzePageDetailed(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      fileName,
      fileSize: Math.round(content.length / 1024) + 'KB',
      
      // 核心功能检查
      fileUpload: {
        hasFileInput: content.includes('type="file"'),
        hasDragDrop: content.includes('dragover') && content.includes('drop'),
        acceptAttribute: content.match(/accept="([^"]*)"/) ? content.match(/accept="([^"]*)"/)[1] : 'none'
      },
      
      // 处理能力检查
      processing: {
        hasFFmpeg: content.includes('ffmpeg') || content.includes('createFFmpeg'),
        hasCanvas: content.includes('getContext') || content.includes('canvas'),
        hasPDFLib: content.includes('pdf-lib') || content.includes('PDFDocument'),
        hasJSZip: content.includes('JSZip'),
        hasFileReader: content.includes('FileReader'),
        hasImageProcessing: content.includes('Image()') || content.includes('createImageBitmap')
      },
      
      // 输出和下载
      download: {
        hasDownloadFunction: content.includes('download') && content.includes('URL.createObjectURL'),
        hasBlobCreation: content.includes('new Blob'),
        hasURLCreation: content.includes('createObjectURL')
      },
      
      // 用户体验
      ui: {
        hasProgressBar: content.includes('progress-') || content.includes('进度'),
        hasErrorHandling: content.includes('catch') || content.includes('try'),
        hasLoadingStates: content.includes('loading') || content.includes('加载'),
        hasSuccessMessages: content.includes('success') || content.includes('成功')
      },
      
      // 集成功能
      integration: {
        hasShareIntegration: content.includes('share-integration') || content.includes('device-selector'),
        hasI18n: content.includes('i18n.js') || content.includes('DROPSHARE_I18N'),
        hasNavigation: content.includes('tools.html') || content.includes('back')
      },
      
      // 潜在问题检查
      issues: {
        hasJSErrors: content.includes('console.error') || content.includes('throw'),
        hasUnfinishedCode: content.includes('TODO') || content.includes('FIXME'),
        hasDebugCode: content.includes('console.log') && !content.includes('// debug'),
        hasMissingElements: content.includes('getElementById') && !content.includes('null check')
      }
    };
    
    return analysis;
  } catch (error) {
    return { 
      fileName, 
      error: error.message,
      fileExists: fs.existsSync(filePath),
      fileSize: fs.existsSync(filePath) ? Math.round(fs.statSync(filePath).size / 1024) + 'KB' : 'N/A'
    };
  }
}

// 定义所有重要的工具页面
const criticalPages = [
  // 图片工具
  'image-compressor-new.html',
  'image-converter-new.html',
  'image-resizer-new.html',
  'image-rotator-new.html',
  'image-cropper-new.html',
  'image-watermark-tool-new.html',
  'image-background-remover-new.html',
  'image-filter-effects-new.html',
  
  // 音频工具
  'audio-compressor-real.html',
  'audio-converter-real.html',
  'audio-trimmer-real.html',
  'audio-merger-real.html',
  'audio-effects-real.html',
  'volume-normalizer-real.html',
  'bitrate-converter-real.html',
  'metadata-editor-real.html',
  
  // 视频工具
  'video-compressor-real.html',
  'video-converter-real.html',
  'video-trimmer-real.html',
  'video-merger-real.html',
  'video-effects-real.html',
  'resolution-changer-real.html',
  'frame-rate-converter-real.html',
  'subtitle-editor-real.html',
  
  // 文档工具
  'pdf-compressor-real.html',
  'document-converter-real.html',
  'text-extractor-real.html',
  'pdf-merger-real.html',
  'pdf-splitter-real.html',
  
  // 实用工具
  'csv-to-xlsx.html',
  'xlsx-to-csv.html',
  'docx-to-txt.html',
  'text-to-image.html',
  
  // 核心页面
  'index.html',
  'share.html'
];

console.log('📋 DROPSHARE 详细功能状态报告');
console.log('='.repeat(80));
console.log(`生成时间: ${new Date().toLocaleString()}`);
console.log(`检查页面总数: ${criticalPages.length}\n`);

let healthyPages = 0;
let problemPages = 0;
let criticalIssues = [];
let minorIssues = [];

console.log('🔍 逐页详细分析：\n');

criticalPages.forEach((fileName, index) => {
  const filePath = path.join(publicDir, fileName);
  const analysis = analyzePageDetailed(filePath, fileName);
  
  console.log(`${(index + 1).toString().padStart(2)}. ${fileName}`);
  console.log('-'.repeat(60));
  
  if (analysis.error) {
    console.log(`   ❌ 文件错误: ${analysis.error}`);
    console.log(`   📊 文件存在: ${analysis.fileExists ? '是' : '否'}`);
    console.log(`   📁 文件大小: ${analysis.fileSize}\n`);
    criticalIssues.push(`${fileName}: ${analysis.error}`);
    problemPages++;
    return;
  }
  
  console.log(`   📁 文件大小: ${analysis.fileSize}`);
  
  // 文件上传功能
  const uploadStatus = analysis.fileUpload.hasFileInput && analysis.fileUpload.hasDragDrop ? '✅' : 
                      analysis.fileUpload.hasFileInput ? '⚠️' : '❌';
  console.log(`   📤 文件上传: ${uploadStatus} (输入:${analysis.fileUpload.hasFileInput ? '有' : '无'}, 拖拽:${analysis.fileUpload.hasDragDrop ? '有' : '无'})`);
  console.log(`   📋 接受格式: ${analysis.fileUpload.acceptAttribute}`);
  
  // 处理能力
  const processingCapabilities = [];
  if (analysis.processing.hasFFmpeg) processingCapabilities.push('FFmpeg');
  if (analysis.processing.hasCanvas) processingCapabilities.push('Canvas');
  if (analysis.processing.hasPDFLib) processingCapabilities.push('PDF-lib');
  if (analysis.processing.hasJSZip) processingCapabilities.push('JSZip');
  if (analysis.processing.hasFileReader) processingCapabilities.push('FileReader');
  if (analysis.processing.hasImageProcessing) processingCapabilities.push('图片处理');
  
  const processingStatus = processingCapabilities.length > 0 ? '✅' : '❌';
  console.log(`   ⚙️  处理能力: ${processingStatus} (${processingCapabilities.join(', ') || '无'})`);
  
  // 下载功能
  const downloadStatus = analysis.download.hasDownloadFunction ? '✅' : 
                        analysis.download.hasBlobCreation ? '⚠️' : '❌';
  console.log(`   💾 下载功能: ${downloadStatus} (完整:${analysis.download.hasDownloadFunction ? '有' : '无'})`);
  
  // 用户体验
  const uiFeatures = [];
  if (analysis.ui.hasProgressBar) uiFeatures.push('进度条');
  if (analysis.ui.hasErrorHandling) uiFeatures.push('错误处理');
  if (analysis.ui.hasLoadingStates) uiFeatures.push('加载状态');
  if (analysis.ui.hasSuccessMessages) uiFeatures.push('成功提示');
  
  const uiStatus = uiFeatures.length >= 3 ? '✅' : uiFeatures.length >= 1 ? '⚠️' : '❌';
  console.log(`   🎨 用户体验: ${uiStatus} (${uiFeatures.join(', ') || '无'})`);
  
  // 集成功能
  const integrationFeatures = [];
  if (analysis.integration.hasShareIntegration) integrationFeatures.push('分享集成');
  if (analysis.integration.hasI18n) integrationFeatures.push('国际化');
  if (analysis.integration.hasNavigation) integrationFeatures.push('导航');
  
  const integrationStatus = integrationFeatures.length >= 2 ? '✅' : integrationFeatures.length >= 1 ? '⚠️' : '❌';
  console.log(`   🔗 集成功能: ${integrationStatus} (${integrationFeatures.join(', ') || '无'})`);
  
  // 潜在问题
  const issueList = [];
  if (analysis.issues.hasJSErrors) issueList.push('JS错误');
  if (analysis.issues.hasUnfinishedCode) issueList.push('未完成代码');
  if (analysis.issues.hasDebugCode) issueList.push('调试代码');
  if (analysis.issues.hasMissingElements) issueList.push('缺少null检查');
  
  if (issueList.length > 0) {
    console.log(`   ⚠️  潜在问题: ${issueList.join(', ')}`);
    minorIssues.push(`${fileName}: ${issueList.join(', ')}`);
  }
  
  // 整体评估
  const scores = [
    analysis.fileUpload.hasFileInput && analysis.fileUpload.hasDragDrop,
    processingCapabilities.length > 0,
    analysis.download.hasDownloadFunction,
    uiFeatures.length >= 2,
    integrationFeatures.length >= 2
  ];
  
  const overallScore = scores.filter(Boolean).length;
  const overallStatus = overallScore >= 4 ? '✅ 优秀' : 
                       overallScore >= 3 ? '⚠️ 良好' : 
                       overallScore >= 2 ? '⚠️ 一般' : '❌ 需要修复';
  
  console.log(`   🎯 综合评分: ${overallStatus} (${overallScore}/5)\n`);
  
  if (overallScore >= 3) {
    healthyPages++;
  } else {
    problemPages++;
    criticalIssues.push(`${fileName}: 功能不完整 (${overallScore}/5)`);
  }
});

console.log('📊 总体统计：');
console.log('='.repeat(50));
console.log(`✅ 功能健全页面: ${healthyPages}/${criticalPages.length} (${Math.round((healthyPages/criticalPages.length)*100)}%)`);
console.log(`❌ 问题页面: ${problemPages}/${criticalPages.length} (${Math.round((problemPages/criticalPages.length)*100)}%)`);
console.log(`⚠️  严重问题: ${criticalIssues.length} 个`);
console.log(`🔧 小问题: ${minorIssues.length} 个`);

if (criticalIssues.length > 0) {
  console.log('\n🚨 需要重点关注的问题：');
  console.log('-'.repeat(40));
  criticalIssues.forEach((issue, i) => {
    console.log(`${i+1}. ${issue}`);
  });
}

if (minorIssues.length > 0) {
  console.log('\n🔧 次要问题（可选修复）：');
  console.log('-'.repeat(40));
  minorIssues.forEach((issue, i) => {
    console.log(`${i+1}. ${issue}`);
  });
}

console.log('\n💡 建议：');
console.log('-'.repeat(20));
console.log('1. 优先修复评分低于3分的页面');
console.log('2. 检查文件上传和处理逻辑的实际功能');
console.log('3. 测试下载功能的可用性'); 
console.log('4. 验证错误处理的有效性');
console.log('5. 手动测试关键工具的端到端流程');