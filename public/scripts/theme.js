(function(){
  
  // Select the button
  const btnTheme = document.getElementById('theme');
  // Check for dark mode preference at the OS level
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Get the user's theme preference from local storage, if it's available
  const currentTheme = localStorage.getItem('theme');
  // If the user's preference in localStorage is dark...
  if (currentTheme == 'dark') {
    // ...let's toggle the .dark-theme class on the body
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    // Set moon icon
    updateThemeIcon('dark');
  // Otherwise, if the user's preference in localStorage is light...
  } else if (currentTheme == 'light') {
    // ...let's toggle the .light-theme class on the body
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    // Set sun icon
    updateThemeIcon('light');
  } else {
    // If no theme is set, use the OS default and set the appropriate icon
    if (prefersDarkScheme.matches) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
    updateThemeIcon(prefersDarkScheme.matches ? 'dark' : 'light');
  }
  
  // Function to update the theme icon based on current theme
  function updateThemeIcon(theme) {
    const useElement = btnTheme.querySelector('use');
    if (theme === 'dark') {
      // Use moon icon
      useElement.setAttribute('xlink:href', '#icon-theme');
    } else {
      // Use sun icon
      useElement.setAttribute('xlink:href', '#icon-sun');
    }
  }
  
  // 初始化背景动画
  const bgAnimation = document.querySelector('.background-animation');
  if (bgAnimation) {
    bgAnimation.classList.add('animate');
    
    // 检测设备性能，如果是低端设备，则不显示动画
    if ('connection' in navigator && (navigator.connection.saveData || navigator.connection.effectiveType === '2g')) {
      bgAnimation.style.display = 'none';
    }
  }
  
  // Listen for a click on the button 
  btnTheme.addEventListener('click', function() {
    // 切换主题时添加过渡效果
    document.body.style.transition = 'background-color 0.5s ease';
    
    let theme;
    // If currently in dark mode
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
    
    // 主题切换时重新触发背景动画
    if (bgAnimation) {
      bgAnimation.classList.remove('animate');
      setTimeout(() => {
        bgAnimation.classList.add('animate');
      }, 10);
    }
    
    // Finally, let's save the current preference to localStorage to keep using it
    localStorage.setItem('theme', theme);
    
    // 通知用户主题已切换
    const event = new CustomEvent('notify', {detail: `Switched to ${theme} theme`});
    document.dispatchEvent(event);
  });

})();