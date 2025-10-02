// Debug script to test room functionality
const WebSocket = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔍 DropShare Room Debug Tool\n');

// Function to create a test client
function createClient(clientId, roomCode) {
    const ws = new WebSocket('ws://127.0.0.1:8001');
    
    ws.on('open', () => {
        console.log(`✅ Client ${clientId} connected to WebSocket`);
        
        // Wait a bit for the display-name message
        setTimeout(() => {
            // Join the room
            const joinMsg = {
                type: 'join-room',
                roomCode: roomCode,
                password: undefined
            };
            
            console.log(`📤 Client ${clientId} sending join-room for ${roomCode}`);
            ws.send(JSON.stringify(joinMsg));
        }, 500);
    });
    
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log(`📥 Client ${clientId} received:`, msg.type);
            
            if (msg.type === 'room-joined') {
                console.log(`✅ Client ${clientId} joined room successfully`);
                console.log(`   Members in room: ${msg.members ? msg.members.length : 0}`);
                if (msg.members) {
                    msg.members.forEach(m => {
                        console.log(`   - ${m.displayName} (${m.deviceName})`);
                    });
                }
                
                // Send a test file after joining
                setTimeout(() => {
                    const fileMsg = {
                        type: 'room-file-shared',
                        roomCode: roomCode,
                        fileInfo: {
                            id: `file-${clientId}-${Date.now()}`,
                            name: `test-file-${clientId}.txt`,
                            size: 100,
                            type: 'text/plain',
                            uploader: `Client ${clientId}`,
                            uploadTime: Date.now()
                        },
                        fileData: Buffer.from(`Test data from client ${clientId}`).toString('base64')
                    };
                    
                    console.log(`📤 Client ${clientId} sharing file in room`);
                    ws.send(JSON.stringify(fileMsg));
                }, 1000);
            } else if (msg.type === 'room-file-shared') {
                console.log(`📁 Client ${clientId} received file: ${msg.fileInfo.name} from ${msg.fileInfo.uploader}`);
            } else if (msg.type === 'room-member-joined') {
                console.log(`👥 Client ${clientId}: New member joined - ${msg.member.displayName}`);
            } else if (msg.type === 'display-name') {
                console.log(`🏷️ Client ${clientId} assigned name: ${msg.message.displayName}`);
            } else if (msg.type === 'room-error') {
                console.log(`❌ Client ${clientId} room error: ${msg.error}`);
            }
        } catch (e) {
            console.error(`Error parsing message for client ${clientId}:`, e);
        }
    });
    
    ws.on('error', (error) => {
        console.error(`❌ Client ${clientId} WebSocket error:`, error.message);
    });
    
    ws.on('close', () => {
        console.log(`👋 Client ${clientId} disconnected`);
    });
    
    return ws;
}

// Function to create a room first
function createRoom(roomCode, callback) {
    const ws = new WebSocket('ws://localhost:8001');
    
    ws.on('open', () => {
        console.log('🏠 Creating room...');
        
        setTimeout(() => {
            const createMsg = {
                type: 'create-room',
                roomSettings: {
                    code: roomCode,
                    name: `Test Room ${roomCode}`,
                    password: undefined,
                    maxMembers: 10,
                    isPrivate: false
                }
            };
            
            ws.send(JSON.stringify(createMsg));
        }, 500);
    });
    
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'room-created') {
            console.log(`✅ Room ${roomCode} created successfully`);
            callback(ws);
        } else if (msg.type === 'room-error') {
            console.log(`❌ Room creation error: ${msg.error}`);
            ws.close();
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ Room creation WebSocket error:', error.message);
    });
    
    return ws;
}

// Main test flow
function runTest() {
    rl.question('Enter room code to test (or press Enter for T066KIB8): ', (roomCode) => {
        roomCode = roomCode.trim() || 'T066KIB8';
        console.log(`\n🔧 Testing room: ${roomCode}\n`);
        
        // First create the room
        const hostClient = createRoom(roomCode, (hostWs) => {
            console.log('\n📡 Room ready, creating test clients...\n');
            
            // Create multiple clients
            setTimeout(() => {
                const client1 = createClient('Client-1', roomCode);
                
                setTimeout(() => {
                    const client2 = createClient('Client-2', roomCode);
                    
                    // Keep the test running for a while
                    setTimeout(() => {
                        console.log('\n✅ Test complete. Press Ctrl+C to exit.');
                    }, 10000);
                }, 2000);
            }, 1000);
        });
    });
}

// Check if server is running first
const testWs = new WebSocket('ws://localhost:8001');
testWs.on('error', () => {
    console.error('❌ Cannot connect to server at ws://localhost:8001');
    console.log('Please make sure the DropShare server is running.');
    process.exit(1);
});
testWs.on('open', () => {
    console.log('✅ Server is running at ws://localhost:8001\n');
    testWs.close();
    runTest();
});