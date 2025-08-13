// Theme management for secondary pages (About, FAQ, Blog, Privacy, Terms)
(function(){
  // 检查当前页面URL
  const currentPage = window.location.pathname;
  const excludedPages = ['/about.html', '/blog.html', '/faq.html', '/privacy.html', '/terms.html'];
  const isMainPage = !excludedPages.includes(currentPage);
  
  // Select the theme button or create one if it doesn't exist and is not an excluded page
  let btnTheme = document.getElementById('theme');
  
  // If no theme button exists and we're not on an excluded page, let's create one
  if (!btnTheme && isMainPage) {
    // Create theme toggle button
    btnTheme = document.createElement('a');
    btnTheme.id = 'theme';
    btnTheme.className = 'icon-button';
    btnTheme.title = 'Switch Darkmode/Lightmode';
    btnTheme.innerHTML = `
      <svg class="icon">
        <use xlink:href="#icon-theme" />
      </svg>
    `;
    
    // Add the button to the header after the back button
    const header = document.querySelector('header');
    if (header) {
      const firstChild = header.querySelector('.icon-button');
      if (firstChild) {
        header.insertBefore(btnTheme, firstChild.nextSibling);
      } else {
        header.appendChild(btnTheme);
      }
    }
    
    // Add SVG definitions if they don't exist
    if (!document.querySelector('symbol#icon-theme') && !document.querySelector('symbol#icon-sun')) {
      const svgDefs = document.createElement('svg');
      svgDefs.style.display = 'none';
      svgDefs.innerHTML = `
        <symbol id="icon-theme" viewBox="0 0 24 24"><rect fill="none" height="24" width="24"/><path d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36c-0.98,1.37-2.58,2.26-4.4,2.26 c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"/></symbol>
        <symbol id="icon-sun" viewBox="0 0 24 24"><rect fill="none" height="24" width="24"/><path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 S11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0 s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" /></symbol>
      `;
      document.body.appendChild(svgDefs);
    }
  }
  
  // Check for dark mode preference at the OS level
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Function to update the theme icon based on current theme
  function updateThemeIcon(theme) {
    if (!btnTheme) return;
    
    const useElement = btnTheme.querySelector('use');
    if (useElement) {
      if (theme === 'dark') {
        // Use moon icon
        useElement.setAttribute('xlink:href', '#icon-theme');
      } else {
        // Use sun icon
        useElement.setAttribute('xlink:href', '#icon-sun');
      }
    }
  }
  
  // Function to add CSS to support dark/light mode
  function addThemeStyles() {
    const style = document.createElement('style');
    style.textContent = `
      body.dark-theme {
        --text-color: #eee;
        --bg-color: #121212;
        --bg-color-secondary: #333;
        color: var(--text-color);
        background-color: var(--bg-color);
        transition: background-color 0.5s ease;
      }
      
      body.light-theme {
        --text-color: #333;
        --bg-color: #f5f5f5;
        --bg-color-secondary: #f1f3f4;
        color: var(--text-color);
        background-color: var(--bg-color);
        transition: background-color 0.5s ease;
      }
      
      /* Override hardcoded colors in about.html and other pages */
      body.light-theme {
        background: var(--bg-color);
      }
      
      body.light-theme .header-wrapper {
        background-color: var(--bg-color);
        border-bottom: 1px solid #ddd;
      }
      
      body.light-theme footer {
        background-color: var(--bg-color);
        border-top: 1px solid #ddd;
      }
      
      body.light-theme .feature-box {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      body.light-theme #language-selector {
        background-color: rgba(0, 0, 0, 0.1);
        color: #333;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }
      
      body.light-theme h1, 
      body.light-theme h2, 
      body.light-theme h3 {
        color: #3367d6;
      }
      
      body.light-theme a {
        color: #3367d6;
      }
      
      body.light-theme .icon-button svg {
        fill: #333;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add theme styles
  addThemeStyles();
  
  // Get the user's theme preference from local storage
  const currentTheme = localStorage.getItem('theme');
  
  // Apply the theme based on saved preference or OS default
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    updateThemeIcon('dark');
  } else if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    updateThemeIcon('light');
  } else {
    // If no theme is saved, use OS preference
    if (prefersDarkScheme.matches) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    updateThemeIcon(prefersDarkScheme.matches ? 'dark' : 'light');
  }
  
  // 处理背景动画
  function initBackgroundAnimation() {
    const bgAnimation = document.querySelector('.background-animation');
    if (!bgAnimation) return;
    
    // 获取当前主题
    const isDarkTheme = document.body.classList.contains('dark-theme') || 
                       (!document.body.classList.contains('light-theme') && 
                        window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    // 根据主题设置背景色
    if (isDarkTheme) {
      bgAnimation.style.background = '#121212';
    } else {
      bgAnimation.style.background = '#f5f5f5';
    }
    
    // 立即设置不透明度为1，避免闪烁
    bgAnimation.style.opacity = '1';
  }
  
  // 初始化背景动画
  initBackgroundAnimation();
  
  // Listen for a click on the theme button
  if (btnTheme) {
    btnTheme.addEventListener('click', function() {
      // Toggle between dark and light mode
      let theme;
      
      if (document.body.classList.contains('dark-theme')) {
        // Switch to light mode
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        theme = 'light';
      } else {
        // Switch to dark mode
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        theme = 'dark';
      }
      
      // Update the theme icon
      updateThemeIcon(theme);
      
      // 更新背景动画颜色
      initBackgroundAnimation();
      
      // Save the current preference to localStorage
      localStorage.setItem('theme', theme);
    });
  }
})(); 