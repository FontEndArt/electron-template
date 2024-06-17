const express = require('express');
const path = require('path');
const app = express();
const port = process.env.FRONTEND_PORT || 3000;

// 提供静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 所有请求都返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server is running on http://localhost:${port}`);
});