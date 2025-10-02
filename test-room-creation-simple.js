const WebSocket = require('ws');

// 测试房间创建功能
function testRoomCreation() {
    console.log('🧪 开始测试房间创建功能...');
    
    const ws = new WebSocket('ws://localhost:8081');
    
    ws.on('open', () => {
        console.log('✅ WebSocket 连接已建立');
        
        // 等待一下再发送消息
        setTimeout(() => {
            const roomData = {
                type: 'create-room',
                roomSettings: {
                    code: '1234',
                    name: '测试房间',
                    password: undefined,
                    maxMembers: 4,
                    isPrivate: false
                },
                userInfo: {
                    displayName: '测试用户',
                    deviceName: '测试设备'
                }
            };
            
            console.log('📤 发送房间创建请求:', JSON.stringify(roomData, null, 2));
            ws.send(JSON.stringify(roomData));
        }, 1000);
    });
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📨 收到服务器消息:', JSON.stringify(message, null, 2));
            
            if (message.type === 'room-created') {
                console.log('🎉 房间创建成功!');
                console.log(`房间代码: ${message.room.code}`);
                console.log(`房间名称: ${message.room.name}`);
                ws.close();
            } else if (message.type === 'room-error') {
                console.log('❌ 房间创建失败:', message.error);
                ws.close();
            }
        } catch (error) {
            console.log('📨 收到非JSON消息:', data.toString());
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket 错误:', error.message);
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket 连接已关闭');
    });
    
    // 10秒后超时
    setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
            console.log('⏰ 测试超时，关闭连接');
            ws.close();
        }
    }, 10000);
}

// 运行测试
testRoomCreation();