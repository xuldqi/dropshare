#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/Users/macmima1234/Documents/project/dropshare/public';

// 定义核心入口和导航页面
const entryPages = {
  '首页入口': 'index.html',
  '传送功能': 'share.html', 
  '房间功能': 'rooms.html',
  '图片工具导航': 'image-tools.html',
  '音频工具导航': 'audio-tools.html',
  '视频工具导航': 'video-tools.html',
  '文档工具导航': 'document-tools.html'
};

// 定义实际功能工具
const functionalTools = {
  '图片工具': [
    'image-compressor-new.html',
    'image-converter-new.html',
    'image-resizer-new.html', 
    'image-rotator-new.html',
    'image-cropper-new.html',
    'image-watermark-tool-new.html',
    'image-background-remover-new.html',
    'image-filter-effects-new.html'
  ],
  '音频工具': [
    'audio-compressor-real.html',
    'audio-converter-real.html',
    'audio-trimmer-real.html',
    'audio-merger-real.html',
    'audio-effects-real.html',
    'volume-normalizer-real.html',
    'bitrate-converter-real.html',
    'metadata-editor-real.html'
  ],
  '视频工具': [
    'video-compressor-real.html',
    'video-converter-real.html',
    'video-trimmer-real.html',
    'video-merger-real.html',
    'video-effects-real.html',
    'resolution-changer-real.html',
    'frame-rate-converter-real.html',
    'subtitle-editor-real.html'
  ],
  '文档工具': [
    'pdf-compressor-real.html',
    'document-converter-real.html',
    'text-extractor-real.html',
    'pdf-merger-real.html',
    'pdf-splitter-real.html'
  ]
};

function checkPageAccessibility(fileName) {
  const filePath = path.join(publicDir, fileName);
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: Math.round(stats.size / 1024) + 'KB',
      isEmpty: stats.size < 100
    };
  } catch (error) {
    return {
      exists: false,
      size: '0KB',
      isEmpty: true
    };
  }
}

function checkNavigationLinks(fileName) {
  const filePath = path.join(publicDir, fileName);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const links = {
      hasHomeLink: content.includes('index.html'),
      hasToolsLinks: content.includes('tools.html'),
      hasShareLink: content.includes('share.html'),
      hasRoomsLink: content.includes('rooms') || content.includes('#rooms'),
      hasBackLink: content.includes('back') || content.includes('返回'),
      
      // 检查具体工具链接
      hasImageLinks: content.includes('image-') && content.includes('.html'),
      hasAudioLinks: content.includes('audio-') && content.includes('.html'),
      hasVideoLinks: content.includes('video-') && content.includes('.html'),
      hasDocumentLinks: content.includes('pdf-') || content.includes('document-')
    };
    
    return links;
  } catch (error) {
    return { error: error.message };
  }
}

function checkFunctionalCapabilities(fileName) {
  const filePath = path.join(publicDir, fileName);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    return {
      hasFileInput: content.includes('type="file"'),
      hasFileAccept: content.includes('accept='),
      hasDragDrop: content.includes('dragover') && content.includes('drop'),
      hasProcessing: content.includes('canvas') || content.includes('FFmpeg') || content.includes('pdf-lib'),
      hasDownload: content.includes('download') && content.includes('createObjectURL'),
      hasErrorHandling: content.includes('catch') || content.includes('error'),
      hasI18n: content.includes('i18n.js')
    };
  } catch (error) {
    return { error: error.message };
  }
}

console.log('🔍 DROPSHARE 核心功能测试报告');
console.log('='.repeat(60));
console.log(`测试时间: ${new Date().toLocaleString()}\n`);

// 1. 检查入口和导航页面
console.log('📱 入口和导航页面检查:');
console.log('-'.repeat(50));

let entryIssues = [];

for (const [name, fileName] of Object.entries(entryPages)) {
  const accessibility = checkPageAccessibility(fileName);
  const navigation = checkNavigationLinks(fileName);
  
  console.log(`\n${name} (${fileName}):`);
  
  if (!accessibility.exists) {
    console.log(`  ❌ 文件不存在`);
    entryIssues.push(`${name}: 文件不存在`);
    continue;
  }
  
  if (accessibility.isEmpty) {
    console.log(`  ⚠️  文件过小 (${accessibility.size}) - 可能为空`);
    entryIssues.push(`${name}: 文件可能为空`);
  } else {
    console.log(`  ✅ 文件正常 (${accessibility.size})`);
  }
  
  if (navigation.error) {
    console.log(`  ❌ 读取错误: ${navigation.error}`);
    entryIssues.push(`${name}: 读取错误`);
    continue;
  }
  
  // 检查导航链接
  const navFeatures = [];
  if (navigation.hasHomeLink) navFeatures.push('首页链接');
  if (navigation.hasShareLink) navFeatures.push('传送链接');
  if (navigation.hasRoomsLink) navFeatures.push('房间链接');
  if (navigation.hasBackLink) navFeatures.push('返回链接');
  
  if (fileName.includes('tools')) {
    if (navigation.hasImageLinks) navFeatures.push('图片工具链接');
    if (navigation.hasAudioLinks) navFeatures.push('音频工具链接');
    if (navigation.hasVideoLinks) navFeatures.push('视频工具链接');
    if (navigation.hasDocumentLinks) navFeatures.push('文档工具链接');
  }
  
  console.log(`  🔗 导航功能: ${navFeatures.join(', ') || '无'}`);
}

// 2. 检查功能工具
console.log(`\n\n⚙️  功能工具检查:`);
console.log('-'.repeat(50));

let toolIssues = [];
let workingTools = 0;
let totalTools = 0;

for (const [category, tools] of Object.entries(functionalTools)) {
  console.log(`\n${category}:`);
  
  for (const toolFile of tools) {
    totalTools++;
    const accessibility = checkPageAccessibility(toolFile);
    const functionality = checkFunctionalCapabilities(toolFile);
    
    console.log(`  ${toolFile}:`);
    
    if (!accessibility.exists) {
      console.log(`    ❌ 文件不存在`);
      toolIssues.push(`${toolFile}: 文件不存在`);
      continue;
    }
    
    if (accessibility.isEmpty) {
      console.log(`    ⚠️  文件过小 (${accessibility.size})`);
      toolIssues.push(`${toolFile}: 文件可能为空`);
      continue;
    }
    
    if (functionality.error) {
      console.log(`    ❌ 读取错误: ${functionality.error}`);
      toolIssues.push(`${toolFile}: 读取错误`);
      continue;
    }
    
    // 评估核心功能
    const coreFeatures = [];
    let score = 0;
    
    if (functionality.hasFileInput) { coreFeatures.push('文件输入'); score++; }
    if (functionality.hasDragDrop) { coreFeatures.push('拖拽上传'); score++; }
    if (functionality.hasProcessing) { coreFeatures.push('文件处理'); score++; }
    if (functionality.hasDownload) { coreFeatures.push('文件下载'); score++; }
    if (functionality.hasI18n) { coreFeatures.push('国际化'); score++; }
    
    const status = score >= 4 ? '✅' : score >= 3 ? '⚠️' : '❌';
    console.log(`    ${status} 功能完整度: ${score}/5 (${coreFeatures.join(', ')})`);
    
    if (score >= 3) {
      workingTools++;
    } else {
      toolIssues.push(`${toolFile}: 功能不完整 (${score}/5)`);
    }
  }
}

// 3. 总结报告
console.log(`\n\n📊 测试总结:`);
console.log('='.repeat(40));
console.log(`📱 入口页面问题: ${entryIssues.length} 个`);
console.log(`⚙️  工具功能问题: ${toolIssues.length} 个`);
console.log(`✅ 正常工作的工具: ${workingTools}/${totalTools} (${Math.round((workingTools/totalTools)*100)}%)`);

if (entryIssues.length > 0) {
  console.log(`\n🚨 入口页面问题:`);
  entryIssues.forEach((issue, i) => {
    console.log(`${i+1}. ${issue}`);
  });
}

if (toolIssues.length > 0) {
  console.log(`\n🔧 工具功能问题:`);
  toolIssues.forEach((issue, i) => {
    console.log(`${i+1}. ${issue}`);
  });
}

console.log(`\n💡 下一步建议:`);
console.log('-'.repeat(20));
console.log('1. 手动测试主要导航流程');
console.log('2. 验证文件上传和处理功能');
console.log('3. 检查工具间的链接跳转');
console.log('4. 测试传送和房间功能');