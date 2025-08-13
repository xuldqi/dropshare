/**
 * 私密房间功能模块
 * 支持房间创建、加入、管理等功能
 */

class PrivateRoomManager {
    constructor() {
        this.currentRoom = null;
        this.isRoomHost = false;
        this.roomMembers = new Map();
        this.roomSettings = {
            name: '',
            password: '',
            maxMembers: 10,
            isPrivate: true
        };
        
        this.init();
    }

    init() {
        this.createRoomUI();
        this.bindEvents();
        this.loadSavedRooms();
    }

    createRoomUI() {
        // 创建房间图标SVG
        this.addRoomIcon();
        
        // 创建简化的房间管理界面
        this.createRoomDialog();
        this.createJoinRoomDialog();
        this.createRoomMembersDialog();
    }

    addRoomIcon() {
        const svg = document.querySelector('svg');
        if (svg) {
            const roomIcon = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
            roomIcon.id = 'room-icon';
            roomIcon.setAttribute('viewBox', '0 0 24 24');
            roomIcon.innerHTML = `
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V19H13V21H15V19H19V9H21ZM13 7H18L13 2V7ZM17 11V13H19V15H17V17H15V15H13V13H15V11H17Z"/>
            `;
            svg.appendChild(roomIcon);
        }
    }

    createRoomDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'roomDialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2 data-i18n="private_rooms">Private Rooms</h2>
                <div class="room-options">
                    <button id="createRoomBtn" class="button primary" data-i18n="create_room">Create Room</button>
                    <button id="joinRoomBtn" class="button" data-i18n="join_room">Join Room</button>
                </div>
                <div class="room-list" id="roomList" style="display: none;">
                    <h3 data-i18n="recent_rooms">Recent Rooms</h3>
                    <div id="recentRoomsList"></div>
                </div>
                <div class="dialog-actions">
                    <button class="button" data-i18n="close" onclick="this.parentNode.parentNode.parentNode.close()">Close</button>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
    }

    createJoinRoomDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'joinRoomDialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2 data-i18n="join_room">Join Room</h2>
                <div class="input-group">
                    <label for="roomCodeInput" data-i18n="room_code">Room Code:</label>
                    <input type="text" id="roomCodeInput" placeholder="Enter 6-digit room code" maxlength="6" style="text-transform: uppercase;">
                </div>
                <div class="dialog-actions">
                    <button class="button" data-i18n="cancel" onclick="this.parentNode.parentNode.parentNode.close()">Cancel</button>
                    <button id="joinRoomConfirmBtn" class="button primary" data-i18n="join">Join</button>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
    }



    createRoomMembersDialog() {
        const dialog = document.createElement('x-dialog');
        dialog.id = 'roomMembersDialog';
        // 确保对话框初始时是隐藏的
        dialog.style.display = 'none';
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2 data-i18n="room_members">Room Members</h2>
                <div class="room-info">
                    <div class="room-code-display">
                        <span data-i18n="room_code">Room Code:</span>
                        <strong id="currentRoomCode"></strong>
                        <button id="copyRoomCodeBtn" class="icon-button" title="Copy Room Code">
                            <svg class="icon"><use xlink:href="#copy-icon" /></svg>
                        </button>
                    </div>
                    <div class="room-link">
                        <span data-i18n="invite_link">Invite Link:</span>
                        <input type="text" id="roomInviteLink" readonly>
                        <button id="copyInviteLinkBtn" class="icon-button" title="Copy Invite Link">
                            <svg class="icon"><use xlink:href="#copy-icon" /></svg>
                        </button>
                    </div>
                </div>
                <div class="members-list" id="membersList">
                    <h3 data-i18n="members">Members</h3>
                    <div id="membersContainer"></div>
                </div>
                <div class="dialog-actions">
                    <button id="leaveRoomBtn" class="button danger" data-i18n="leave_room">Leave Room</button>
                    <button id="roomSettingsBtn" class="button" data-i18n="settings">Settings</button>
                    <button class="button" data-i18n="close" onclick="this.parentNode.parentNode.parentNode.close()">Close</button>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
    }
    
    initDialogMethods(dialog) {
        if (!dialog.show) {
            dialog.show = function() {
                // 关闭其他对话框
                document.querySelectorAll('x-dialog[show]').forEach(d => {
                    if (d !== this) d.close();
                });
                this.setAttribute('show', '1');
            };
        }
        if (!dialog.close) {
            dialog.close = function() {
                this.removeAttribute('show');
            };
        }
    }

    bindEvents() {
        // 使用更安全的事件绑定，检查元素是否存在
        const safeAddEventListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`Element with id '${id}' not found`);
            }
        };

        // 房间按钮点击事件
        safeAddEventListener('roomNav', 'click', (e) => {
            e.preventDefault();
            this.showRoomDialog();
        });

        // 创建房间按钮
        safeAddEventListener('createRoomBtn', 'click', () => {
            this.createRoom();
        });

        // 加入房间按钮
        safeAddEventListener('joinRoomBtn', 'click', () => {
            const roomDialog = document.getElementById('roomDialog');
            const joinDialog = document.getElementById('joinRoomDialog');
            if (roomDialog) roomDialog.close();
            if (joinDialog) joinDialog.show();
        });

        // 确认加入房间
        safeAddEventListener('joinRoomConfirmBtn', 'click', () => {
            this.joinRoom();
        });

        // 离开房间
        safeAddEventListener('leaveRoomBtn', 'click', () => {
            this.leaveRoom();
        });

        // 复制房间码
        safeAddEventListener('copyRoomCodeBtn', 'click', () => {
            this.copyRoomCode();
        });

        // 复制邀请链接
        safeAddEventListener('copyInviteLinkBtn', 'click', () => {
            this.copyInviteLink();
        });

        // 监听WebSocket消息
        if (typeof Events !== 'undefined') {
            Events.on('ws-message', (e) => {
                this.handleWebSocketMessage(e.detail);
            });
        }
    }

    showRoomDialog() {
        this.updateRecentRoomsList();
        document.getElementById('roomDialog').show();
    }





    createRoom() {
        const roomCode = this.generateRoomCode();
        
        this.roomSettings = {
            code: roomCode,
            maxMembers: 10,
            isPrivate: true
        };

        // 发送创建房间请求到服务器
        this.sendRoomMessage({
            type: 'create-room',
            roomSettings: this.roomSettings
        });

        // 显示房间代码
        this.showRoomCode(roomCode);
        document.getElementById('roomDialog').close();
    }

    joinRoom() {
        const roomCode = document.getElementById('roomCodeInput').value.trim().toUpperCase();

        if (!roomCode || roomCode.length !== 6) {
            this.showToast('Please enter a valid 6-digit room code', 'error');
            return;
        }

        // 发送加入房间请求到服务器
        this.sendRoomMessage({
            type: 'join-room',
            roomCode: roomCode
        });

        document.getElementById('joinRoomDialog').close();
    }

    leaveRoom() {
        if (!this.currentRoom) return;

        // 发送离开房间请求到服务器
        this.sendRoomMessage({
            type: 'leave-room',
            roomCode: this.currentRoom.code
        });

        this.currentRoom = null;
        this.isRoomHost = false;
        this.roomMembers.clear();
        
        document.getElementById('roomMembersDialog').close();
        this.updateRoomStatus();
        this.showToast('Left the room', 'success');
    }

    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    showRoomCode(code) {
        const dialog = document.createElement('x-dialog');
        dialog.innerHTML = `
            <x-background class="full"></x-background>
            <x-paper shadow="2">
                <h2>Room Created Successfully!</h2>
                <p>Share this code with others to join your private room:</p>
                <div class="room-code-display">
                    <input type="text" value="${code}" readonly id="roomCodeDisplay" style="font-size: 24px; text-align: center; font-weight: bold; letter-spacing: 2px;">
                    <button class="button primary" onclick="navigator.clipboard.writeText('${code}').then(() => this.textContent = 'Copied!')">Copy Code</button>
                </div>
                <div class="dialog-actions">
                    <button class="button" onclick="this.parentNode.parentNode.parentNode.remove()">Close</button>
                </div>
            </x-paper>
        `;
        document.body.appendChild(dialog);
        // 初始化对话框方法
        this.initDialogMethods(dialog);
        dialog.show();
        
        // 自动选中代码文本
        setTimeout(() => {
            document.getElementById('roomCodeDisplay').select();
        }, 100);
    }

    sendRoomMessage(message) {
        // 通过现有的WebSocket连接发送房间相关消息
        if (window.network && window.network._socket) {
            window.network._socket.send(JSON.stringify(message));
        }
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'room-created':
                this.onRoomCreated(message);
                break;
            case 'room-joined':
                this.onRoomJoined(message);
                break;
            case 'room-left':
                this.onRoomLeft(message);
                break;
            case 'room-member-joined':
                this.onMemberJoined(message);
                break;
            case 'room-member-left':
                this.onMemberLeft(message);
                break;
            case 'room-error':
                this.onRoomError(message);
                break;
        }
    }

    onRoomCreated(message) {
        this.currentRoom = message.room;
        this.isRoomHost = true;
        this.roomMembers.set(message.hostId, message.hostInfo);
        
        this.saveRoom(this.currentRoom);
        this.updateRoomStatus();
        this.showRoomMembersDialog();
        this.showToast('Room created successfully!', 'success');
        
        // 显示房间代码供分享
        this.showRoomCode(this.currentRoom.code);
    }

    onRoomJoined(message) {
        this.currentRoom = message.room;
        this.isRoomHost = false;
        
        // 更新成员列表
        message.members.forEach(member => {
            this.roomMembers.set(member.id, member);
        });
        
        this.saveRoom(this.currentRoom);
        this.updateRoomStatus();
        this.showRoomMembersDialog();
        this.showToast('Joined room successfully!', 'success');
    }

    onRoomLeft(message) {
        this.currentRoom = null;
        this.isRoomHost = false;
        this.roomMembers.clear();
        this.updateRoomStatus();
    }

    onMemberJoined(message) {
        this.roomMembers.set(message.member.id, message.member);
        this.updateMembersList();
        this.showToast(`${message.member.displayName} joined the room`, 'info');
    }

    onMemberLeft(message) {
        this.roomMembers.delete(message.memberId);
        this.updateMembersList();
        this.showToast(`Member left the room`, 'info');
    }

    onRoomError(message) {
        this.showToast(message.error, 'error');
    }

    showRoomMembersDialog() {
        if (!this.currentRoom) return;
        
        document.getElementById('currentRoomCode').textContent = this.currentRoom.code;
        document.getElementById('roomInviteLink').value = this.generateInviteLink(this.currentRoom.code);
        
        this.updateMembersList();
        document.getElementById('roomMembersDialog').show();
    }

    updateMembersList() {
        const container = document.getElementById('membersContainer');
        container.innerHTML = '';
        
        this.roomMembers.forEach((member, id) => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-item';
            memberElement.innerHTML = `
                <div class="member-info">
                    <span class="member-name">${member.displayName}</span>
                    <span class="member-device">${member.deviceName}</span>
                    ${member.isHost ? '<span class="host-badge">Host</span>' : ''}
                </div>
                ${this.isRoomHost && !member.isHost ? `
                    <button class="kick-member-btn" data-member-id="${id}" title="Kick Member">
                        <svg class="icon"><use xlink:href="#close-icon" /></svg>
                    </button>
                ` : ''}
            `;
            
            container.appendChild(memberElement);
        });
        
        // 绑定踢出成员事件
        container.querySelectorAll('.kick-member-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const memberId = e.target.closest('.kick-member-btn').dataset.memberId;
                this.kickMember(memberId);
            });
        });
    }

    kickMember(memberId) {
        if (!this.isRoomHost) return;
        
        this.sendRoomMessage({
            type: 'kick-member',
            roomCode: this.currentRoom.code,
            memberId: memberId
        });
    }

    generateInviteLink(roomCode) {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?room=${roomCode}`;
    }

    copyRoomCode() {
        const roomCode = document.getElementById('currentRoomCode').textContent;
        navigator.clipboard.writeText(roomCode).then(() => {
            this.showToast('Room code copied to clipboard!', 'success');
        });
    }

    copyInviteLink() {
        const inviteLink = document.getElementById('roomInviteLink').value;
        navigator.clipboard.writeText(inviteLink).then(() => {
            this.showToast('Invite link copied to clipboard!', 'success');
        });
    }

    updateRoomStatus() {
        const roomNav = document.getElementById('roomNav');
        if (this.currentRoom) {
            roomNav.classList.add('active');
            roomNav.title = `In Room: ${this.currentRoom.name} (${this.currentRoom.code})`;
        } else {
            roomNav.classList.remove('active');
            roomNav.title = 'Private Rooms';
        }
    }

    saveRoom(room) {
        let savedRooms = JSON.parse(localStorage.getItem('dropshare_recent_rooms') || '[]');
        
        // 移除已存在的相同房间
        savedRooms = savedRooms.filter(r => r.code !== room.code);
        
        // 添加到开头
        savedRooms.unshift({
            code: room.code,
            name: room.name,
            joinedAt: Date.now()
        });
        
        // 只保留最近10个房间
        savedRooms = savedRooms.slice(0, 10);
        
        localStorage.setItem('dropshare_recent_rooms', JSON.stringify(savedRooms));
    }

    loadSavedRooms() {
        // 暂时禁用自动显示对话框功能
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        
        if (roomCode) {
            // 只填入房间码，不自动显示对话框
            setTimeout(() => {
                const roomCodeInput = document.getElementById('roomCodeInput');
                if (roomCodeInput) {
                    roomCodeInput.value = roomCode;
                    console.log('Room code filled from URL:', roomCode);
                }
            }, 1000);
        }
    }

    updateRecentRoomsList() {
        const container = document.getElementById('recentRoomsList');
        const savedRooms = JSON.parse(localStorage.getItem('dropshare_recent_rooms') || '[]');
        
        container.innerHTML = '';
        
        if (savedRooms.length === 0) {
            container.innerHTML = '<p class="no-rooms">No recent rooms</p>';
            return;
        }
        
        savedRooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'recent-room-item';
            roomElement.innerHTML = `
                <div class="room-info">
                    <span class="room-name">${room.name}</span>
                    <span class="room-code">${room.code}</span>
                    <span class="join-date">${new Date(room.joinedAt).toLocaleDateString()}</span>
                </div>
                <button class="rejoin-btn" data-room-code="${room.code}" data-i18n="rejoin">Rejoin</button>
            `;
            
            container.appendChild(roomElement);
        });
        
        // 绑定重新加入事件
        container.querySelectorAll('.rejoin-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomCode = e.target.dataset.roomCode;
                const roomCodeInput = document.getElementById('roomCodeInput');
                const joinRoomDialog = document.getElementById('joinRoomDialog');
                if (roomCodeInput && joinRoomDialog) {
                    roomCodeInput.value = roomCode;
                    joinRoomDialog.show();
                }
            });
        });
    }

    showToast(message, type = 'info') {
        // 使用现有的toast系统或创建简单的提示
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 暂时禁用私密房间管理器初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('Private room manager initialization skipped');
    // window.privateRoomManager = new PrivateRoomManager();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivateRoomManager;
}