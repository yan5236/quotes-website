const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'quotes.json');

// 读取数据
async function readQuotes() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取数据失败:', error);
        return { quotes: [], categories: [], tags: [], meta: {} };
    }
}

// 写入数据
async function writeQuotes(data) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('写入数据失败:', error);
        return false;
    }
}

// API路由

// 获取随机名言
app.get('/api/quotes/random', async (req, res) => {
    try {
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        if (quotes.length === 0) {
            return res.status(404).json({
                success: false,
                message: '没有找到名言'
            });
        }
        
        // 获取数量参数，默认为1，最大10
        const count = Math.min(parseInt(req.query.count) || 1, 10);
        
        if (count === 1) {
            // 返回单个随机名言
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const randomQuote = quotes[randomIndex];
            
            res.json({
                success: true,
                data: randomQuote,
                count: 1,
                message: '成功获取随机名言'
            });
        } else {
            // 返回多个随机名言
            const shuffled = [...quotes].sort(() => 0.5 - Math.random());
            const selectedQuotes = shuffled.slice(0, Math.min(count, quotes.length));
            
            res.json({
                success: true,
                data: selectedQuotes,
                count: selectedQuotes.length,
                requested: count,
                message: `成功获取${selectedQuotes.length}条随机名言`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 按分类获取名言
app.get('/api/quotes/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        let filteredQuotes;
        if (category === 'all') {
            filteredQuotes = quotes;
        } else {
            filteredQuotes = quotes.filter(quote => quote.category === category);
        }
        
        res.json({
            success: true,
            data: filteredQuotes,
            total: filteredQuotes.length,
            category: category,
            message: `成功获取${category}分类的名言`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 搜索名言
app.get('/api/quotes/search', async (req, res) => {
    try {
        const { q: keyword } = req.query;
        
        if (!keyword || !keyword.trim()) {
            return res.status(400).json({
                success: false,
                message: '请提供搜索关键词'
            });
        }
        
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        const searchTerm = keyword.toLowerCase();
        const filteredQuotes = quotes.filter(quote => 
            quote.text.toLowerCase().includes(searchTerm) ||
            quote.author.toLowerCase().includes(searchTerm) ||
            quote.source.toLowerCase().includes(searchTerm) ||
            (quote.tags && quote.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
        
        res.json({
            success: true,
            data: filteredQuotes,
            total: filteredQuotes.length,
            keyword: keyword,
            message: `搜索到${filteredQuotes.length}条相关名言`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 获取所有名言
app.get('/api/quotes/all', async (req, res) => {
    try {
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        res.json({
            success: true,
            data: quotes,
            total: quotes.length,
            message: '成功获取所有名言'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 添加新名言（后台管理用）
app.post('/api/quotes', async (req, res) => {
    try {
        const { text, author, source, category, tags } = req.body;
        
        // 验证必填字段
        if (!text || !author || !source || !category) {
            return res.status(400).json({
                success: false,
                message: '缺少必填字段'
            });
        }
        
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        const newQuote = {
            id: Date.now(),
            text: text.trim(),
            author: author.trim(),
            source: source.trim(),
            category: category,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            createdAt: new Date().toISOString()
        };
        
        quotes.unshift(newQuote);
        data.quotes = quotes;
        data.meta.totalQuotes = quotes.length;
        data.meta.updated = new Date().toISOString();
        
        const success = await writeQuotes(data);
        
        if (success) {
            res.status(201).json({
                success: true,
                data: newQuote,
                message: '名言添加成功'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '保存失败'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 获取统计信息
app.get('/api/quotes/stats', async (req, res) => {
    try {
        const data = await readQuotes();
        const quotes = data.quotes || [];
        
        const stats = {
            total: quotes.length,
            game: quotes.filter(q => q.category === 'game').length,
            movie: quotes.filter(q => q.category === 'movie').length,
            anime: quotes.filter(q => q.category === 'anime').length,
            celebrity: quotes.filter(q => q.category === 'celebrity').length
        };
        
        res.json({
            success: true,
            data: stats,
            message: '成功获取统计信息'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 获取分类列表
app.get('/api/categories', async (req, res) => {
    try {
        const data = await readQuotes();
        res.json({
            success: true,
            data: data.categories || [],
            message: '成功获取分类列表'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 获取标签列表
app.get('/api/tags', async (req, res) => {
    try {
        const data = await readQuotes();
        res.json({
            success: true,
            data: data.tags || [],
            message: '成功获取标签列表'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: '服务器错误'
        });
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API端点不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 名言名句API服务器已启动！`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📖 API文档: http://localhost:${PORT}/api/quotes/random`);
    console.log(`💻 前端页面: http://localhost:${PORT}`);
});

module.exports = app;