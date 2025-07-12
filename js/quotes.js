// 名言数据管理模块
class QuotesManager {
    constructor() {
        this.quotes = [];
        this.currentPage = 1;
        this.quotesPerPage = 6;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.init();
    }

    async init() {
        await this.loadQuotes();
        this.loadFromLocalStorage();
    }

    // 加载初始数据
    async loadQuotes() {
        try {
            const response = await fetch('data/quotes.json');
            const data = await response.json();
            if (this.quotes.length === 0) {
                this.quotes = data.quotes || [];
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.log('加载初始数据失败，使用默认数据');
            if (this.quotes.length === 0) {
                this.quotes = this.getDefaultQuotes();
                this.saveToLocalStorage();
            }
        }
    }

    // 默认数据
    getDefaultQuotes() {
        return [
            {
                id: Date.now() + Math.random(),
                text: "即使是一小步，也是向着目标前进。",
                author: "林克",
                source: "塞尔达传说：旷野之息",
                category: "game",
                tags: ["勇气", "冒险", "成长"],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + Math.random() + 1,
                text: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。",
                author: "阿甘",
                source: "阿甘正传",
                category: "movie",
                tags: ["人生", "哲理", "经典"],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + Math.random() + 2,
                text: "相信你自己的力量！",
                author: "漩涡鸣人",
                source: "火影忍者",
                category: "anime",
                tags: ["信念", "友情", "热血"],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + Math.random() + 3,
                text: "成功是从失败走向失败，却能保持热情的能力。",
                author: "温斯顿·丘吉尔",
                source: "政治演讲",
                category: "celebrity",
                tags: ["成功", "坚持", "智慧"],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + Math.random() + 4,
                text: "我们都有光明的未来，我们都有光明的前途。",
                author: "格拉德斯",
                source: "最终幻想XIII",
                category: "game",
                tags: ["希望", "未来", "光明"],
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + Math.random() + 5,
                text: "有些时候，人生需要勇敢地转身。",
                author: "艾莎",
                source: "冰雪奇缘",
                category: "movie",
                tags: ["勇气", "改变", "成长"],
                createdAt: new Date().toISOString()
            }
        ];
    }

    // 保存到本地存储
    saveToLocalStorage() {
        localStorage.setItem('quotes', JSON.stringify(this.quotes));
    }

    // 从本地存储加载
    loadFromLocalStorage() {
        const saved = localStorage.getItem('quotes');
        if (saved) {
            this.quotes = JSON.parse(saved);
        }
    }

    // 添加新名言
    addQuote(quoteData) {
        const newQuote = {
            id: Date.now() + Math.random(),
            text: quoteData.text.trim(),
            author: quoteData.author.trim(),
            source: quoteData.source.trim(),
            category: quoteData.category,
            tags: quoteData.tags ? quoteData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            createdAt: new Date().toISOString()
        };

        this.quotes.unshift(newQuote);
        this.saveToLocalStorage();
        return newQuote;
    }

    // 删除名言
    deleteQuote(id) {
        this.quotes = this.quotes.filter(quote => quote.id !== id);
        this.saveToLocalStorage();
    }

    // 获取所有名言
    getAllQuotes() {
        return [...this.quotes];
    }

    // 根据分类获取名言
    getQuotesByCategory(category) {
        if (category === 'all') return this.getAllQuotes();
        return this.quotes.filter(quote => quote.category === category);
    }

    // 搜索名言
    searchQuotes(keyword) {
        if (!keyword.trim()) return this.getAllQuotes();
        
        const searchTerm = keyword.toLowerCase();
        return this.quotes.filter(quote => 
            quote.text.toLowerCase().includes(searchTerm) ||
            quote.author.toLowerCase().includes(searchTerm) ||
            quote.source.toLowerCase().includes(searchTerm) ||
            quote.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // 获取随机名言
    getRandomQuote() {
        if (this.quotes.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.quotes.length);
        return this.quotes[randomIndex];
    }

    // 获取过滤后的名言
    getFilteredQuotes() {
        let filtered = this.quotes;

        // 应用分类过滤
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(quote => quote.category === this.currentFilter);
        }

        // 应用搜索过滤
        if (this.currentSearch.trim()) {
            const searchTerm = this.currentSearch.toLowerCase();
            filtered = filtered.filter(quote => 
                quote.text.toLowerCase().includes(searchTerm) ||
                quote.author.toLowerCase().includes(searchTerm) ||
                quote.source.toLowerCase().includes(searchTerm) ||
                quote.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        return filtered;
    }

    // 获取分页数据
    getPaginatedQuotes() {
        const filtered = this.getFilteredQuotes();
        const totalPages = Math.ceil(filtered.length / this.quotesPerPage);
        const startIndex = (this.currentPage - 1) * this.quotesPerPage;
        const endIndex = startIndex + this.quotesPerPage;
        
        return {
            quotes: filtered.slice(startIndex, endIndex),
            currentPage: this.currentPage,
            totalPages: totalPages,
            totalQuotes: filtered.length
        };
    }

    // 设置过滤器
    setFilter(category) {
        this.currentFilter = category;
        this.currentPage = 1;
    }

    // 设置搜索关键词
    setSearch(keyword) {
        this.currentSearch = keyword;
        this.currentPage = 1;
    }

    // 设置当前页
    setPage(page) {
        const filtered = this.getFilteredQuotes();
        const totalPages = Math.ceil(filtered.length / this.quotesPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    // 下一页
    nextPage() {
        const filtered = this.getFilteredQuotes();
        const totalPages = Math.ceil(filtered.length / this.quotesPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            return true;
        }
        return false;
    }

    // 上一页
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return true;
        }
        return false;
    }

    // 获取统计信息
    getStats() {
        const stats = {
            total: this.quotes.length,
            game: 0,
            movie: 0,
            anime: 0,
            celebrity: 0
        };

        this.quotes.forEach(quote => {
            if (stats.hasOwnProperty(quote.category)) {
                stats[quote.category]++;
            }
        });

        return stats;
    }

    // 导出数据
    exportData() {
        return {
            quotes: this.quotes,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // 导入数据
    importData(data) {
        try {
            if (data.quotes && Array.isArray(data.quotes)) {
                this.quotes = data.quotes;
                this.saveToLocalStorage();
                return true;
            }
        } catch (error) {
            console.error('导入数据失败:', error);
        }
        return false;
    }
}

// 创建全局实例
window.quotesManager = new QuotesManager();