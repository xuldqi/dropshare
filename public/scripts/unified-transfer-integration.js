/**
 * 统一传送集成加载器 - 一键加载所有传送功能组件
 * 简化集成过程，确保所有组件正确加载和初始化
 */
(function() {
    'use strict';
    
    const INTEGRATION_CONFIG = {
        version: '1.0.0',
        debugMode: false,
        autoInit: true,
        components: [
            'transfer-manager.js',
            'unified-device-selector.js', 
            'file-processor-integration.js'
        ]
    };
    
    class UnifiedTransferIntegration {
        constructor() {
            this.isInitialized = false;
            this.loadedComponents = new Set();
            this.initPromise = null;
            
            console.log('🔧 UnifiedTransferIntegration starting...');
        }
        
        /**
         * 初始化统一传送集成
         */
        async init() {
            if (this.initPromise) {
                return this.initPromise;
            }
            
            this.initPromise = this._performInit();
            return this.initPromise;
        }
        
        async _performInit() {
            try {
                console.log('🚀 Starting unified transfer integration...');
                
                // 步骤1：加载所有组件脚本
                await this.loadComponents();
                
                // 步骤2：等待DOM准备就绪
                await this.waitForDOM();
                
                // 步骤3：初始化组件
                await this.initializeComponents();
                
                // 步骤4：设置全局访问接口
                this.setupGlobalInterface();
                
                this.isInitialized = true;
                console.log('✅ Unified transfer integration complete!');
                
                // 触发初始化完成事件
                this.dispatchEvent('unified-transfer-ready');
                
            } catch (error) {
                console.error('❌ Unified transfer integration failed:', error);
                throw error;
            }
        }
        
        /**
         * 加载所有组件脚本
         */
        async loadComponents() {
            console.log('📦 Loading transfer components...');
            
            const baseUrl = this.getScriptsBaseUrl();
            const loadPromises = INTEGRATION_CONFIG.components.map(component => 
                this.loadScript(baseUrl + component)
            );
            
            await Promise.all(loadPromises);
            console.log('✅ All components loaded');
        }
        
        /**
         * 获取脚本基础URL
         */
        getScriptsBaseUrl() {
            const currentScript = document.currentScript;
            if (currentScript) {
                const scriptUrl = currentScript.src;
                return scriptUrl.substring(0, scriptUrl.lastIndexOf('/') + 1);
            }
            
            // 回退到默认路径
            return './scripts/';
        }
        
        /**
         * 加载单个脚本
         */
        loadScript(src) {
            return new Promise((resolve, reject) => {
                // 检查是否已加载
                if (this.loadedComponents.has(src)) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                
                script.onload = () => {
                    this.loadedComponents.add(src);
                    console.log(`✅ Loaded: ${src}`);
                    resolve();
                };
                
                script.onerror = () => {
                    console.error(`❌ Failed to load: ${src}`);
                    reject(new Error(`Failed to load script: ${src}`));
                };
                
                document.head.appendChild(script);
            });
        }
        
        /**
         * 等待DOM准备就绪
         */
        waitForDOM() {
            return new Promise(resolve => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }
        
        /**
         * 初始化组件
         */
        async initializeComponents() {
            console.log('🔧 Initializing components...');
            
            // 等待组件类可用
            await this.waitForClasses();
            
            // 初始化传送管理器
            if (!window.globalTransferManager) {
                window.globalTransferManager = new window.TransferManager();
                console.log('✅ TransferManager initialized');
            }
            
            // 初始化设备选择器
            if (!window.globalDeviceSelector) {
                window.globalDeviceSelector = new window.UnifiedDeviceSelector(window.globalTransferManager);
                console.log('✅ UnifiedDeviceSelector initialized');
            }
            
            // 初始化文件处理集成
            if (typeof window.initFileProcessorIntegration === 'function') {
                window.globalFileProcessorIntegration = window.initFileProcessorIntegration();
                console.log('✅ FileProcessorIntegration initialized');
            }
        }
        
        /**
         * 等待所有必需的类可用
         */
        waitForClasses() {
            return new Promise((resolve) => {
                const checkClasses = () => {
                    const requiredClasses = ['TransferManager', 'UnifiedDeviceSelector', 'FileProcessorIntegration'];
                    const allAvailable = requiredClasses.every(className => typeof window[className] !== 'undefined');
                    
                    if (allAvailable) {
                        resolve();
                    } else {
                        setTimeout(checkClasses, 100);
                    }
                };
                
                checkClasses();
            });
        }
        
        /**
         * 设置全局访问接口
         */
        setupGlobalInterface() {
            // 创建统一的API接口
            window.DropShareTransfer = {
                // 显示设备选择器
                showDeviceSelector: (files) => {
                    if (window.globalDeviceSelector) {
                        window.globalDeviceSelector.show(files);
                    } else {
                        console.error('❌ DeviceSelector not available');
                    }
                },
                
                // 直接发送文件
                sendFiles: async (files, deviceIds) => {
                    if (window.globalTransferManager) {
                        return await window.globalTransferManager.sendToDevices(files, deviceIds);
                    } else {
                        throw new Error('TransferManager not available');
                    }
                },
                
                // 获取在线设备
                getDevices: () => {
                    if (window.globalTransferManager) {
                        return window.globalTransferManager.getOnlineDevices();
                    } else {
                        return [];
                    }
                },
                
                // 检查是否已初始化
                isReady: () => this.isInitialized,
                
                // 版本信息
                version: INTEGRATION_CONFIG.version
            };
            
            console.log('🌐 Global API interface created: window.DropShareTransfer');
        }
        
        /**
         * 触发自定义事件
         */
        dispatchEvent(eventType, data = null) {
            const event = new CustomEvent(eventType, {
                detail: data,
                bubbles: true
            });
            document.dispatchEvent(event);
        }
        
        /**
         * 添加传送按钮到指定元素
         */
        addTransferButtonTo(element, fileInfo) {
            if (!this.isInitialized) {
                console.warn('⚠️ Transfer integration not ready yet');
                return null;
            }
            
            const button = document.createElement('button');
            button.className = 'unified-transfer-btn';
            button.innerHTML = `
                <span class="transfer-icon">📤</span>
                <span class="transfer-text">传送到设备</span>
            `;
            
            button.addEventListener('click', () => {
                window.DropShareTransfer.showDeviceSelector(fileInfo);
            });
            
            element.appendChild(button);
            return button;
        }
    }
    
    // 创建全局实例
    const integration = new UnifiedTransferIntegration();
    window.unifiedTransferIntegration = integration;
    
    // 自动初始化（如果配置允许）
    if (INTEGRATION_CONFIG.autoInit) {
        // 稍微延迟一下，确保页面基本加载完成
        setTimeout(() => {
            integration.init().catch(error => {
                console.error('❌ Auto-init failed:', error);
            });
        }, 500);
    }
    
    // 提供手动初始化的接口
    window.initDropShareTransfer = function() {
        return integration.init();
    };
    
    // 兼容性检查
    if (typeof Promise === 'undefined') {
        console.error('❌ DropShare Transfer requires Promise support');
    }
    
    console.log('📦 Unified Transfer Integration loader ready');
    
})();
