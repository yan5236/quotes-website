# 名言名句网站

一个现代化的名言名句展示网站，收录游戏、影视、动漫、名人的经典语录。

## 🌟 特色功能

- **现代化设计**：深蓝+橙色配色，响应式布局
- **分类浏览**：游戏、影视、动漫、名人四大分类
- **智能搜索**：支持名言内容、作者、来源搜索
- **真实API**：完整的RESTful API接口
- **响应式**：完美适配手机、平板、电脑

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

### 3. 访问网站

打开浏览器访问：http://localhost:3000

## 📖 API文档

### 获取随机名言
```
GET /api/quotes/random
```

### 按分类获取名言
```
GET /api/quotes/category/{category}
```
参数：`category` - game, movie, anime, celebrity

### 搜索名言
```
GET /api/quotes/search?q={keyword}
```
参数：`q` - 搜索关键词

### 获取所有名言
```
GET /api/quotes/all
```

### 获取统计信息
```
GET /api/quotes/stats
```

## ⌨️ 键盘快捷键

- `Ctrl + K` - 聚焦搜索框
- `Ctrl + H` - 回到首页
- `Ctrl + A` - 查看API页面
- `Ctrl + R` - 刷新名言
- `Esc` - 清空搜索

## 🛠 技术栈

- **前端**：HTML5, CSS3, JavaScript ES6+
- **后端**：Node.js, Express
- **数据**：JSON文件存储
- **样式**：响应式设计，现代化UI

## 📁 项目结构

```
quotes-website/
├── index.html          # 主页面
├── server.js           # Node.js服务器
├── package.json        # 项目配置
├── css/
│   ├── main.css       # 主样式
│   └── responsive.css # 响应式样式
├── js/
│   ├── app.js         # 主应用逻辑
│   ├── quotes.js      # 数据管理
│   ├── ui.js          # UI交互
│   └── api.js         # API接口
└── data/
    └── quotes.json    # 名言数据
```

## 📜 许可证

MIT License