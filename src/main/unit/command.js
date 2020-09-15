'use strict'

import {
  app,
  ipcMain,
  Menu,
  MenuItem,
  BrowserWindow,
  globalShortcut
} from 'electron'
import {
  type
} from 'os';
import ShortcutCapture from './shortcut-capture'
const {
  remote
} = require('electron');
let loginWindow, senders
let contentWindow = null
let WinMinSizeArray = []
let $shortcutCapture = null
let $shortcutCaptureWin = ''
const isDev = process.env.NODE_ENV === 'development'
export function command (mainWindow, winURL) {
  let newwin = [] // 新建窗口
  let WinBoxCount = 0 // 窗口序号
  let newSessionWinBoxCount = ''
  /**
   * 初始化截图
   */
  function initShortcutCapture () {
    $shortcutCapture = new ShortcutCapture()
    if (process.env.NODE_ENV === 'development') {
      // 下面的代码需要根据实际项目结构修改
    }

    globalShortcut.register('CmdOrCtrl+Shift+A', () => $shortcutCapture.shortcutCapture())
    globalShortcut.register('Esc', () => $shortcutCapture.hide())
    // 拿取截图后返回信息
    $shortcutCapture.on('capture', ({
      dataURL,
      bounds
    }) => {
      console.log($shortcutCaptureWin, '$shortcutCaptureWin')
      if ($shortcutCaptureWin) {
        newwin[$shortcutCaptureWin].webContents.send('capture', dataURL)
      } else {
        mainWindow.webContents.send('capture', dataURL)
      }
    })
  }
  initShortcutCapture()
  // 设置app名称
  app.setName('方维微客服')
  // 最小化窗口
  ipcMain.on('minWindow', (sys, msg) => {
    // 最小化
    if (msg && msg.winbox) {
      newwin[msg.winbox].minimize()
    } else {
      mainWindow.minimize()
    }
  })
  // 最大化窗口/还原
  ipcMain.on('maxWindow', (sys, msg) => {
    if (msg.winbox) {
      if (typeof WinMinSizeArray[msg.winbox] !== 'undefined' && WinMinSizeArray[msg.winbox] === false) {
        // 若已经是最大化了，则还原
        newwin[msg.winbox].unmaximize()
        WinMinSizeArray[msg.winbox] = true
      } else {
        // 最大化窗口
        newwin[msg.winbox].maximize()
        WinMinSizeArray[msg.winbox] = false
      }
    } else {
      if (typeof WinMinSizeArray[0] !== 'undefined' && WinMinSizeArray[0] === false) {
        // 若已经是最大化了，则还原
        mainWindow.unmaximize()
        WinMinSizeArray[0] = true
      } else {
        // 最大化窗口
        mainWindow.maximize()
        WinMinSizeArray[0] = false
      }
    }
    return false
  })
  // 退出
  ipcMain.on('closeWindow', (sys, msg) => {
    if (msg && msg.winbox) newwin[msg.winbox].close()
    else mainWindow.close()
  })
  // 隐藏窗口不退出
  ipcMain.on('hideWindow', (sys, msg) => {
    global.isHide = true
    if (newwin[msg.winbox]) newwin[msg.winbox].close()
    else mainWindow.hide()
  })
  // 显示窗口
  ipcMain.on('showWindow', (sys, msg) => {
    global.isHide = false
    if (newwin[msg.winbox]) newwin[msg.winbox].close()
    else mainWindow.show()
  })
  // 重置窗口大小
  ipcMain.on('resetWindow', (sys, msg) => {
    mainWindow.setSize(msg.width, msg.height)
  })
  // 关闭window窗口
  ipcMain.on('window-close', (event) => {
    app.quit()
  })
  // 设置窗口在屏幕中心位置
  ipcMain.on('center', (sys, msg) => {
    if (msg && msg.winbox) {
      newwin[msg.winbox].center()
    } else {
      mainWindow.center()
    }
  })
  // 确认选择素材
  ipcMain.on('confirmMedia', (sys, msg) => {
    if (msg && msg.winbox) {
      newwin[msg.winbox].webContents.send('confirmMedia', msg)
    } else {
      mainWindow.webContents.send('confirmMedia', msg)
    }
  })
  // 截图
  ipcMain.on('capture-screen', (sys, msg) => {
    if (msg && msg.winbox) {
      $shortcutCaptureWin = msg.winbox
    } else {
      $shortcutCaptureWin = ''
    }
    $shortcutCapture.shortcutCapture()
  });
  // 新建链接
  ipcMain.on('createLink', (sys, msg) => {
    if (msg && msg.winbox) {
      newwin[msg.winbox].webContents.send('createLink', msg)
    } else {
      mainWindow.webContents.send('createLink', msg)
    }
  })
  // 发送语言消息成功
  ipcMain.on('sendSuccessVoiceMessage', (sys, msg) => {
    if (msg && msg.winbox) {
      newwin[msg.winbox].webContents.send('sendSuccessVoiceMessage', msg)
    } else {
      mainWindow.webContents.send('sendSuccessVoiceMessage', msg)
    }
  })
  // 渲染进程通信中转
  ipcMain.on('ipcContact', (event, name, msg) => {
    if (msg && msg.winbox >= 0) {
      newwin[msg.winbox].webContents.send(name, msg)
    } else {
      mainWindow.webContents.send(name, msg)
    }
  });
  // 新建窗口
  ipcMain.on('newWindows', (sys, msg) => {
    mainWindow.setMenu(null)
    let options = {
      width: 820,
      height: 600,
      parent: newwin && newwin[WinBoxCount] != null ? newwin[WinBoxCount] : mainWindow, // win是主窗口
      modal: true,
      show: false,
      hasShadow: true,
      resizable: false,
      frame: false,
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        webviewTag: true // 解决webview无法显示问题
      }
    }
    if (msg.options) {
      options = Object.assign(options, msg.options)
    }
    WinBoxCount++
    newwin[WinBoxCount] = new BrowserWindow(options)
    if (
      msg.url.indexOf('https://') !== -1 ||
      msg.url.indexOf('http://') !== -1
    ) {
      newwin[WinBoxCount].loadURL(msg.url)
    } else {
      if (msg.url.indexOf('?') === -1) {
        newwin[WinBoxCount].loadURL(
          `${winURL}#${msg.url}?winbox=${WinBoxCount}`
        )
      } else {
        newwin[WinBoxCount].loadURL(
          `${winURL}#${msg.url}&winbox=${WinBoxCount}`
        )
      }
      if (options.markSessionWin) {
        newSessionWinBoxCount = WinBoxCount
        mainWindow.webContents.send('hasCreatedNewSessionWin', true)
      }
    }
    // 当网页被渲染时（当没有被显示时）被触发，窗口可以在没有可视闪光的情况下被显示
    newwin[WinBoxCount].once('ready-to-show', () => {
      newwin[WinBoxCount].show()
    })
    newwin[WinBoxCount].on('closed', () => {
      newwin[WinBoxCount] = null
    })
    // newwin[WinBoxCount].webContents.openDevTools({mode: 'detach'})
  })
  return newwin;
}
