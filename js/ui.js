// UI交互管理模块
class UIManager {
    constructor() {
        this.currentTab = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showTab('home');
    }

    // 绑定事件
    bindEvents() {
        // 导航标签切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
            });
        });

        // 分类过滤
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setActiveFilter(e.target);
                window.quotesManager.setFilter(category);
                this.renderQuotes();
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // 分页功能
        document.getElementById('prev-btn').addEventListener('click', () => {
            if (window.quotesManager.prevPage()) {
                this.renderQuotes();
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            if (window.quotesManager.nextPage()) {
                this.renderQuotes();
            }
        });

    }

    // 显示标签页
    showTab(tabName) {
        // 隐藏所有标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // 移除所有导航按钮的活动状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示目标标签内容
        document.getElementById(tabName).classList.add('active');
        
        // 设置导航按钮活动状态
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        this.currentTab = tabName;

        // 如果切换到首页，刷新名言显示
        if (tabName === 'home') {
            this.renderQuotes();
        }
    }

    // 设置活动过滤器
    setActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // 执行搜索
    performSearch() {
        const keyword = document.getElementById('search-input').value;
        window.quotesManager.setSearch(keyword);
        this.renderQuotes();
    }

    // 渲染名言列表
    renderQuotes() {
        const container = document.getElementById('quotes-container');
        const data = window.quotesManager.getPaginatedQuotes();
        
        // 清空容器
        container.innerHTML = '';

        if (data.quotes.length === 0) {
            container.innerHTML = `
                <div class="no-quotes">
                    <p>没有找到符合条件的名言</p>
                    <p>试试其他搜索词或添加新的名言吧！</p>
                </div>
            `;
            this.updatePagination(data);
            return;
        }

        // 渲染名言卡片
        data.quotes.forEach(quote => {
            const card = this.createQuoteCard(quote);
            container.appendChild(card);
        });

        // 更新分页
        this.updatePagination(data);

        // 添加动画效果
        this.animateCards();
    }

    // 创建名言卡片
    createQuoteCard(quote) {
        const card = document.createElement('div');
        card.className = 'quote-card';
        
        const tagsHtml = quote.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');

        card.innerHTML = `
            <div class="quote-text">${quote.text}</div>
            <div class="quote-author">—— ${quote.author}</div>
            <div class="quote-source">《${quote.source}》</div>
            <div class="quote-tags">${tagsHtml}</div>
            <div class="quote-actions">
                <button class="detail-btn" onclick="window.location.href='quote-detail.html?id=${quote.id}'">
                    <span class="icon">📖</span>
                    详情
                </button>
                <button class="share-btn" onclick="uiManager.shareQuote(${JSON.stringify(quote).replace(/"/g, '&quot;')})">
                    <span class="icon">🔗</span>
                    分享
                </button>
            </div>
        `;

        return card;
    }

    // 更新分页信息
    updatePagination(data) {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const pageInfo = document.getElementById('page-info');

        prevBtn.disabled = data.currentPage <= 1;
        nextBtn.disabled = data.currentPage >= data.totalPages;
        
        pageInfo.textContent = `第 ${data.currentPage} 页，共 ${data.totalPages} 页`;
    }

    // 卡片动画
    animateCards() {
        const cards = document.querySelectorAll('.quote-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }


    // 显示消息
    showMessage(message, type = 'info') {
        // 移除已存在的消息
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#fef2f2' : '#dcfce7'};
            color: ${type === 'error' ? '#dc2626' : '#166534'};
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'};
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;

        // 添加到页面
        document.body.appendChild(messageEl);

        // 自动移除消息
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // 显示加载状态
    showLoading(container) {
        container.innerHTML = '<div class="loading"></div><p>加载中...</p>';
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 复制文本到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('已复制到剪贴板！', 'success');
        } catch (error) {
            console.error('复制失败:', error);
            this.showMessage('复制失败！', 'error');
        }
    }

    // 分享名言
    shareQuote(quote) {
        const shareText = `"${quote.text}" —— ${quote.author}《${quote.source}》`;
        
        if (navigator.share) {
            navigator.share({
                title: '分享名言',
                text: shareText,
                url: window.location.href
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    // 导出数据
    exportQuotes() {
        const data = window.quotesManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage('数据导出成功！', 'success');
    }

    // 导入数据
    importQuotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (window.quotesManager.importData(data)) {
                    this.showMessage('数据导入成功！', 'success');
                    this.renderQuotes();
                } else {
                    this.showMessage('导入失败，文件格式不正确！', 'error');
                }
            } catch (error) {
                this.showMessage('导入失败，文件格式不正确！', 'error');
                console.error('导入失败:', error);
            }
        };
        reader.readAsText(file);
    }
}

// 创建全局UI管理器实例
window.uiManager = new UIManager();