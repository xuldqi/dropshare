// Theme redirect for dual-version pages (dark/light)
(function(){
  // 立即执行，防止闪屏
  // 添加一个预加载样式，在文档渲染前应用正确的背景色
  function applyPreloadTheme() {
    // 获取用户本地存储的主题偏好
    const savedTheme = localStorage.getItem('theme');
    let preferredTheme;
    
    // 如果已明确设置了主题
    if (savedTheme === 'dark') {
      preferredTheme = 'dark';
    } else if (savedTheme === 'light') {
      preferredTheme = 'light';
    } else {
      // 否则，使用系统偏好
      preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // 立即应用主题类到HTML元素，防止闪屏
    document.documentElement.setAttribute('data-theme', preferredTheme);
    
    // 应用主题颜色
    if (preferredTheme === 'dark') {
      document.documentElement.style.backgroundColor = '#121212';
      document.documentElement.style.color = '#eee';
      // 等DOM加载后再设置body
      if (document.body) {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#eee';
      }
    } else {
      document.documentElement.style.backgroundColor = '#f5f5f5';
      document.documentElement.style.color = '#333';
      // 等DOM加载后再设置body
      if (document.body) {
        document.body.style.backgroundColor = '#f5f5f5';
        document.body.style.color = '#333';
      }
    }
  }
  
  // 在页面解析阶段就立即应用预加载主题
  applyPreloadTheme();
  
  // 配置：设置哪些页面有暗/亮两个版本
  const dualVersionPages = [
    'index.html',
    'about.html',
    'blog.html',
    'faq.html',
    'privacy.html',
    'terms.html'
  ];

  // 当前页面路径
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';
  
  // 检查当前URL是否包含主题指示符
  const isDarkVersion = currentPath.includes('-dark') || currentPath.includes('/dark/');
  const isLightVersion = currentPath.includes('-light') || currentPath.includes('/light/');
  
  // 判断是否是需要双版本的页面
  const isDualVersionPage = dualVersionPages.some(page => {
    return currentPage === page || 
           currentPage === page.replace('.html', '-dark.html') || 
           currentPage === page.replace('.html', '-light.html');
  });
  
  // 如果不是双版本页面，则不处理
  if (!isDualVersionPage) return;
  
  // 根据本地存储的主题或系统偏好决定应该使用哪个版本
  function determineThemeVersion() {
    // 获取用户本地存储的主题偏好
    const savedTheme = localStorage.getItem('theme');
    
    // 如果已明确设置了主题
    if (savedTheme === 'dark') return 'dark';
    if (savedTheme === 'light') return 'light';
    
    // 否则，使用系统偏好
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  // 根据当前路径和所需主题生成目标URL
  function getTargetUrl(currentPath, targetTheme) {
    // 提取基本页面名称（移除主题后缀）
    let basePage = currentPage;
    if (isDarkVersion) {
      basePage = currentPage.replace('-dark.html', '.html');
    } else if (isLightVersion) {
      basePage = currentPage.replace('-light.html', '.html');
    }
    
    // 如果当前页面不是主页，并且没有主题后缀，则使用基本名称
    if (basePage === currentPage && basePage !== 'index.html') {
      // 去掉.html后缀
      basePage = basePage.replace('.html', '');
    }
    
    // 构建新的URL路径
    let newPath;
    if (targetTheme === 'dark') {
      newPath = basePage === 'index' ? '/dark/' : `/${basePage}-dark.html`;
    } else {
      newPath = basePage === 'index' ? '/light/' : `/${basePage}-light.html`;
    }
    
    return newPath;
  }
  
  // 设置主题切换按钮的点击事件
  document.addEventListener('DOMContentLoaded', function() {
    const btnTheme = document.getElementById('theme');
    if (btnTheme) {
      btnTheme.addEventListener('click', function() {
        // 确定当前页面是深色还是浅色版本
        const currentTheme = isDarkVersion ? 'dark' : 'light';
        // 切换到相反的主题
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // 保存新的主题设置到本地存储
        localStorage.setItem('theme', targetTheme);
        
        // 获取目标URL并跳转
        const targetUrl = getTargetUrl(currentPath, targetTheme);
        
        // 直接跳转，不使用遮罩层
        window.location.href = targetUrl;
      });
    }
  });
  
  // 暂时禁用自动重定向，让用户看到新设计
  function redirectToCorrectVersion() {
    // 重定向功能已禁用
    console.log('Theme redirect disabled to show new design');
    return;
  }
  
  // 重定向功能已禁用
  // window.addEventListener('load', redirectToCorrectVersion);
})(); 