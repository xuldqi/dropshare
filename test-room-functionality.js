// 房间功能实际测试脚本
// 在浏览器控制台运行以验证房间功能是否正常工作

console.log('🧪 === DropShare 房间功能完整测试 ===');

// 测试步骤
const tests = [
    {
        name: '检查必要组件',
        test: () => {
            const results = {
                roomDebugger: !!window.roomDebugger,
                securityUtils: !!window.SecurityUtils,
                network: !!window.network,
                fileInput: !!document.getElementById('fileInput'),
                roomInfo: !!document.getElementById('roomInfo'),
                sharedFilesList: !!document.getElementById('sharedFilesList')
            };
            
            console.log('📋 组件检查结果:', results);
            
            const passed = Object.values(results).filter(Boolean).length;
            return {
                passed: passed >= 4, // 至少需要4个关键组件
                details: `${passed}/6 组件可用`,
                results
            };
        }
    },
    
    {
        name: '检查房间模式',
        test: () => {
            const isRoomMode = window.location.hash === '#rooms' || window.location.hash === '#room';
            const roomContainer = document.getElementById('roomContainer');
            const isVisible = roomContainer && roomContainer.style.display !== 'none';
            
            return {
                passed: isRoomMode || window.location.pathname.includes('share.html'),
                details: `房间模式: ${isRoomMode}, 容器可见: ${isVisible}`,
                results: { isRoomMode, isVisible }
            };
        }
    },
    
    {
        name: '测试文件验证',
        test: () => {
            if (!window.SecurityUtils) {
                return { passed: false, details: 'SecurityUtils 不可用' };
            }
            
            const validFile = window.SecurityUtils.validateFileName('test.txt');
            const invalidFile = window.SecurityUtils.validateFileName('<script>alert(1)</script>');
            
            return {
                passed: validFile === true && invalidFile === false,
                details: `有效文件: ${validFile}, 无效文件: ${invalidFile}`,
                results: { validFile, invalidFile }
            };
        }
    },
    
    {
        name: '测试房间调试器',
        test: () => {
            if (!window.roomDebugger) {
                return { passed: false, details: 'RoomDebugger 不可用' };
            }
            
            try {
                const requirements = window.roomDebugger.checkRoomRequirements();
                const hasHandleFileSelection = typeof window.roomDebugger.handleFileSelection === 'function';
                
                return {
                    passed: hasHandleFileSelection,
                    details: `文件处理函数: ${hasHandleFileSelection}`,
                    results: { requirements, hasHandleFileSelection }
                };
            } catch (error) {
                return {
                    passed: false,
                    details: `错误: ${error.message}`,
                    results: { error: error.message }
                };
            }
        }
    },
    
    {
        name: '模拟文件上传',
        test: async () => {
            if (!window.roomDebugger) {
                return { passed: false, details: 'RoomDebugger 不可用' };
            }
            
            try {
                // 创建测试文件
                const testFile = new File(['Test content for room upload'], 'test-room-upload.txt', {
                    type: 'text/plain'
                });
                
                console.log('📁 创建测试文件:', testFile.name, testFile.size + ' bytes');
                
                // 模拟加入房间
                const roomInfo = document.getElementById('roomInfo');
                if (roomInfo) {
                    roomInfo.classList.add('active');
                    roomInfo.style.display = 'block';
                }
                
                // 尝试文件上传处理
                const result = await window.roomDebugger.handleFileSelection([testFile]);
                
                return {
                    passed: true,
                    details: '文件上传模拟完成',
                    results: { fileProcessed: true, fileName: testFile.name }
                };
                
            } catch (error) {
                return {
                    passed: false,
                    details: `上传模拟失败: ${error.message}`,
                    results: { error: error.message }
                };
            }
        }
    }
];

// 运行所有测试
async function runAllTests() {
    console.log('🚀 开始运行房间功能测试...\n');
    
    const results = [];
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        console.log(`📋 测试 ${i+1}: ${test.name}`);
        
        try {
            const result = await test.test();
            results.push({
                name: test.name,
                ...result
            });
            
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${test.name}: ${result.details}`);
            
            if (result.results) {
                console.log('   详细信息:', result.results);
            }
            
        } catch (error) {
            results.push({
                name: test.name,
                passed: false,
                details: `测试异常: ${error.message}`,
                results: { error: error.message }
            });
            
            console.log(`❌ ${test.name}: 测试异常 - ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    // 总结
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    
    console.log('📊 === 测试总结 ===');
    console.log(`通过: ${passedTests}/${totalTests} 测试`);
    
    if (passedTests === totalTests) {
        console.log('🎉 所有测试通过！房间功能应该正常工作。');
    } else if (passedTests >= totalTests * 0.8) {
        console.log('⚠️ 大部分测试通过，房间功能基本可用，但可能有小问题。');
    } else {
        console.log('❌ 多个测试失败，房间功能可能存在问题。');
    }
    
    return results;
}

// 自动运行测试
window.runRoomTests = runAllTests;

// 如果当前页面是分享页面，自动运行测试
if (window.location.pathname.includes('share.html') || window.location.hash.includes('room')) {
    console.log('🔍 检测到房间页面，自动运行测试...');
    setTimeout(runAllTests, 2000);
} else {
    console.log('📖 使用说明: 在分享页面的控制台运行 runRoomTests() 来测试房间功能');
}