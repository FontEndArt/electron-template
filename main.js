const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork, spawn } = require('child_process');
require('dotenv').config(); // 加载 .env 文件中的环境变量

let serverProcess;
let frontendServerProcess;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    console.log('NODE_ENV:', process.env.NODE_ENV); // 输出当前的 NODE_ENV

    // 在开发环境中加载本地服务器
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        // 在生产环境中加载本地服务器提供的文件
        mainWindow.loadURL('http://localhost:3000');
    }
}

app.on('ready', () => {
    // 启动后端服务器
    serverProcess = fork(path.join(__dirname, 'server', 'index.js'));

    // 在生产环境中启动前端服务器
    if (process.env.NODE_ENV !== 'development') {
        frontendServerProcess = spawn('node', [path.join(__dirname, 'frontend-server.js')], {
            stdio: 'inherit',
        });

        frontendServerProcess.on('close', (code) => {
            console.log(`Frontend server process exited with code ${code}`);
        });
    }

    createWindow();

    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
    });

    serverProcess.on('exit', (code, signal) => {
        console.log(`Server process exited with code ${code} and signal ${signal}`);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // 关闭后端服务器
        if (serverProcess) {
            serverProcess.kill();
            console.log('Server process killed');
        }
        // 关闭前端服务器
        if (frontendServerProcess) {
            frontendServerProcess.kill();
            console.log('Frontend server process killed');
        }
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});