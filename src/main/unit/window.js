'use strict';

const path = require('path')
const { app, BrowserWindow, dialog } = require('electron')
const Common = require('../../common')
const isDev = process.env.NODE_ENV === 'development'
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function recordCrash () {
  return new Promise(resolve => {
    // 崩溃日志请求成功....
    resolve();
  })
}
// 崩溃重启
function reloadWindow (mainWin) {
  if (mainWin.isDestroyed()) {
    app.relaunch();
    app.exit(0);
  } else {
    BrowserWindow.getAllWindows().forEach((w) => {
      if (w.id !== mainWin.id) w.destroy();
    });
    mainWin.reload();
  }
}

/**
 * 初始化主窗口
 */
export function createWindow () {
  const size = Common.WINDOW_SIZE_LOGIN
  let win = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: size.width,
    minHeight: size.height,
    center: true,
    frame: false,
    show: false,
    resizable: isDev,
    useContentSize: true,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true // 解决webview无法显示问题
    }
  })
  win.setMenu(null) // 删除窗口菜单栏
  win.loadURL(`${winURL}#/login?isfirst=1`)
  win.once('ready-to-show', () => {
    win.show()
    win.webContents.send('clearCache')
  })
  win.on('close', () => {
    win.webContents.send('clearCache')
  })
  win.on('closed', () => {
    win = null
  })
  win.on('show', (sys, msg) => {
    win.webContents.send('showWindow')
  })
  win.on('hide', (sys, msg) => {
    win.webContents.send('hideWindow')
  })
  // 崩溃监控
  win.webContents.on('crashed', () => {
    const options = {
      type: 'error',
      title: '进程崩溃了',
      message: '这个进程已经崩溃.',
      buttons: ['重载', '退出']
    };
    recordCrash().then(() => {
      dialog.showMessageBox(options, (index) => {
        if (index === 0) reloadWindow(win);
        else app.quit();
      });
    }).catch((e) => {
      console.log('err', e);
    });
  })
  return win
}
