// API接口模块
class APIManager {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.endpoints = {
            random: '/api/quotes/random',
            category: '/api/quotes/category',
            search: '/api/quotes/search',
            all: '/api/quotes/all',
            add: '/api/quotes',
            stats: '/api/quotes/stats'
        };
    }

    // 真实的API调用
    async makeAPICall(endpoint, params = {}) {
        let url;
        
        // 如果endpoint已经是完整的URL路径，直接使用
        if (endpoint.startsWith('/api/')) {
            url = this.baseURL + endpoint;
        } else {
            url = this.baseURL + endpoint;
        }
        
        // 处理特殊的URL参数
        if (endpoint.includes('/category/') && params.category) {
            url = `${this.baseURL}/api/quotes/category/${params.category}`;
        } else if (endpoint.includes('/search') && params.q) {
            url = `${this.baseURL}/api/quotes/search?q=${encodeURIComponent(params.q)}`;
        }

        try {
            console.log(`🌐 发起API请求: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ API响应:', data);
            return data;
        } catch (error) {
            console.error('❌ API调用失败:', error);
            throw new Error(`API调用失败: ${error.message}`);
        }
    }

    // 获取随机名言
    getRandomQuote() {
        const quote = window.quotesManager.getRandomQuote();
        return {
            success: true,
            data: quote,
            message: '成功获取随机名言'
        };
    }

    // 按分类获取名言
    getQuotesByCategory(category) {
        const quotes = window.quotesManager.getQuotesByCategory(category);
        return {
            success: true,
            data: quotes,
            total: quotes.length,
            category: category,
            message: `成功获取${category}分类的名言`
        };
    }

    // 搜索名言
    searchQuotes(keyword) {
        const quotes = window.quotesManager.searchQuotes(keyword);
        return {
            success: true,
            data: quotes,
            total: quotes.length,
            keyword: keyword,
            message: `搜索到${quotes.length}条相关名言`
        };
    }

    // 获取所有名言
    getAllQuotes() {
        const quotes = window.quotesManager.getAllQuotes();
        return {
            success: true,
            data: quotes,
            total: quotes.length,
            message: '成功获取所有名言'
        };
    }

    // 获取统计信息
    getStats() {
        const stats = window.quotesManager.getStats();
        return {
            success: true,
            data: stats,
            message: '成功获取统计信息'
        };
    }

    // 添加名言
    async addQuote(quoteData) {
        try {
            const newQuote = window.quotesManager.addQuote(quoteData);
            return {
                success: true,
                data: newQuote,
                message: '名言添加成功'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: '名言添加失败'
            };
        }
    }

    // 格式化API响应
    formatResponse(data) {
        return JSON.stringify(data, null, 2);
    }

    // 生成API文档
    generateAPIDoc() {
        return {
            title: "名言名句 API 文档",
            version: "1.0.0",
            baseURL: window.location.origin,
            endpoints: [
                {
                    path: "/api/quotes/random",
                    method: "GET",
                    description: "获取随机名言",
                    parameters: [],
                    response: {
                        success: true,
                        data: {
                            id: "名言ID",
                            text: "名言内容",
                            author: "作者",
                            source: "来源",
                            category: "分类",
                            tags: ["标签1", "标签2"]
                        }
                    }
                },
                {
                    path: "/api/quotes/category/{category}",
                    method: "GET",
                    description: "按分类获取名言",
                    parameters: [
                        {
                            name: "category",
                            type: "string",
                            required: true,
                            description: "分类名称 (game, movie, anime, celebrity)"
                        }
                    ],
                    response: {
                        success: true,
                        data: ["名言数组"],
                        total: "总数量",
                        category: "分类名称"
                    }
                },
                {
                    path: "/api/quotes/search",
                    method: "GET",
                    description: "搜索名言",
                    parameters: [
                        {
                            name: "q",
                            type: "string",
                            required: true,
                            description: "搜索关键词"
                        }
                    ],
                    response: {
                        success: true,
                        data: ["搜索结果数组"],
                        total: "结果数量",
                        keyword: "搜索关键词"
                    }
                },
                {
                    path: "/api/quotes/all",
                    method: "GET",
                    description: "获取所有名言",
                    parameters: [],
                    response: {
                        success: true,
                        data: ["所有名言数组"],
                        total: "总数量"
                    }
                },
                {
                    path: "/api/quotes/stats",
                    method: "GET",
                    description: "获取统计信息",
                    parameters: [],
                    response: {
                        success: true,
                        data: {
                            total: "总数量",
                            game: "游戏类数量",
                            movie: "影视类数量",
                            anime: "动漫类数量",
                            celebrity: "名人类数量"
                        }
                    }
                }
            ]
        };
    }
}

// 创建全局API管理器实例
window.apiManager = new APIManager();

// API测试函数
async function testRandomQuote() {
    const resultDiv = document.getElementById('random-result');
    const count = document.getElementById('random-count').value;
    resultDiv.innerHTML = '<div class="loading"></div>';
    
    try {
        let url = '/api/quotes/random';
        if (count && count > 1) {
            url += `?count=${count}`;
        }
        const response = await window.apiManager.makeAPICall(url);
        resultDiv.innerHTML = `<pre>${window.apiManager.formatResponse(response)}</pre>`;
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">错误: ${error.message}</div>`;
    }
}

async function testCategoryQuotes() {
    const category = document.getElementById('category-select').value;
    const resultDiv = document.getElementById('category-result');
    resultDiv.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await window.apiManager.makeAPICall('/api/quotes/category/', { category });
        resultDiv.innerHTML = `<pre>${window.apiManager.formatResponse(response)}</pre>`;
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">错误: ${error.message}</div>`;
    }
}

async function testSearchQuotes() {
    const keyword = document.getElementById('search-keyword').value;
    const resultDiv = document.getElementById('search-result');
    
    if (!keyword.trim()) {
        resultDiv.innerHTML = '<div class="error">请输入搜索关键词</div>';
        return;
    }
    
    resultDiv.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await window.apiManager.makeAPICall('/api/quotes/search', { q: keyword });
        resultDiv.innerHTML = `<pre>${window.apiManager.formatResponse(response)}</pre>`;
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">错误: ${error.message}</div>`;
    }
}

// 统计API测试函数
async function testStatsAPI() {
    const resultDiv = document.getElementById('stats-result');
    resultDiv.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await window.apiManager.makeAPICall('/api/quotes/stats');
        resultDiv.innerHTML = `<pre>${window.apiManager.formatResponse(response)}</pre>`;
    } catch (error) {
        resultDiv.innerHTML = `<div class="error">错误: ${error.message}</div>`;
    }
}

// 高级API功能
class AdvancedAPI {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    }

    // 缓存API响应
    async cachedRequest(endpoint, params = {}) {
        const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const response = await window.apiManager.simulateAPICall(endpoint, params);
        this.cache.set(cacheKey, {
            data: response,
            timestamp: Date.now()
        });

        return response;
    }

    // 批量请求
    async batchRequest(requests) {
        const results = await Promise.allSettled(
            requests.map(req => window.apiManager.simulateAPICall(req.endpoint, req.params))
        );

        return results.map((result, index) => ({
            request: requests[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null
        }));
    }

    // 分页请求
    async paginatedRequest(endpoint, params = {}, page = 1, limit = 10) {
        const response = await window.apiManager.simulateAPICall(endpoint, params);
        
        if (response.success && Array.isArray(response.data)) {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = response.data.slice(startIndex, endIndex);
            
            return {
                ...response,
                data: paginatedData,
                pagination: {
                    page,
                    limit,
                    total: response.data.length,
                    totalPages: Math.ceil(response.data.length / limit)
                }
            };
        }

        return response;
    }

    // 清除缓存
    clearCache() {
        this.cache.clear();
    }
}

// 创建高级API实例
window.advancedAPI = new AdvancedAPI();