// 静态文件服务中间件
app.use(express.static('public'));

// 添加特殊的缓存控制头用于主题预加载文件
app.get(/\.css$/, (req, res, next) => {
    // 对于防止闪烁的CSS文件，设置特殊的缓存控制头
    if (req.path.includes('noflash')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});

// 处理主题版本路由
