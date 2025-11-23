// 在DropShare网站上运行此脚本来检测服务器地址
// 打开浏览器控制台（F12），粘贴并运行

(function() {
  console.log('='.repeat(60));
  console.log('🔍 DropShare服务器地址检测工具');
  console.log('='.repeat(60));
  
  // 检测当前网站的WebSocket地址
  const protocol = location.protocol.startsWith('https') ? 'wss' : 'ws';
  const host = location.host;
  const wsUrl = `${protocol}://${host}/server/webrtc`;
  
  console.log('📍 当前网站地址:', location.href);
  console.log('🌐 协议:', location.protocol);
  console.log('🖥️  主机:', host);
  console.log('');
  console.log('✅ 你的DropShare服务器WebSocket地址:');
  console.log('');
  console.log('   ' + wsUrl);
  console.log('');
  console.log('📋 请复制这个地址到Chrome扩展的设置中');
  console.log('='.repeat(60));
  
  // 测试连接
  console.log('🧪 测试WebSocket连接...');
  try {
    const testWs = new WebSocket(wsUrl);
    
    testWs.onopen = () => {
      console.log('✅ WebSocket连接测试成功！');
      console.log('✅ 服务器地址正确，可以在扩展中使用');
      testWs.close();
    };
    
    testWs.onerror = (error) => {
      console.log('⚠️  WebSocket连接测试失败');
      console.log('   这可能是因为：');
      console.log('   1. 服务器未运行');
      console.log('   2. WebSocket路径不正确');
      console.log('   3. 防火墙阻止了连接');
      console.log('   请检查服务器状态');
    };
    
    testWs.onclose = () => {
      console.log('🔌 测试连接已关闭');
    };
    
    // 5秒超时
    setTimeout(() => {
      if (testWs.readyState === WebSocket.CONNECTING) {
        testWs.close();
        console.log('⏱️  连接超时（5秒）');
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ 无法创建WebSocket连接:', error);
  }
})();


