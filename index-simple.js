// 简化版服务器 - 用于诊断崩溃问题
var process = require('process')

// 增强的错误处理
process.on('uncaughtException', (error, origin) => {
    console.log('========== 捕获到异常 ==========')
    console.log('时间:', new Date().toISOString())
    console.log('错误:', error.message)
    console.log('堆栈:', error.stack)
    console.log('来源:', origin)
    console.log('内存使用:', process.memoryUsage())
    console.log('==============================')
    // 不退出，继续运行
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('========== 未处理的Promise拒绝 ==========')
    console.log('时间:', new Date().toISOString())
    console.log('原因:', reason)
    console.log('Promise:', promise)
    console.log('==============================')
})

const express = require('express');
const http = require('http');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));

app.use(function(req, res) {
    res.redirect('/');
});

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
    console.log('简化服务器启动成功！');
    console.log('端口:', port);
    console.log('时间:', new Date().toISOString());
});

// 最简单的WebSocket服务器
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

let connectionCount = 0;
let totalConnections = 0;

wss.on('connection', function connection(ws, req) {
    connectionCount++;
    totalConnections++;
    
    const clientId = `client_${totalConnections}`;
    console.log(`新连接: ${clientId} (当前: ${connectionCount})`);
    
    ws.on('message', function incoming(message) {
        try {
            console.log(`收到消息 ${clientId}:`, message.toString().substring(0, 100));
        } catch (e) {
            console.log('消息处理错误:', e.message);
        }
    });

    ws.on('close', function close() {
        connectionCount--;
        console.log(`连接关闭: ${clientId} (剩余: ${connectionCount})`);
    });

    ws.on('error', function error(err) {
        console.log(`WebSocket错误 ${clientId}:`, err.message);
    });

    // 发送欢迎消息
    try {
        ws.send(JSON.stringify({
            type: 'welcome',
            clientId: clientId,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.log('发送欢迎消息失败:', e.message);
    }
});

// 每分钟输出状态
setInterval(() => {
    console.log(`状态检查 - 当前连接: ${connectionCount}, 总连接: ${totalConnections}, 内存: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 60000);

console.log('简化版DropShare服务器已启动，开始监控...');