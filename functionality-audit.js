#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/Users/macmima1234/Documents/project/dropshare/public';

// Define all functional tools and their expected capabilities
const toolCategories = {
  'Image Tools': {
    pages: [
      { file: 'image-compressor-new.html', name: 'Image Compressor', accepts: ['image/*'], processes: true },
      { file: 'image-converter-new.html', name: 'Image Converter', accepts: ['image/*'], processes: true },
      { file: 'image-resizer-new.html', name: 'Image Resizer', accepts: ['image/*'], processes: true },
      { file: 'image-rotator-new.html', name: 'Image Rotator', accepts: ['image/*'], processes: true },
      { file: 'image-cropper-new.html', name: 'Image Cropper', accepts: ['image/*'], processes: true },
      { file: 'image-watermark-tool-new.html', name: 'Image Watermark', accepts: ['image/*'], processes: true },
      { file: 'image-background-remover-new.html', name: 'Background Remover', accepts: ['image/*'], processes: true },
      { file: 'image-filter-effects-new.html', name: 'Filter Effects', accepts: ['image/*'], processes: true }
    ]
  },
  'Audio Tools': {
    pages: [
      { file: 'audio-compressor-real.html', name: 'Audio Compressor', accepts: ['audio/*'], processes: true },
      { file: 'audio-converter-real.html', name: 'Audio Converter', accepts: ['audio/*'], processes: true },
      { file: 'audio-trimmer-real.html', name: 'Audio Trimmer', accepts: ['audio/*'], processes: true },
      { file: 'audio-merger-real.html', name: 'Audio Merger', accepts: ['audio/*'], processes: true },
      { file: 'audio-effects-real.html', name: 'Audio Effects', accepts: ['audio/*'], processes: true },
      { file: 'volume-normalizer-real.html', name: 'Volume Normalizer', accepts: ['audio/*'], processes: true },
      { file: 'bitrate-converter-real.html', name: 'Bitrate Converter', accepts: ['audio/*'], processes: true },
      { file: 'metadata-editor-real.html', name: 'Metadata Editor', accepts: ['audio/*'], processes: true }
    ]
  },
  'Video Tools': {
    pages: [
      { file: 'video-compressor-real.html', name: 'Video Compressor', accepts: ['video/*'], processes: true },
      { file: 'video-converter-real.html', name: 'Video Converter', accepts: ['video/*'], processes: true },
      { file: 'video-trimmer-real.html', name: 'Video Trimmer', accepts: ['video/*'], processes: true },
      { file: 'video-merger-real.html', name: 'Video Merger', accepts: ['video/*'], processes: true },
      { file: 'video-effects-real.html', name: 'Video Effects', accepts: ['video/*'], processes: true },
      { file: 'resolution-changer-real.html', name: 'Resolution Changer', accepts: ['video/*'], processes: true },
      { file: 'frame-rate-converter-real.html', name: 'Frame Rate Converter', accepts: ['video/*'], processes: true },
      { file: 'subtitle-editor-real.html', name: 'Subtitle Editor', accepts: ['video/*'], processes: true }
    ]
  },
  'Document Tools': {
    pages: [
      { file: 'pdf-compressor-real.html', name: 'PDF Compressor', accepts: ['.pdf'], processes: true },
      { file: 'document-converter-real.html', name: 'Document Converter', accepts: ['.pdf,.docx,.txt'], processes: true },
      { file: 'text-extractor-real.html', name: 'Text Extractor', accepts: ['.pdf,.jpg,.png,.docx'], processes: true },
      { file: 'pdf-merger-real.html', name: 'PDF Merger', accepts: ['.pdf'], processes: true },
      { file: 'pdf-splitter-real.html', name: 'PDF Splitter', accepts: ['.pdf'], processes: true }
    ]
  },
  'Utility Tools': {
    pages: [
      { file: 'csv-to-xlsx.html', name: 'CSV to XLSX', accepts: ['.csv'], processes: true },
      { file: 'xlsx-to-csv.html', name: 'XLSX to CSV', accepts: ['.xlsx'], processes: true },
      { file: 'docx-to-txt.html', name: 'DOCX to TXT', accepts: ['.docx'], processes: true },
      { file: 'text-to-image.html', name: 'Text to Image', accepts: ['text'], processes: true }
    ]
  }
};

// Function to analyze a page for functionality
function analyzePage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const analysis = {
      hasFileInput: content.includes('type="file"') || content.includes('input.*file'),
      hasAcceptAttribute: content.includes('accept='),
      hasDragDrop: content.includes('dragover') || content.includes('drop'),
      hasProcessingLogic: content.includes('canvas') || content.includes('FFmpeg') || 
                         content.includes('createObjectURL') || content.includes('FileReader'),
      hasDownloadFunction: content.includes('download') || content.includes('URL.createObjectURL'),
      hasShareIntegration: content.includes('share-integration') || content.includes('device-selector'),
      hasErrorHandling: content.includes('catch') || content.includes('error'),
      hasProgressIndicator: content.includes('progress') || content.includes('loading'),
      
      // Check for specific libraries/dependencies
      usesFFmpeg: content.includes('ffmpeg') || content.includes('createFFmpeg'),
      usesCanvas: content.includes('getContext') || content.includes('canvas'),
      usesPDFLib: content.includes('pdf-lib') || content.includes('PDFDocument'),
      usesImageLibs: content.includes('fabric') || content.includes('konva'),
      
      // Check for navigation and routing
      hasBackButton: content.includes('back') || content.includes('返回'),
      hasNavigation: content.includes('nav-') || content.includes('tools.html'),
      
      // Basic functionality checks
      pageSize: content.length,
      scriptCount: (content.match(/<script/g) || []).length,
      hasI18n: content.includes('i18n.js') || content.includes('DROPSHARE_I18N')
    };
    
    return analysis;
  } catch (error) {
    return { error: error.message };
  }
}

// Function to check if page is accessible
function checkPageAccessibility(file) {
  const filePath = path.join(publicDir, file);
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

console.log('🔍 DROPSHARE FUNCTIONALITY AUDIT');
console.log('='.repeat(60));
console.log('Checking all tool pages for core functionality...\n');

let totalPages = 0;
let workingPages = 0;
let issuesFound = [];

for (const [category, { pages }] of Object.entries(toolCategories)) {
  console.log(`📁 ${category.toUpperCase()}`);
  console.log('-'.repeat(50));
  
  for (const tool of pages) {
    totalPages++;
    const filePath = path.join(publicDir, tool.file);
    
    if (!checkPageAccessibility(tool.file)) {
      console.log(`  ❌ ${tool.name.padEnd(25)} - File missing or empty`);
      issuesFound.push(`${tool.name}: File missing or empty`);
      continue;
    }
    
    const analysis = analyzePage(filePath);
    
    if (analysis.error) {
      console.log(`  ❌ ${tool.name.padEnd(25)} - Error reading file`);
      issuesFound.push(`${tool.name}: Error reading file - ${analysis.error}`);
      continue;
    }
    
    // Score the functionality
    let score = 0;
    let maxScore = 8;
    let issues = [];
    
    if (analysis.hasFileInput) score++; else issues.push('no file input');
    if (analysis.hasDragDrop) score++; else issues.push('no drag&drop');
    if (analysis.hasProcessingLogic) score++; else issues.push('no processing logic');
    if (analysis.hasDownloadFunction) score++; else issues.push('no download');
    if (analysis.hasShareIntegration) score++; else issues.push('no share integration');
    if (analysis.hasErrorHandling) score++; else issues.push('no error handling');
    if (analysis.hasProgressIndicator) score++; else issues.push('no progress indicator');
    if (analysis.hasI18n) score++; else issues.push('no i18n');
    
    const percentage = Math.round((score / maxScore) * 100);
    
    if (percentage >= 75) {
      console.log(`  ✅ ${tool.name.padEnd(25)} - ${percentage}% functionality`);
      workingPages++;
    } else if (percentage >= 50) {
      console.log(`  ⚠️  ${tool.name.padEnd(25)} - ${percentage}% functionality (${issues.slice(0,2).join(', ')})`);
      issuesFound.push(`${tool.name}: Partial functionality - ${issues.join(', ')}`);
    } else {
      console.log(`  ❌ ${tool.name.padEnd(25)} - ${percentage}% functionality (${issues.slice(0,3).join(', ')})`);
      issuesFound.push(`${tool.name}: Low functionality - ${issues.join(', ')}`);
    }
  }
  console.log('');
}

console.log('📊 FUNCTIONALITY SUMMARY');
console.log('='.repeat(40));
console.log(`✅ Working pages: ${workingPages}/${totalPages} (${Math.round((workingPages/totalPages)*100)}%)`);
console.log(`⚠️  Issues found: ${issuesFound.length}`);

if (issuesFound.length > 0) {
  console.log('\n🔧 ISSUES TO FIX:');
  console.log('-'.repeat(30));
  issuesFound.forEach((issue, i) => {
    console.log(`${i+1}. ${issue}`);
  });
}

console.log('\n🎯 NEXT STEPS:');
console.log('-'.repeat(20));
console.log('1. Test file upload functionality on sample pages');
console.log('2. Verify processing libraries (FFmpeg, PDF-lib, etc.)');
console.log('3. Test share/transfer integration');
console.log('4. Check error handling with invalid files');
console.log('5. Verify download functionality');