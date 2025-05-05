// Firebase Analytics 配置和初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保Firebase SDK已加载
    if (typeof firebase !== 'undefined') {
        // Firebase配置 - 从Firebase控制台获取
        const firebaseConfig = {
            apiKey: "AIzaSyC6miCSMW_0z5ryRGVeGLkkcOoT23wIZnY",
            authDomain: "hulahulahu-c756f.firebaseapp.com",
            projectId: "hulahulahu-c756f",
            storageBucket: "hulahulahu-c756f.firebasestorage.app",
            messagingSenderId: "420550820136",
            appId: "1:420550820136:web:bfc44558a74a48dc23501d",
            measurementId: "G-YD0JRFHQ0Z"
        };

        // 初始化Firebase
        firebase.initializeApp(firebaseConfig);
        
        // 初始化Analytics
        const analytics = firebase.analytics();
        
        // 记录页面访问
        analytics.logEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });

        // 跟踪文件发送事件
        window.trackFileSent = function(fileType, fileSize) {
            analytics.logEvent('file_sent', {
                file_type: fileType,
                file_size: fileSize
            });
        };

        // 跟踪文件接收事件
        window.trackFileReceived = function(fileType, fileSize) {
            analytics.logEvent('file_received', {
                file_type: fileType,
                file_size: fileSize
            });
        };

        console.log('Firebase Analytics initialized successfully');
    } else {
        console.error('Firebase SDK not loaded');
    }
}); 