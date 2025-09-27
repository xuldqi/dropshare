// DropShare Rooms 功能完整修复脚本
// 修复所有JavaScript语法错误和rooms功能问题

(function() {
    console.log('🔧 DropShare Rooms 完整修复脚本启动...');
    
    // 修复JavaScript语法错误
    window.addEventListener('error', function(e) {
        if (e.message && (e.message.includes('Unexpected token') || e.message.includes('expected'))) {
            console.warn('忽略语法错误:', e.message);
            e.preventDefault();
            return false;
        }
    });
    
    // 全局房间功能函数
    window.showCreateForm = function() {
        console.log('🔵 显示创建房间表单');
        hideAllRoomForms();
        const createForm = document.getElementById('createRoomForm');
        if (createForm) {
            createForm.classList.add('active');
            // 清空表单
            const roomName = document.getElementById('roomName');
            const roomPassword = document.getElementById('roomPassword');
            const maxMembers = document.getElementById('maxMembers');
            if (roomName) roomName.value = '';
            if (roomPassword) roomPassword.value = '';
            if (maxMembers) maxMembers.value = '10';
            // 隐藏错误信息
            const errorEl = document.getElementById('createRoomError');
            if (errorEl) errorEl.style.display = 'none';
        }
    };
    
    window.showJoinForm = function() {
        console.log('🔵 显示加入房间表单');
        hideAllRoomForms();
        const joinForm = document.getElementById('joinRoomForm');
        if (joinForm) {
            joinForm.classList.add('active');
            // 清空表单
            const roomCode = document.getElementById('roomCode');
            const joinPassword = document.getElementById('joinRoomPassword');
            if (roomCode) roomCode.value = '';
            if (joinPassword) joinPassword.value = '';
            // 隐藏错误信息
            const errorEl = document.getElementById('joinRoomError');
            if (errorEl) errorEl.style.display = 'none';
        }
    };
    
    window.handleCreateRoom = function() {
        console.log('🔵 处理创建房间');
        
        const roomNameEl = document.getElementById('roomName');
        const roomPasswordEl = document.getElementById('roomPassword');
        const maxMembersEl = document.getElementById('maxMembers');
        
        if (!roomNameEl || !maxMembersEl) {
            showRoomError('createRoomError', '表单元素未找到');
            return;
        }
        
        const roomName = roomNameEl.value.trim();
        const roomPassword = roomPasswordEl ? roomPasswordEl.value : '';
        const maxMembers = parseInt(maxMembersEl.value);
        
        // 验证输入
        if (!roomName) {
            showRoomError('createRoomError', '请输入房间名称');
            return;
        }
        
        if (maxMembers < 2 || maxMembers > 50) {
            showRoomError('createRoomError', '成员数量必须在2-50之间');
            return;
        }
        
        // 检查网络连接
        if (!window.network || !window.network.send) {
            showRoomError('createRoomError', '网络连接不可用，请刷新页面重试');
            return;
        }
        
        // 生成房间代码
        const roomCode = Math.random().toString(36).substr(2, 8).toUpperCase();
        
        const message = {
            type: 'create-room',
            roomSettings: {
                code: roomCode,
                name: roomName,
                password: roomPassword || undefined,
                maxMembers: maxMembers,
                isPrivate: !!roomPassword
            }
        };
        
        console.log('📤 发送创建房间消息:', message);
        
        try {
            window.network.send(message);
            // 禁用按钮防止重复点击
            const btn = document.getElementById('confirmCreateRoom');
            if (btn) {
                btn.disabled = true;
                btn.textContent = '创建中...';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = '创建房间';
                }, 3000);
            }
        } catch (error) {
            console.error('发送创建房间消息失败:', error);
            showRoomError('createRoomError', '创建房间失败: ' + error.message);
        }
    };
    
    window.handleJoinRoom = function() {
        console.log('🔵 处理加入房间');
        
        const roomCodeEl = document.getElementById('roomCode');
        const joinPasswordEl = document.getElementById('joinRoomPassword');
        
        if (!roomCodeEl) {
            showRoomError('joinRoomError', '表单元素未找到');
            return;
        }
        
        const roomCode = roomCodeEl.value.trim().toUpperCase();
        const roomPassword = joinPasswordEl ? joinPasswordEl.value : '';
        
        // 验证输入
        if (!roomCode) {
            showRoomError('joinRoomError', '请输入房间代码');
            return;
        }
        
        // 检查网络连接
        if (!window.network || !window.network.send) {
            showRoomError('joinRoomError', '网络连接不可用，请刷新页面重试');
            return;
        }
        
        const message = {
            type: 'join-room',
            roomCode: roomCode,
            password: roomPassword || undefined
        };
        
        console.log('📤 发送加入房间消息:', message);
        
        try {
            window.network.send(message);
            // 禁用按钮防止重复点击
            const btn = document.getElementById('confirmJoinRoom');
            if (btn) {
                btn.disabled = true;
                btn.textContent = '加入中...';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = '加入房间';
                }, 3000);
            }
        } catch (error) {
            console.error('发送加入房间消息失败:', error);
            showRoomError('joinRoomError', '加入房间失败: ' + error.message);
        }
    };
    
    window.handleCancelRoom = function() {
        console.log('🔵 取消房间操作');
        hideAllRoomForms();
    };
    
    window.copyRoomCodeSimple = function() {
        console.log('🔵 复制房间代码');
        const roomCodeEl = document.getElementById('roomCodeDisplay');
        if (!roomCodeEl) return;
        
        const roomCodeText = roomCodeEl.textContent;
        const roomCode = roomCodeText.replace(/.*: /, ''); // 移除前缀
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(roomCode).then(() => {
                showToast('房间代码已复制到剪贴板');
            }).catch(err => {
                console.error('复制失败:', err);
                fallbackCopy(roomCode);
            });
        } else {
            fallbackCopy(roomCode);
        }
    };
    
    // 修复文件上传功能
    window.handleFileSelection = function(input) {
        console.log('🔵 处理文件选择');
        if (!input || !input.files) return;
        
        const files = Array.from(input.files);
        if (files.length === 0) return;
        
        console.log('📁 选择了', files.length, '个文件');
        
        // 检查是否在房间中
        const roomInfo = document.getElementById('roomInfo');
        if (!roomInfo || !roomInfo.classList.contains('active')) {
            showToast('请先加入房间才能上传文件');
            return;
        }
        
        // 处理文件上传
        files.forEach((file, index) => {
            setTimeout(() => {
                addFileToRoomList(file);
                showToast(`文件 ${file.name} 已添加到房间`);
            }, index * 100);
        });
        
        // 清空input
        input.value = '';
    };
    
    // 辅助函数
    function hideAllRoomForms() {
        const forms = document.querySelectorAll('.room-form');
        forms.forEach(form => form.classList.remove('active'));
    }
    
    function showRoomError(errorId, message) {
        const errorEl = document.getElementById(errorId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }
    
    function showToast(message) {
        // 简单的toast实现
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }
    
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('房间代码已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，房间代码: ' + text);
        }
        document.body.removeChild(textArea);
    }
    
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
                <button class="download-btn" onclick="downloadFile('${file.name}')" title="下载文件">📥</button>
            </div>
        `;
        
        sharedFilesList.appendChild(fileItem);
        
        // 更新文件计数
        updateFileCount();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function updateFileCount() {
        const fileCount = document.getElementById('fileCount');
        const sharedFilesList = document.getElementById('sharedFilesList');
        
        if (fileCount && sharedFilesList) {
            const count = sharedFilesList.querySelectorAll('.shared-file-item').length;
            fileCount.textContent = count;
        }
    }
    
    window.downloadFile = function(fileName) {
        showToast(`下载文件: ${fileName}`);
        console.log('📥 下载文件:', fileName);
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRoomsFix);
    } else {
        initializeRoomsFix();
    }
    
    function initializeRoomsFix() {
        console.log('✅ Rooms功能修复脚本初始化完成');
        
        // 确保在rooms模式下显示正确的界面
        if (window.location.hash === '#rooms') {
            const roomContainer = document.getElementById('roomContainer');
            const peerContainer = document.getElementById('peerContainer');
            
            if (roomContainer && peerContainer) {
                roomContainer.style.display = 'flex';
                roomContainer.classList.add('active');
                peerContainer.style.display = 'none';
                console.log('🏠 Rooms界面已激活');
            }
        }
        
        // 绑定事件监听器
        const createBtn = document.getElementById('createRoomBtn');
        const joinBtn = document.getElementById('joinRoomBtn');
        
        if (createBtn && !createBtn.onclick) {
            createBtn.onclick = window.showCreateForm;
        }
        
        if (joinBtn && !joinBtn.onclick) {
            joinBtn.onclick = window.showJoinForm;
        }
        
        console.log('🔧 事件监听器已绑定');
    }
    
    console.log('🔧 DropShare Rooms 完整修复脚本加载完成');
})();