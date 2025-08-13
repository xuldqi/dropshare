/**
 * 构建深色和浅色主题版本的页面
 * 这个脚本会为每个页面创建-dark和-light后缀的版本
 */

const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// 配置：设置哪些页面需要生成深色和浅色版本
const pages = [
  'index.html',
  'about.html',
  'blog.html',
  'faq.html',
  'privacy.html',
  'terms.html'
];

// 源目录和目标目录
const sourceDir = path.join(__dirname, 'public');
const outputDir = path.join(__dirname, 'public');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 创建dark和light子目录（用于index.html的特殊情况）
const darkDir = path.join(outputDir, 'dark');
const lightDir = path.join(outputDir, 'light');

if (!fs.existsSync(darkDir)) {
  fs.mkdirSync(darkDir, { recursive: true });
}

if (!fs.existsSync(lightDir)) {
  fs.mkdirSync(lightDir, { recursive: true });
}

// 创建专门用于防止闪屏的CSS文件
const createNoFlashCss = () => {
  // 深色模式的CSS
  const darkCss = `
    html {
      background-color: #121212;
      color: #eee;
      visibility: visible;
    }
    body {
      background-color: #121212;
      color: #eee;
      visibility: visible;
    }
  `;
  
  // 浅色模式的CSS
  const lightCss = `
    html {
      background-color: #f5f5f5;
      color: #333;
      visibility: visible;
    }
    body {
      background-color: #f5f5f5;
      color: #333;
      visibility: visible;
    }
  `;
  
  // 写入文件
  fs.writeFileSync(path.join(outputDir, 'noflash-dark.css'), darkCss);
  fs.writeFileSync(path.join(outputDir, 'noflash-light.css'), lightCss);
  
  console.log('已创建防闪屏CSS文件');
};

// 创建防闪屏CSS
createNoFlashCss();

// 处理每个页面
pages.forEach(page => {
  const sourceFile = path.join(sourceDir, page);
  
  // 确保源文件存在
  if (!fs.existsSync(sourceFile)) {
    console.error(`源文件不存在: ${sourceFile}`);
    return;
  }
  
  // 读取源HTML
  const html = fs.readFileSync(sourceFile, 'utf8');
  
  // 创建深色版和浅色版
  createDarkVersion(page, html);
  createLightVersion(page, html);
});

/**
 * 创建深色版本的页面
 */
function createDarkVersion(pageName, html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // 添加深色主题类
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.classList.add('dark-theme');
  document.body.classList.remove('light-theme');
  
  // 更改主题图标为月亮图标
  const themeButton = document.getElementById('theme');
  if (themeButton) {
    const useElement = themeButton.querySelector('use');
    if (useElement) {
      useElement.setAttribute('xlink:href', '#icon-theme');
    }
  }
  
  // 添加预加载防闪屏的内联样式到head
  const inlineStyle = document.createElement('style');
  inlineStyle.innerHTML = `
    html, body {
      background-color: #121212 !important;
      color: #eee !important;
    }
  `;
  document.head.insertBefore(inlineStyle, document.head.firstChild);
  
  // 添加防闪屏CSS链接，放在首位
  const noFlashLink = document.createElement('link');
  noFlashLink.rel = 'stylesheet';
  noFlashLink.href = '/noflash-dark.css';
  document.head.insertBefore(noFlashLink, document.head.firstChild);
  
  // 添加预加载主题的内联脚本到head标签，防止闪屏
  const preloadScript = document.createElement('script');
  preloadScript.innerHTML = `
    // 预加载主题设置，防止闪屏
    (function() {
      // 首先设置根元素背景颜色，确保没有白色闪烁
      document.documentElement.style.backgroundColor = '#121212';
      document.documentElement.style.color = '#eee';
      
      // 确保body也设置正确的样式
      function setBodyStyle() {
        if (document.body) {
          document.body.style.backgroundColor = '#121212';
          document.body.style.color = '#eee';
        } else {
          setTimeout(setBodyStyle, 0);
        }
      }
      setBodyStyle();
    })();
  `;
  document.head.insertBefore(preloadScript, document.head.firstChild);
  
  // 更新所有链接，确保它们指向正确的主题版本
  updateLinks(document, 'dark');
  
  // 保存到文件
  const outputFile = path.join(outputDir, pageName.replace('.html', '-dark.html'));
  fs.writeFileSync(outputFile, dom.serialize());
  
  console.log(`已创建深色版本: ${outputFile}`);
}

/**
 * 创建浅色版本的页面
 */
function createLightVersion(pageName, html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // 添加浅色主题类
  document.documentElement.setAttribute('data-theme', 'light');
  document.body.classList.add('light-theme');
  document.body.classList.remove('dark-theme');
  
  // 更改主题图标为太阳图标
  const themeButton = document.getElementById('theme');
  if (themeButton) {
    const useElement = themeButton.querySelector('use');
    if (useElement) {
      useElement.setAttribute('xlink:href', '#icon-sun');
    }
  }
  
  // 添加预加载防闪屏的内联样式到head
  const inlineStyle = document.createElement('style');
  inlineStyle.innerHTML = `
    html, body {
      background-color: #f5f5f5 !important;
      color: #333 !important;
      visibility: visible !important;
    }
  `;
  document.head.insertBefore(inlineStyle, document.head.firstChild);
  
  // 添加防闪屏CSS链接，放在首位
  const noFlashLink = document.createElement('link');
  noFlashLink.rel = 'stylesheet';
  noFlashLink.href = '/noflash-light.css';
  document.head.insertBefore(noFlashLink, document.head.firstChild);
  
  // 添加预加载主题的内联脚本到head标签，防止闪屏
  const preloadScript = document.createElement('script');
  preloadScript.innerHTML = `
    // 预加载主题设置，防止闪屏
    (function() {
      document.documentElement.style.backgroundColor = '#f5f5f5';
      document.documentElement.style.color = '#333';
      document.documentElement.style.visibility = 'visible';
      
      // 确保body也设置正确的样式
      function setBodyStyle() {
        if (document.body) {
          document.body.style.backgroundColor = '#f5f5f5';
          document.body.style.color = '#333';
          document.body.style.visibility = 'visible';
        } else {
          setTimeout(setBodyStyle, 0);
        }
      }
      setBodyStyle();
    })();
  `;
  document.head.insertBefore(preloadScript, document.head.firstChild);
  
  // 添加theme-redirect.js脚本
  const themeRedirectScript = document.createElement('script');
  themeRedirectScript.src = '/scripts/theme-redirect.js';
  document.body.appendChild(themeRedirectScript);
  
  // 输出文件路径
  let outputFile;
  if (pageName === 'index.html') {
    outputFile = path.join(lightDir, 'index.html');
    
    // 更新所有链接，添加主题后缀
    updateLinks(document, 'light');
  } else {
    const baseName = pageName.replace('.html', '');
    outputFile = path.join(outputDir, `${baseName}-light.html`);
  }
  
  // 写入文件
  fs.writeFileSync(outputFile, dom.serialize(), 'utf8');
  console.log(`已创建浅色版: ${outputFile}`);
}

/**
 * 更新页面中的链接，添加主题后缀
 */
function updateLinks(document, theme) {
  // 获取所有链接
  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // 跳过外部链接和带#的链接
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }
    
    // 处理内部页面链接
    pages.forEach(page => {
      if (page === 'index.html') {
        if (href === '/' || href === '/index.html') {
          link.setAttribute('href', theme === 'dark' ? '/dark/' : '/light/');
        }
      } else {
        const baseName = page.replace('.html', '');
        if (href === `/${page}` || href === `/${baseName}.html` || href === `/${baseName}`) {
          link.setAttribute('href', `/${baseName}-${theme}.html`);
        }
      }
    });
  });
}

console.log('所有主题版本页面已生成完成！'); 