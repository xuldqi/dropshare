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
    document.body.classList.toggle('dark-theme');
  // Otherwise, if the user's preference in localStorage is light...
  } else if (currentTheme == 'light') {
    // ...let's toggle the .light-theme class on the body
    document.body.classList.toggle('light-theme');
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
    
    // If the user's OS setting is dark and matches our .dark-theme class...
    if (prefersDarkScheme.matches) {
      // ...then toggle the light mode class
      document.body.classList.toggle('light-theme');
      // ...but use .dark-theme if the .light-theme class is already on the body,
      var theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    } else {
      // Otherwise, let's do the same thing, but for .dark-theme
      document.body.classList.toggle('dark-theme');
      var theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    }
    
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