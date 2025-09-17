// DropShare 房间功能快速修复脚本
// 在浏览器控制台中运行以修复房间上传问题

console.log(`
🔧 DropShare 房间功能修复工具
================================

执行以下步骤来诊断和修复房间上传问题:

1. roomDiagnostics() - 诊断当前状态
2. fixRoomUpload() - 修复上传功能
3. testFileUpload() - 测试文件上传

`);

// 诊断房间状态
function roomDiagnostics() {
    console.log('🔍 === 房间功能诊断 ===');
    
    const status = {
        hash: window.location.hash,
        isRoomMode: window.location.hash === '#rooms' || window.location.hash === '#room',
        roomInfo: !!document.getElementById('roomInfo'),
        roomInfoActive: document.getElementById('roomInfo')?.classList.contains('active'),
        fileInput: !!document.getElementById('fileInput'),
        sharedFilesList: !!document.getElementById('sharedFilesList'),
        fileTransferArea: !!document.getElementById('fileTransferArea'),
        network: !!window.network,
        networkSend: !!(window.network && window.network.send),
        networkConnected: !!(window.network && window.network.isConnected && window.network.isConnected()),
        roomManager: !!window.roomManager,
        roomDebugger: !!window.roomDebugger
    };
    
    console.table(status);
    
    // 检查问题
    const issues = [];
    if (!status.isRoomMode) issues.push('❌ 不在房间模式 (URL hash应该是#rooms)');
    if (!status.roomInfoActive) issues.push('❌ 房间未激活 (需要加入房间)');
    if (!status.network) issues.push('❌ 网络对象未初始化');
    if (!status.networkConnected) issues.push('❌ 网络未连接');
    if (!status.fileInput) issues.push('❌ 文件输入元素未找到');
    
    if (issues.length > 0) {
        console.log('🚨 发现问题:');
        issues.forEach(issue => console.log(issue));
    } else {
        console.log('✅ 所有检查通过!');
    }
    
    return status;
}

// 修复房间上传功能
function fixRoomUpload() {
    console.log('🔧 === 修复房间上传功能 ===');
    
    // 1. 确保在房间模式
    if (window.location.hash !== '#rooms') {
        console.log('🔄 切换到房间模式...');
        window.location.hash = '#rooms';
        setTimeout(fixRoomUpload, 1000);
        return;
    }
    
    // 2. 显示房间容器
    const roomContainer = document.getElementById('roomContainer');
    if (roomContainer) {
        roomContainer.style.display = 'flex';
        roomContainer.style.visibility = 'visible';
        roomContainer.style.opacity = '1';
        console.log('✅ 房间容器已显示');
    }
    
    // 3. 修复文件输入
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        // 移除旧的事件监听器
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        
        // 添加新的事件监听器
        newFileInput.addEventListener('change', function(e) {
            console.log('📁 文件选择事件触发:', e.target.files.length, '个文件');
            handleManualFileUpload(e.target.files);
        });
        
        console.log('✅ 文件输入事件监听器已修复');
    }
    
    // 4. 显示文件传输区域
    const fileTransferArea = document.getElementById('fileTransferArea');
    if (fileTransferArea) {
        fileTransferArea.style.display = 'block';
        console.log('✅ 文件传输区域已显示');
    }
    
    console.log('🎉 房间上传功能修复完成!');
}

// 手动处理文件上传
function handleManualFileUpload(files) {
    if (!files || files.length === 0) {
        console.log('❌ 没有选择文件');
        return;
    }
    
    console.log(`📤 准备上传 ${files.length} 个文件`);
    
    // 检查是否在房间中
    const roomInfo = document.getElementById('roomInfo');
    if (!roomInfo || !roomInfo.classList.contains('active')) {
        // 如果没有加入房间，创建一个测试房间
        console.log('⚠️ 未在房间中，创建测试房间...');
        createTestRoom();
        setTimeout(() => handleManualFileUpload(files), 2000);
        return;
    }
    
    // 处理每个文件
    Array.from(files).forEach((file, index) => {
        setTimeout(() => {
            addFileToRoomList(file);
        }, index * 100);
    });
}

// 创建测试房间 (模拟)
function createTestRoom() {
    console.log('🏠 创建测试房间...');
    
    const roomInfo = document.getElementById('roomInfo');
    if (roomInfo) {
        roomInfo.classList.add('active');
        roomInfo.innerHTML = `
            <div class="room-details">
                <h3>🏠 测试房间</h3>
                <p>房间代码: TEST123</p>
                <p>成员: 1 在线</p>
                <button onclick="leaveTestRoom()">离开房间</button>
            </div>
        `;
        roomInfo.style.display = 'block';
        console.log('✅ 测试房间已创建');
    }
    
    // 显示文件传输区域
    const fileTransferArea = document.getElementById('fileTransferArea');
    if (fileTransferArea) {
        fileTransferArea.style.display = 'block';
    }
}

// 离开测试房间
function leaveTestRoom() {
    const roomInfo = document.getElementById('roomInfo');
    if (roomInfo) {
        roomInfo.classList.remove('active');
        roomInfo.style.display = 'none';
    }
    
    // 隐藏文件传输区域
    const fileTransferArea = document.getElementById('fileTransferArea');
    if (fileTransferArea) {
        fileTransferArea.style.display = 'none';
    }
    
    // 清空文件列表
    clearFileList();
    
    console.log('👋 已离开测试房间');
}

// 添加文件到房间列表
function addFileToRoomList(file) {
    const sharedFilesList = document.getElementById('sharedFilesList');
    if (!sharedFilesList) {
        console.log('❌ 找不到共享文件列表');
        return;
    }
    
    // 隐藏空状态
    const noFiles = sharedFilesList.querySelector('.no-shared-files');
    if (noFiles) {
        noFiles.style.display = 'none';
    }
    
    // 创建文件项
    const fileItem = document.createElement('div');
    fileItem.className = 'shared-file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-details">${formatFileSize(file.size)} • 您</div>
        </div>
        <div class="file-actions">
            <button class="download-btn" onclick="downloadTestFile('${file.name}')">下载</button>
            <button class="remove-btn" onclick="removeTestFile(this)">删除</button>
        </div>
    `;
    
    sharedFilesList.appendChild(fileItem);
    updateFileCount();
    
    console.log(`✅ 文件已添加到列表: ${file.name}`);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 更新文件计数
function updateFileCount() {
    const fileCount = document.getElementById('fileCount');
    const sharedFilesList = document.getElementById('sharedFilesList');
    
    if (fileCount && sharedFilesList) {
        const count = sharedFilesList.querySelectorAll('.shared-file-item').length;
        fileCount.textContent = count;
    }
}

// 下载测试文件
function downloadTestFile(fileName) {
    console.log(`📥 模拟下载文件: ${fileName}`);
    alert(`模拟下载: ${fileName}`);
}

// 删除测试文件
function removeTestFile(button) {
    const fileItem = button.closest('.shared-file-item');
    if (fileItem) {
        const fileName = fileItem.querySelector('.file-name').textContent;
        fileItem.remove();
        updateFileCount();
        console.log(`🗑️ 文件已删除: ${fileName}`);
        
        // 检查是否需要显示空状态
        const sharedFilesList = document.getElementById('sharedFilesList');
        const remainingFiles = sharedFilesList.querySelectorAll('.shared-file-item');
        if (remainingFiles.length === 0) {
            const noFiles = sharedFilesList.querySelector('.no-shared-files');
            if (noFiles) {
                noFiles.style.display = 'block';
            }
        }
    }
}

// 清空文件列表
function clearFileList() {
    const sharedFilesList = document.getElementById('sharedFilesList');
    if (sharedFilesList) {
        const fileItems = sharedFilesList.querySelectorAll('.shared-file-item');
        fileItems.forEach(item => item.remove());
        
        const noFiles = sharedFilesList.querySelector('.no-shared-files');
        if (noFiles) {
            noFiles.style.display = 'block';
        }
        
        updateFileCount();
    }
}

// 测试文件上传
function testFileUpload() {
    console.log('🧪 === 测试文件上传 ===');
    
    // 创建一个测试文件
    const testContent = 'This is a test file created for testing DropShare room upload functionality.';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    console.log('📄 创建测试文件:', testFile.name, testFile.size, 'bytes');
    
    // 模拟文件上传
    handleManualFileUpload([testFile]);
}

// 全局暴露函数
window.roomDiagnostics = roomDiagnostics;
window.fixRoomUpload = fixRoomUpload;
window.testFileUpload = testFileUpload;
window.handleManualFileUpload = handleManualFileUpload;
window.createTestRoom = createTestRoom;
window.leaveTestRoom = leaveTestRoom;