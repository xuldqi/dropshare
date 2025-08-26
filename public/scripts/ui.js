const $ = query => document.getElementById(query);
const $$ = query => document.body.querySelector(query);
const isURL = text => /^((https?:\/\/|www)[^\s]+)/g.test(text.toLowerCase());
window.isDownloadSupported = (typeof document.createElement('a').download !== 'undefined');
window.isProductionEnvironment = !window.location.host.startsWith('localhost');
window.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// 对话框管理器
class DialogManager {
    static dialogs = [];
    
    static register(dialog) {
        this.dialogs.push(dialog);
    }
    
    static closeAll() {
        this.dialogs.forEach(dialog => {
            if (dialog.$el && dialog.$el.hasAttribute('show')) {
                dialog.hide();
            }
        });
    }
}

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // 防止错误导致页面完全卡住
    if (event.error && event.error.message && event.error.message.includes('dialog')) {
        console.warn('Dialog-related error detected, attempting to clean up dialogs');
        document.querySelectorAll('x-dialog[show]').forEach(dialog => {
            dialog.removeAttribute('show');
        });
    }
});

// 暂时禁用对话框初始化，避免干扰
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, skipping dialog initialization');
});

// set display name
let currentDisplayName = ''; // 存储当前显示名称

Events.on('display-name', e => {
    const me = e.detail.message;
    currentDisplayName = me.displayName; // 存储当前名称
    
    // 存储当前用户的peer ID到全局变量
    if (me.peerId) {
        window.currentPeerId = me.peerId;
        console.log('Current peer ID stored:', me.peerId);
        
        // 也存储到displayName元素的dataset中，供房间管理器使用
        const displayNameEl = document.getElementById('displayName');
        if (displayNameEl) {
            displayNameEl.dataset.peerId = me.peerId;
        }
    }
    
    updateDisplayName(me.displayName, me.deviceName);
    
    // 同时更新房间区域的用户名称显示
    updateRoomUserName(me.displayName);
});

// 更新房间区域用户名称显示
function updateRoomUserName(displayName) {
    const currentUserNameEl = document.getElementById('currentUserName');
    if (currentUserNameEl && displayName) {
        currentUserNameEl.textContent = displayName;
    }
}

// 更新显示名称的函数
function updateDisplayName(displayName, deviceName) {
    const $displayName = $('displayName');
    let displayText = '';
    
    // 使用翻译系统显示用户名称
    if (window.i18nUtils && typeof window.i18nUtils.t === 'function') {
        const prefix = window.i18nUtils.t('transfer.status.known_as');
        // 检查翻译是否成功，如果返回原键值说明翻译失败
        if (prefix && prefix !== 'transfer.status.known_as') {
            displayText = prefix + ' ' + displayName;
        } else {
            displayText = 'You are known as ' + displayName;
        }
    } else {
        displayText = 'You are known as ' + displayName;
    }
    
    // 清除原有的placeholder，防止出现重复文本
    $displayName.removeAttribute('placeholder');
    $displayName.textContent = displayText;
    if (deviceName) {
        $displayName.title = deviceName;
    }
}

// 当语言改变时更新所有需要翻译的文本
document.addEventListener('language-changed', () => {
    // 更新当前用户显示名称  
    if (currentDisplayName) {
        updateDisplayName(currentDisplayName, null);
        updateRoomUserName(currentDisplayName);
    }
    
    // 更新所有对等节点的设备名称
    document.querySelectorAll('x-peer').forEach(peer => {
        if (peer.ui && typeof peer.ui._deviceName === 'function') {
            peer.querySelector('.device-name').textContent = peer.ui._deviceName();
        }
    });
});

// 语言选择器功能 - 延迟初始化以确保i18nUtils已加载
function initializeLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector && window.i18nUtils) {
        // 当i18n系统加载完成后，重新渲染显示名称
        if (currentDisplayName) {
            updateDisplayName(currentDisplayName);
        }
        // 移除之前的监听器
        languageSelector.onchange = null;
        
        languageSelector.addEventListener('change', (e) => {
            window.i18nUtils.setLanguage(e.target.value);
        });

        // 设置当前选中的语言
        languageSelector.value = window.i18nUtils.getCurrentLanguage() || 'en';
        
        console.log('语言选择器初始化完成, 当前语言:', window.i18nUtils.getCurrentLanguage() || 'en');
        return true;
    }
    return false;
}

// 等待i18nUtils加载完成
function waitForI18nUtils() {
    if (window.i18nUtils) {
        initializeLanguageSelector();
        // 确保在i18n系统加载完成后重新渲染显示名称
        if (currentDisplayName) {
            updateDisplayName(currentDisplayName, null);
        }
    } else {
        setTimeout(waitForI18nUtils, 50);
    }
}

// DOM加载完成后等待i18nUtils
document.addEventListener('DOMContentLoaded', () => {
    waitForI18nUtils();
});

class PeersUI {

    constructor() {
        Events.on('peer-joined', e => this._onPeerJoined(e.detail));
        Events.on('peer-left', e => this._onPeerLeft(e.detail));
        Events.on('peers', e => this._onPeers(e.detail));
        Events.on('file-progress', e => this._onFileProgress(e.detail));
        Events.on('paste', e => this._onPaste(e));
    }

    _onPeerJoined(peer) {
        if ($(peer.id)) return; // peer already exists
        // 确保不显示当前用户自己
        if (peer.id === window.currentPeerId) return;
        const peerUI = new PeerUI(peer);
        $$('x-peers').appendChild(peerUI.$el);
    }

    _onPeers(peers) {
        this._clearPeers();
        // 如果当前用户ID还没设置，延迟处理
        if (!window.currentPeerId) {
            setTimeout(() => this._onPeers(peers), 100);
            return;
        }
        // 过滤掉当前用户自己，确保只显示其他设备
        const otherPeers = peers.filter(peer => peer.id !== window.currentPeerId);
        otherPeers.forEach(peer => this._onPeerJoined(peer));
    }

    _onPeerLeft(peerId) {
        const $peer = $(peerId);
        if (!$peer) return;
        $peer.remove();
    }

    _onFileProgress(progress) {
        const peerId = progress.sender || progress.recipient;
        const $peer = $(peerId);
        if (!$peer) return;
        $peer.ui.setProgress(progress.progress);
    }

    _clearPeers() {
        const $peers = $$('x-peers').innerHTML = '';
    }

    _onPaste(e) {
        const files = e.clipboardData.files || e.clipboardData.items
            .filter(i => i.type.indexOf('image') > -1)
            .map(i => i.getAsFile());
        const peers = document.querySelectorAll('x-peer');
        // send the pasted image content to the only peer if there is one
        // otherwise, select the peer somehow by notifying the client that
        // "image data has been pasted, click the client to which to send it"
        // not implemented
        if (files.length > 0 && peers.length === 1) {
            Events.fire('files-selected', {
                files: files,
                to: $$('x-peer').id
            });
        }
    }
}

class PeerUI {

    html() {
        return `
            <label class="column center" title="Click to send files or right click to send a message">
                <input type="file" multiple>
                <x-icon shadow="1">
                    <svg class="icon"><use xlink:href="#"/></svg>
                </x-icon>
                <div class="progress">
                  <div class="circle"></div>
                  <div class="circle right"></div>
                </div>
                <div class="name font-subheading"></div>
                <div class="device-name font-body2"></div>
                <div class="status font-body2"></div>
            </label>`
    }

    constructor(peer) {
        this._peer = peer;
        this._initDom();
        this._bindListeners(this.$el);
    }

    _initDom() {
        const el = document.createElement('x-peer');
        el.id = this._peer.id;
        el.innerHTML = this.html();
        el.ui = this;
        el.querySelector('svg use').setAttribute('xlink:href', this._icon());
        el.querySelector('.name').textContent = this._displayName();
        el.querySelector('.device-name').textContent = this._deviceName();
        
        // 为元素添加设备类型标识
        const device = this._peer.name.device || this._peer.name;
        const type = device.type || 'desktop';
        el.setAttribute('data-device-type', type);
        
        // 为新创建的元素添加动画延迟
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        
        this.$el = el;
        this.$progress = el.querySelector('.progress');
    }

    _bindListeners(el) {
        el.querySelector('input').addEventListener('change', e => this._onFilesSelected(e));
        el.addEventListener('drop', e => this._onDrop(e));
        el.addEventListener('dragend', e => this._onDragEnd(e));
        el.addEventListener('dragleave', e => this._onDragEnd(e));
        el.addEventListener('dragover', e => this._onDragOver(e));
        el.addEventListener('contextmenu', e => this._onRightClick(e));
        el.addEventListener('touchstart', e => this._onTouchStart(e));
        el.addEventListener('touchend', e => this._onTouchEnd(e));
        // prevent browser's default file drop behavior
        Events.on('dragover', e => e.preventDefault());
        Events.on('drop', e => e.preventDefault());
    }

    _displayName() {
        return this._peer.name.displayName;
    }

    _deviceName() {
        const device = this._peer.name.device || this._peer.name;
        const type = device.type || 'desktop';
        const os = device.os || '';
        
        // 获取当前语言
        let lang = 'en';
        if (window.i18nUtils) {
            lang = window.i18nUtils.getCurrentLanguage() || 'en';
        }
        
        // 设备类型的本地化显示名称
        const deviceLabels = {
            'en': {
                'desktop': 'Computer',
                'windows': 'Windows PC',
                'mac': 'Mac',
                'linux': 'Linux PC',
                'mobile': 'Phone',
                'android-mobile': 'Android Phone',
                'ios-mobile': 'iPhone',
                'tablet': 'Tablet',
                'android-tablet': 'Android Tablet',
                'ios-tablet': 'iPad'
            },
            'zh': {
                'desktop': '电脑',
                'windows': 'Windows 电脑',
                'mac': 'Mac 电脑',
                'linux': 'Linux 电脑',
                'mobile': '手机',
                'android-mobile': 'Android 手机',
                'ios-mobile': 'iPhone',
                'tablet': '平板',
                'android-tablet': 'Android 平板',
                'ios-tablet': 'iPad'
            },
            'zh-tw': {
                'desktop': '電腦',
                'windows': 'Windows 電腦',
                'mac': 'Mac 電腦',
                'linux': 'Linux 電腦',
                'mobile': '手機',
                'android-mobile': 'Android 手機',
                'ios-mobile': 'iPhone',
                'tablet': '平板',
                'android-tablet': 'Android 平板',
                'ios-tablet': 'iPad'
            }
        };
        
        // 默认使用英文
        const labels = deviceLabels[lang] || deviceLabels['en'];
        
        // 生成设备标签
        let deviceType = labels[type] || '';
        
        if (type === 'desktop') {
            if (os) {
                if (os.includes('Windows')) deviceType = labels['windows'];
                else if (os.includes('Mac')) deviceType = labels['mac'];
                else if (os.includes('Linux')) deviceType = labels['linux'];
            }
        } else if (type === 'mobile') {
            if (os) {
                if (os.includes('Android')) deviceType = labels['android-mobile'];
                else if (os.includes('iOS')) deviceType = labels['ios-mobile'];
            }
        } else if (type === 'tablet') {
            if (os) {
                if (os.includes('Android')) deviceType = labels['android-tablet'];
                else if (os.includes('iOS')) deviceType = labels['ios-tablet'];
            }
        }
        
        return deviceType || this._peer.name.deviceName || '';
    }

    _icon() {
        const device = this._peer.name.device || this._peer.name;
        const type = device.type || 'desktop';
        const os = device.os ? device.os.toLowerCase() : 'default';
        
        const deviceType = deviceIcons[type] || deviceIcons['desktop'];
        return deviceType[os] || deviceType['default'];
    }

    _onFilesSelected(e) {
        const $input = e.target;
        const files = $input.files;
        Events.fire('files-selected', {
            files: files,
            to: this._peer.id
        });
        
        // 跟踪文件发送事件
        if (window.trackFileSent && files && files.length > 0) {
            const totalSize = Array.from(files).reduce((size, file) => size + file.size, 0);
            const fileTypes = Array.from(files).map(file => file.type || 'unknown').join(',');
            window.trackFileSent(fileTypes, totalSize);
        }
        
        $input.value = null;
    }

    setProgress(progress) {
        if (progress > 0) {
            this.$el.setAttribute('transfer', '1');
            this._addProgressIndicators();
        }
        if (progress > 0.5) {
            this.$progress.classList.add('over50');
        } else {
            this.$progress.classList.remove('over50');
        }
        const degrees = `rotate(${360 * progress}deg)`;
        this.$progress.style.setProperty('--progress', degrees);
        
        // 更新进度文本
        this._updateProgressText(progress);
        
        // 计算传输速度
        this._updateTransferSpeed(progress);
        
        if (progress >= 1) {
            this._onTransferComplete();
            this.setProgress(0);
            this.$el.removeAttribute('transfer');
            this._removeProgressIndicators();
        }
    }
    
    _addProgressIndicators() {
        if (!this.$el.querySelector('.progress-text')) {
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = '0%';
            this.$el.appendChild(progressText);
        }
        
        if (!this.$el.querySelector('.transfer-speed')) {
            const speedIndicator = document.createElement('div');
            speedIndicator.className = 'transfer-speed';
            speedIndicator.textContent = '';
            this.$el.appendChild(speedIndicator);
        }
    }
    
    _removeProgressIndicators() {
        const progressText = this.$el.querySelector('.progress-text');
        const speedIndicator = this.$el.querySelector('.transfer-speed');
        
        if (progressText) progressText.remove();
        if (speedIndicator) speedIndicator.remove();
    }
    
    _updateProgressText(progress) {
        const progressText = this.$el.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = Math.round(progress * 100) + '%';
        }
    }
    
    _updateTransferSpeed(progress) {
        const speedIndicator = this.$el.querySelector('.transfer-speed');
        if (!speedIndicator) return;
        
        const now = Date.now();
        if (!this._transferStartTime) {
            this._transferStartTime = now;
            this._lastProgress = 0;
            this._lastTime = now;
            return;
        }
        
        const timeDiff = (now - this._lastTime) / 1000; // 秒
        const progressDiff = progress - this._lastProgress;
        
        if (timeDiff > 0.5 && progressDiff > 0) { // 每0.5秒更新一次
            const speed = progressDiff / timeDiff; // 进度/秒
            const remainingProgress = 1 - progress;
            const estimatedTime = remainingProgress / speed;
            
            if (estimatedTime > 0 && estimatedTime < 3600) { // 小于1小时
                const minutes = Math.floor(estimatedTime / 60);
                const seconds = Math.floor(estimatedTime % 60);
                
                if (minutes > 0) {
                    speedIndicator.textContent = `${minutes}m ${seconds}s remaining`;
                } else {
                    speedIndicator.textContent = `${seconds}s remaining`;
                }
            }
            
            this._lastProgress = progress;
            this._lastTime = now;
        }
    }
    
    _onTransferComplete() {
        // 添加完成动画
        this.$el.classList.add('transfer-complete');
        
        // 重置传输计时器
        this._transferStartTime = null;
        this._lastProgress = 0;
        this._lastTime = null;
        
        // 移除完成动画类
        setTimeout(() => {
            this.$el.classList.remove('transfer-complete');
        }, 1000);
    }

    _onDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        
        // 添加拖放成功的动画效果
        this.$el.classList.add('file-drop-success');
        setTimeout(() => {
            this.$el.classList.remove('file-drop-success');
        }, 700);
        
        Events.fire('files-selected', {
            files: files,
            to: this._peer.id
        });
        this._onDragEnd();
    }

    _onDragOver() {
        this.$el.setAttribute('drop', 1);
    }

    _onDragEnd() {
        this.$el.removeAttribute('drop');
    }

    _onRightClick(e) {
        e.preventDefault();
        Events.fire('text-recipient', this._peer.id);
    }

    _onTouchStart(e) {
        // 检查是否启用了移动端增强功能
        if (window.mobileEnhancements && window.mobileEnhancements.isMobile) {
            // 移动端增强功能会处理触摸事件
            return;
        }
        
        this._touchStart = Date.now();
        this._touchTimer = setTimeout(_ => this._onTouchEnd(), 300);
    }

    _onTouchEnd(e) {
        // 检查是否启用了移动端增强功能
        if (window.mobileEnhancements && window.mobileEnhancements.isMobile) {
            // 移动端增强功能会处理触摸事件
            return;
        }
        
        if (Date.now() - this._touchStart < 300) {
            clearTimeout(this._touchTimer);
        } else { // this was a long tap
            if (e) e.preventDefault();
            Events.fire('text-recipient', this._peer.id);
        }
    }
}


class Dialog {
    constructor(id) {
        this.$el = $(id);
        this.$el.querySelectorAll('[close]').forEach(el => el.addEventListener('click', e => this.hide()))
        this.$autoFocus = this.$el.querySelector('[autofocus]');
        // 注册到对话框管理器
        DialogManager.register(this);
    }

    show() {
        // 关闭其他对话框
        DialogManager.closeAll();
        this.$el.setAttribute('show', 1);
        return new Promise(resolve => {
            // 优化对话框动画
            setTimeout(() => {
                const paper = this.$el.querySelector('x-paper');
                if (paper) paper.classList.add('dialog-entered');
                resolve();
            }, 50);
        });
    }

    hide() {
        this.$el.removeAttribute('show');
        // 重置对话框状态
        setTimeout(() => {
            const $paper = this.$el.querySelector('x-paper');
            if ($paper) $paper.classList.remove('dialog-entered');
        }, 300);
    }
    
    // 添加 close 方法，映射到 hide
    close() {
        this.hide();
    }
}

class ReceiveDialog extends Dialog {

    constructor() {
        super('receiveDialog');
        Events.on('file-received', e => {
            this._nextFile(e.detail);
            window.blop.play();
        });
        this._filesQueue = [];
    }

    _nextFile(nextFile) {
        if (nextFile) this._filesQueue.push(nextFile);
        if (this._busy) return;
        this._busy = true;
        const file = this._filesQueue.shift();
        this._displayFile(file);
    }

    _dequeueFile() {
        if (!this._filesQueue.length) { // nothing to do
            this._busy = false;
            return;
        }
        // dequeue next file
        setTimeout(_ => {
            this._busy = false;
            this._nextFile();
        }, 300);
    }

    _displayFile(file) {
        const $a = this.$el.querySelector('#download');
        const url = URL.createObjectURL(file.blob);
        $a.href = url;
        $a.download = file.name;

        if(this._autoDownload()){
            $a.click()
            return
        }
        if(file.mime.split('/')[0] === 'image'){
            console.log('the file is image');
            this.$el.querySelector('.preview').style.visibility = 'inherit';
            this.$el.querySelector("#img-preview").src = url;
        }

        // 添加预览按钮
        this._addPreviewButton(file);

        this.$el.querySelector('#fileName').textContent = file.name;
        this.$el.querySelector('#fileSize').textContent = this._formatFileSize(file.size);
        this.show();

        if (window.isDownloadSupported) return;
        // fallback for iOS
        $a.target = '_blank';
        const reader = new FileReader();
        reader.onload = e => $a.href = reader.result;
        reader.readAsDataURL(file.blob);
    }
    
    _addPreviewButton(file) {
        // 检查是否支持预览
        if (!window.filePreview) return;
        
        const fileType = file.mime || file.type;
        const isSupported = window.filePreview.supportedImageTypes.includes(fileType) ||
                           window.filePreview.supportedVideoTypes.includes(fileType) ||
                           window.filePreview.supportedAudioTypes.includes(fileType) ||
                           window.filePreview.supportedDocumentTypes.includes(fileType);
        
        if (!isSupported) return;
        
        // 移除之前的预览按钮
        const existingBtn = this.$el.querySelector('.preview-btn');
        if (existingBtn) existingBtn.remove();
        
        // 创建预览按钮
        const previewBtn = document.createElement('button');
        previewBtn.className = 'preview-btn';
        previewBtn.innerHTML = '👁️ 预览';
        previewBtn.style.cssText = `
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin: 8px 0;
            transition: background-color 0.2s;
        `;
        
        previewBtn.addEventListener('click', () => {
            // 创建File对象用于预览
            const previewFile = new File([file.blob], file.name, { type: file.mime });
            window.filePreview.open(previewFile, file.name);
        });
        
        // 将按钮插入到下载按钮之前
        const downloadBtn = this.$el.querySelector('#download');
        downloadBtn.parentNode.insertBefore(previewBtn, downloadBtn);
    }

    _formatFileSize(bytes) {
        if (bytes >= 1e9) {
            return (Math.round(bytes / 1e8) / 10) + ' GB';
        } else if (bytes >= 1e6) {
            return (Math.round(bytes / 1e5) / 10) + ' MB';
        } else if (bytes > 1000) {
            return Math.round(bytes / 1000) + ' KB';
        } else {
            return bytes + ' Bytes';
        }
    }

    hide() {
        this.$el.querySelector('.preview').style.visibility = 'hidden';
        this.$el.querySelector("#img-preview").src = "";
        
        // 清理预览按钮
        const previewBtn = this.$el.querySelector('.preview-btn');
        if (previewBtn) previewBtn.remove();
        
        super.hide();
        this._dequeueFile();
    }


    _autoDownload(){
        return !this.$el.querySelector('#autoDownload').checked
    }
}


class SendTextDialog extends Dialog {
    constructor() {
        super('sendTextDialog');
        Events.on('text-recipient', e => this._onRecipient(e.detail))
        this.$text = this.$el.querySelector('#textInput');
        const button = this.$el.querySelector('form');
        button.addEventListener('submit', e => this._send(e));
    }

    _onRecipient(recipient) {
        this._recipient = recipient;
        this._handleShareTargetText();
        this.show();

        const range = document.createRange();
        const sel = window.getSelection();

        range.selectNodeContents(this.$text);
        sel.removeAllRanges();
        sel.addRange(range);

    }

    _handleShareTargetText() {
        if (!window.shareTargetText) return;
        this.$text.textContent = window.shareTargetText;
        window.shareTargetText = '';
    }

    _send(e) {
        e.preventDefault();
        Events.fire('send-text', {
            to: this._recipient,
            text: this.$text.innerText
        });
    }
}

class ReceiveTextDialog extends Dialog {
    constructor() {
        super('receiveTextDialog');
        Events.on('text-received', e => this._onText(e.detail))
        this.$text = this.$el.querySelector('#text');
        const $copy = this.$el.querySelector('#copy');
        copy.addEventListener('click', _ => this._onCopy());
    }

    _onText(e) {
        this.$text.innerHTML = '';
        const text = e.text;
        if (isURL(text)) {
            const $a = document.createElement('a');
            $a.href = text;
            $a.target = '_blank';
            $a.textContent = text;
            this.$text.appendChild($a);
        } else {
            this.$text.textContent = text;
        }
        this.show();
        window.blop.play();
    }

    async _onCopy() {
        await navigator.clipboard.writeText(this.$text.textContent);
        Events.fire('notify-user', 'Copied to clipboard');
    }
}

class Toast extends Dialog {
    constructor() {
        super('toast');
        Events.on('notify-user', e => this._onNotfiy(e.detail));
    }

    _onNotfiy(message) {
        this.$el.querySelector('#toast-text').textContent = message;
        this.show();
        
        // 添加淡入淡出动画
        this.$el.classList.add('toast-shown');
        
        clearTimeout(this._hideTimeout);
        this._hideTimeout = setTimeout(_ => {
            this.$el.classList.remove('toast-shown');
            setTimeout(_ => this.hide(), 300);
        }, 3000);
    }
}


class Notifications {

    constructor() {
        // Check if the browser supports notifications
        if (!('Notification' in window)) return;

        // Check whether notification permissions have already been granted
        if (Notification.permission !== 'granted') {
            this.$button = $('notification');
            this.$button.removeAttribute('hidden');
            this.$button.addEventListener('click', e => this._requestPermission());
        }
        Events.on('text-received', e => this._messageNotification(e.detail.text));
        Events.on('file-received', e => this._downloadNotification(e.detail.name));
    }

    _requestPermission() {
        Notification.requestPermission(permission => {
            if (permission !== 'granted') {
                Events.fire('notify-user', Notifications.PERMISSION_ERROR || 'Error');
                return;
            }
            this._notify('Even more snappy sharing!');
            this.$button.setAttribute('hidden', 1);
        });
    }

    _notify(message, body, closeTimeout = 20000) {
        const config = {
            body: body,
            icon: '/images/logo_transparent_128x128.png',
        }
        let notification;
        try {
            notification = new Notification(message, config);
        } catch (e) {
            // Android doesn't support "new Notification" if service worker is installed
            if (!serviceWorker || !serviceWorker.showNotification) return;
            notification = serviceWorker.showNotification(message, config);
        }

        // Notification is persistent on Android. We have to close it manually
        if (closeTimeout) {
            setTimeout(_ => notification.close(), closeTimeout);
        }

        return notification;
    }

    _messageNotification(message) {
        if (isURL(message)) {
            const notification = this._notify(message, 'Click to open link');
            this._bind(notification, e => window.open(message, '_blank', null, true));
        } else {
            const notification = this._notify(message, 'Click to copy text');
            this._bind(notification, e => this._copyText(message, notification));
        }
    }

    _downloadNotification(message) {
        const notification = this._notify(message, 'Click to download');
        if (!window.isDownloadSupported) return;
        this._bind(notification, e => this._download(notification));
    }

    _download(notification) {
        document.querySelector('x-dialog [download]').click();
        notification.close();
    }

    _copyText(message, notification) {
        notification.close();
        if (!navigator.clipboard.writeText(message)) return;
        this._notify('Copied text to clipboard');
    }

    _bind(notification, handler) {
        if (notification.then) {
            notification.then(e => serviceWorker.getNotifications().then(notifications => {
                serviceWorker.addEventListener('notificationclick', handler);
            }));
        } else {
            notification.onclick = handler;
        }
    }
}


class NetworkStatusUI {

    constructor() {
        window.addEventListener('offline', e => this._showOfflineMessage(), false);
        window.addEventListener('online', e => this._showOnlineMessage(), false);
        if (!navigator.onLine) this._showOfflineMessage();
    }

    _showOfflineMessage() {
        Events.fire('notify-user', 'You are offline');
    }

    _showOnlineMessage() {
        Events.fire('notify-user', 'You are back online');
    }
}

class WebShareTargetUI {
    constructor() {
        const parsedUrl = new URL(window.location);
        const title = parsedUrl.searchParams.get('title');
        const text = parsedUrl.searchParams.get('text');
        const url = parsedUrl.searchParams.get('url');

        let shareTargetText = title ? title : '';
        shareTargetText += text ? shareTargetText ? ' ' + text : text : '';

        if(url) shareTargetText = url; // We share only the Link - no text. Because link-only text becomes clickable.

        if (!shareTargetText) return;
        window.shareTargetText = shareTargetText;
        history.pushState({}, 'URL Rewrite', '/');
        console.log('Shared Target Text:', '"' + shareTargetText + '"');
    }
}


class Snapdrop {
    constructor() {
        const server = new ServerConnection();
        const peers = new PeersManager(server);
        const peersUI = new PeersUI();
        Events.on('load', e => {
            const receiveDialog = new ReceiveDialog();
            const sendTextDialog = new SendTextDialog();
            const receiveTextDialog = new ReceiveTextDialog();
            const toast = new Toast();
            const notifications = new Notifications();
            const networkStatusUI = new NetworkStatusUI();
            const webShareTargetUI = new WebShareTargetUI();
            
            // Initialize Transfer History
            if (typeof TransferHistory !== 'undefined' && typeof TransferHistoryUI !== 'undefined') {
                const transferHistory = new TransferHistory();
                const transferHistoryUI = new TransferHistoryUI(transferHistory);
                
                // Set up history button click handler
                const historyBtn = document.getElementById('historyBtn');
                if (historyBtn) {
                    historyBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        transferHistoryUI.show();
                    });
                }
                
                // Listen for transfer events to record history
                Events.on('file-received', e => {
                    const detail = e.detail;
                    transferHistory.recordTransfer({
                        type: 'file',
                        direction: 'received',
                        fileName: detail.name,
                        fileSize: detail.size,
                        fileType: detail.type || 'unknown',
                        peerId: detail.sender,
                        peerName: detail.senderName || 'Unknown Device',
                        timestamp: Date.now(),
                        status: 'completed'
                    });
                });
                
                Events.on('files-selected', e => {
                    const detail = e.detail;
                    if (detail.files && detail.files.length > 0) {
                        detail.files.forEach(file => {
                            transferHistory.recordTransfer({
                                type: 'file',
                                direction: 'sent',
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type || 'unknown',
                                peerId: detail.to,
                                peerName: detail.toName || 'Unknown Device',
                                timestamp: Date.now(),
                                status: 'completed'
                            });
                        });
                    }
                });
                
                Events.on('text-received', e => {
                    const detail = e.detail;
                    transferHistory.recordTransfer({
                        type: 'text',
                        direction: 'received',
                        content: detail.text,
                        peerId: detail.sender,
                        peerName: detail.senderName || 'Unknown Device',
                        timestamp: Date.now(),
                        status: 'completed'
                    });
                });
                
                Events.on('send-text', e => {
                    const detail = e.detail;
                    transferHistory.recordTransfer({
                        type: 'text',
                        direction: 'sent',
                        content: detail.text,
                        peerId: detail.to,
                        peerName: detail.toName || 'Unknown Device',
                        timestamp: Date.now(),
                        status: 'completed'
                    });
                });
            }
        });
    }
}

const snapdrop = new Snapdrop();



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(serviceWorker => {
            console.log('Service Worker registered');
            window.serviceWorker = serviceWorker
        });
}

window.addEventListener('beforeinstallprompt', e => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        // don't display install banner when installed
        return e.preventDefault();
    } else {
        const btn = document.querySelector('#install')
        btn.hidden = false;
        btn.onclick = _ => e.prompt();
        return e.preventDefault();
    }
});

// Background Animation
Events.on('load', () => {
    let c = document.createElement('canvas');
    document.body.appendChild(c);
    let style = c.style;
    style.width = '100%';
    style.position = 'absolute';
    style.zIndex = -1;
    style.top = 0;
    style.left = 0;
    let ctx = c.getContext('2d');
    let x0, y0, w, h, dw;

    function init() {
        w = window.innerWidth;
        h = window.innerHeight;
        c.width = w;
        c.height = h;
        let offset = h > 380 ? 100 : 65;
        offset = h > 800 ? 116 : offset;
        x0 = w / 2;
        y0 = h - offset;
        dw = Math.max(w, h, 1000) / 13;
        drawCircles();
    }
    window.onresize = init;

    function drawCircle(radius) {
        ctx.beginPath();
        let color = Math.round(255 * (1 - radius / Math.max(w, h)));
        ctx.strokeStyle = 'rgba(' + color + ',' + color + ',' + color + ',0.1)';
        ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 2;
    }

    let step = 0;

    function drawCircles() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) {
            drawCircle(dw * i + step % dw);
        }
        step += 1;
    }

    let loading = true;

    function animate() {
        requestAnimationFrame(function() {
            drawCircles();
            animate();
        });
    }
    
    window.animateBackground = function(l) {
        loading = l;
        animate();
    };
    
    init();
    animate();
});

Notifications.PERMISSION_ERROR = `
Notifications permission has been blocked
as the user has dismissed the permission prompt several times.
This can be reset in Page Info
which can be accessed by clicking the lock icon next to the URL.`;

document.body.onclick = e => { // safari hack to fix audio
    document.body.onclick = null;
    if (!(/.*Version.*Safari.*/.test(navigator.userAgent))) return;
    blop.play();
}

// Initialize background animation
window.addEventListener('load', () => {
    // 设置背景动画为激活状态
    const bgAnimation = document.querySelector('.background-animation');
    if (bgAnimation) {
        bgAnimation.classList.add('animate');
    }
});

// 增强设备图标系统
const deviceIcons = {
    'desktop': {
        'windows': '#windows-desktop',
        'mac': '#desktop-mac',
        'linux': '#desktop-linux',
        'default': '#desktop-mac'
    },
    'mobile': {
        'android': '#phone-android',
        'ios': '#phone-iphone',
        'default': '#phone-iphone'
    },
    'tablet': {
        'android': '#tablet-android',
        'ios': '#tablet-mac',
        'default': '#tablet-mac'
    }
};

