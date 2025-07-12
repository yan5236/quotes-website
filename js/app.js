// 主应用程序
class App {
    constructor() {
        this.version = '1.0.0';
        this.init();
    }

    async init() {
        try {
            // 等待所有管理器初始化完成
            await this.waitForManagers();
            
            // 初始化应用
            this.setupApp();
            
            // 加载初始数据
            await this.loadInitialData();
            
            // 设置事件监听
            this.setupEventListeners();
            
            console.log('名言名句网站初始化完成！');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试。');
        }
    }

    // 等待管理器初始化
    async waitForManagers() {
        const checkManagers = () => {
            return window.quotesManager && 
                   window.uiManager && 
                   window.apiManager &&
                   window.advancedAPI;
        };

        if (checkManagers()) {
            return;
        }

        // 等待管理器加载
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (checkManagers()) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    // 设置应用
    setupApp() {
        // 设置页面标题
        document.title = '名言名句 - 游戏·影视·动漫·名人语录';
        
        // 设置版本信息
        this.addVersionInfo();
        
        // 设置键盘快捷键
        this.setupKeyboardShortcuts();
        
        // 设置主题
        this.setupTheme();
    }

    // 加载初始数据
    async loadInitialData() {
        // 等待数据管理器初始化完成
        if (window.quotesManager) {
            await window.quotesManager.init();
            
            // 检查URL参数
            this.handleURLParams();
            
            // 渲染初始名言
            if (window.uiManager) {
                window.uiManager.renderQuotes();
            }
        }
    }

    // 处理URL参数
    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        if (searchQuery && window.quotesManager && window.uiManager) {
            // 设置搜索词
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = decodeURIComponent(searchQuery);
            }
            
            // 执行搜索
            window.quotesManager.setSearch(decodeURIComponent(searchQuery));
            window.uiManager.renderQuotes();
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.onPageVisible();
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.onWindowResize();
        }, 250));

        // 页面卸载前
        window.addEventListener('beforeunload', () => {
            this.onBeforeUnload();
        });

        // 错误处理
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });

        // 键盘事件
        document.addEventListener('keydown', (event) => {
            this.handleKeyboard(event);
        });
    }

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        this.shortcuts = {
            'ctrl+k': () => this.focusSearch(),
            'ctrl+h': () => this.showTab('home'),
            'ctrl+a': () => this.showTab('api'),
            'ctrl+r': () => this.refreshQuotes(),
            'esc': () => this.clearSearch()
        };
    }

    // 设置主题
    setupTheme() {
        // 检查用户偏好的主题
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // 添加版本信息
    addVersionInfo() {
        const footer = document.querySelector('.footer p');
        if (footer) {
            footer.innerHTML += ` | v${this.version}`;
        }
    }

    // 页面可见时的处理
    onPageVisible() {
        // 检查是否需要更新数据
        if (window.quotesManager && window.uiManager) {
            window.uiManager.renderQuotes();
        }
    }

    // 窗口大小变化处理
    onWindowResize() {
        // 响应式处理
        if (window.uiManager) {
            window.uiManager.renderQuotes();
        }
    }

    // 页面卸载前处理
    onBeforeUnload() {
        // 保存当前状态
        const state = {
            currentTab: window.uiManager ? window.uiManager.currentTab : 'home',
            currentFilter: window.quotesManager ? window.quotesManager.currentFilter : 'all',
            currentPage: window.quotesManager ? window.quotesManager.currentPage : 1
        };
        
        sessionStorage.setItem('appState', JSON.stringify(state));
    }

    // 恢复应用状态
    restoreState() {
        const savedState = sessionStorage.getItem('appState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                // 恢复标签页
                if (state.currentTab && window.uiManager) {
                    window.uiManager.showTab(state.currentTab);
                }
                
                // 恢复过滤器
                if (state.currentFilter && window.quotesManager) {
                    window.quotesManager.setFilter(state.currentFilter);
                }
                
                // 恢复页码
                if (state.currentPage && window.quotesManager) {
                    window.quotesManager.setPage(state.currentPage);
                }
                
            } catch (error) {
                console.error('恢复状态失败:', error);
            }
        }
    }

    // 处理键盘事件
    handleKeyboard(event) {
        const key = event.key.toLowerCase();
        const ctrl = event.ctrlKey || event.metaKey;
        const alt = event.altKey;
        
        let shortcut = '';
        if (ctrl) shortcut += 'ctrl+';
        if (alt) shortcut += 'alt+';
        shortcut += key;

        if (this.shortcuts[shortcut]) {
            event.preventDefault();
            this.shortcuts[shortcut]();
        }
    }

    // 快捷键功能
    focusSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }


    showTab(tab) {
        if (window.uiManager) {
            window.uiManager.showTab(tab);
        }
    }

    refreshQuotes() {
        if (window.uiManager) {
            window.uiManager.renderQuotes();
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = '';
            if (window.quotesManager) {
                window.quotesManager.setSearch('');
            }
            if (window.uiManager) {
                window.uiManager.renderQuotes();
            }
        }
    }

    // 错误处理
    handleError(error) {
        console.error('应用错误:', error);
        
        // 显示错误信息给用户
        this.showError('发生了一个错误，请重试。');
        
        // 可以在这里添加错误上报逻辑
    }

    // 显示错误信息
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #fecaca;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 实用工具函数
    utils = {
        // 生成随机ID
        generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
        
        // 格式化日期
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        // 截断文本
        truncateText: (text, maxLength) => {
            if (text.length <= maxLength) return text;
            return text.substr(0, maxLength) + '...';
        },
        
        // 验证邮箱
        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        // 深拷贝
        deepClone: (obj) => {
            return JSON.parse(JSON.stringify(obj));
        },
        
        // 检查是否为移动设备
        isMobile: () => {
            return window.innerWidth <= 768;
        }
    };
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// 导出给其他模块使用
window.App = App;