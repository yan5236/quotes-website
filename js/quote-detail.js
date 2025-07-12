// 详情页面JavaScript逻辑

class QuoteDetail {
    constructor() {
        this.currentQuote = null;
        this.allQuotes = [];
        this.init();
    }

    async init() {
        try {
            // 从URL获取名言ID
            const quoteId = this.getQuoteIdFromURL();
            if (!quoteId) {
                this.showError();
                return;
            }

            // 加载所有名言数据
            await this.loadQuotes();
            
            // 查找指定的名言
            this.currentQuote = this.findQuoteById(quoteId);
            if (!this.currentQuote) {
                this.showError();
                return;
            }

            // 显示名言详情
            this.displayQuoteDetail();
            
            // 隐藏加载状态
            this.hideLoading();

            // 更新页面标题
            this.updatePageTitle();

        } catch (error) {
            console.error('加载名言详情失败:', error);
            this.showError();
        }
    }

    getQuoteIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('id'));
    }

    async loadQuotes() {
        try {
            const response = await fetch('/data/quotes.json');
            const data = await response.json();
            this.allQuotes = data.quotes;
        } catch (error) {
            throw new Error('无法加载名言数据');
        }
    }

    findQuoteById(id) {
        return this.allQuotes.find(quote => quote.id === id);
    }

    displayQuoteDetail() {
        const quote = this.currentQuote;
        
        // 设置名言内容
        document.getElementById('quote-text').textContent = quote.text;
        document.getElementById('quote-author').textContent = quote.author;
        document.getElementById('quote-source').textContent = quote.source;
        
        // 设置分类
        const categoryElement = document.getElementById('quote-category');
        categoryElement.textContent = this.getCategoryName(quote.category);
        categoryElement.className = `category-tag category-${quote.category}`;
        
        // 设置标签
        const tagsContainer = document.getElementById('quote-tags');
        tagsContainer.innerHTML = '';
        quote.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            tagElement.onclick = () => this.searchByTag(tag);
            tagsContainer.appendChild(tagElement);
        });
        
        // 设置创建时间
        const date = new Date(quote.createdAt);
        document.getElementById('quote-date').textContent = date.toLocaleDateString('zh-CN');
    }

    getCategoryName(category) {
        const categoryMap = {
            'game': '游戏',
            'movie': '影视',
            'anime': '动漫',
            'celebrity': '名人'
        };
        return categoryMap[category] || '未分类';
    }


    searchByTag(tag) {
        window.location.href = `index.html?search=${encodeURIComponent(tag)}`;
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('quote-detail').style.display = 'block';
    }

    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error-message').style.display = 'block';
    }

    updatePageTitle() {
        document.title = `${this.currentQuote.text.substring(0, 30)}... - 名言详情`;
    }
}

// 分享功能
function shareQuote() {
    const modal = document.getElementById('share-modal');
    const shareContent = document.getElementById('share-content');
    const quote = window.quoteDetailInstance.currentQuote;
    
    const shareText = `"${quote.text}" —— ${quote.author}
来源：${quote.source}
查看详情：${window.location.href}

#名言名句 #${quote.category} ${quote.tags.map(tag => '#' + tag).join(' ')}`;
    
    shareContent.value = shareText;
    modal.classList.add('active');
}

function closeShareModal() {
    document.getElementById('share-modal').classList.remove('active');
}

function copyToClipboard() {
    const shareContent = document.getElementById('share-content');
    shareContent.select();
    document.execCommand('copy');
    
    // 简单的提示
    const button = event.target.closest('.share-option');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="icon">✅</span>已复制';
    
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 2000);
}

function shareToWeibo() {
    const shareText = document.getElementById('share-content').value;
    const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function shareToQQ() {
    const shareText = document.getElementById('share-content').value;
    const url = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

// 点击模态框外部关闭
document.addEventListener('click', function(event) {
    const modal = document.getElementById('share-modal');
    if (event.target === modal) {
        closeShareModal();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.quoteDetailInstance = new QuoteDetail();
});

// 键盘快捷键
document.addEventListener('keydown', function(event) {
    // ESC键关闭分享弹窗
    if (event.key === 'Escape') {
        closeShareModal();
    }
    
    // Ctrl+C 或 Cmd+C 复制分享内容
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        const modal = document.getElementById('share-modal');
        if (modal.classList.contains('active')) {
            copyToClipboard();
            event.preventDefault();
        }
    }
});