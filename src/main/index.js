'use strict'

import '../renderer/store'
import { app, ipcMain, session } from 'electron'
import { command } from './unit/command'
import { createWindow } from './unit/window'
import { trayLoginFn, trayMainFn } from './unit/tray'
const Common = require('../common')
const updateHandle = require('./unit/update')
const autoStart = require('./unit/autoStart')
global.sharedObject = {
  someProperty: {}
}

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

class ElectronicWeChat {
  constructor () {
    this.wechatWindow = null
    this.trayLogin = null
    this.trayMain = null
    this.winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`
    this.isDev = process.env.NODE_ENV === 'development'
  }
  init () {
    this.initApp()
  }
  initApp () {
    app.on('ready', () => {
      session.defaultSession.cookies.remove('http://crmapi.wwj.fanwe.com', '_token', () => {
        console.log('清除完成')
      })
      this.createWeChatWindow()
      this.createTrayLogin()
      this.initIPC()
      updateHandle(this.wechatWindow) // 尝试更新
    });

    app.on('activate', () => {
      if (this.wechatWindow == null) {
        this.createWeChatWindow()
      } else {
        this.wechatWindow.show()
      }
    });
    // 窗口全部被关闭
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        if (this.trayLogin && !this.trayLogin.isDestroyed()) {
          this.trayLogin.destroy()
          this.trayLogin = null
        }
        if (this.trayMain && !this.trayMain.isDestroyed()) {
          this.trayMain.destroy()
          this.trayMain = null
        }
        app.quit()
      }
    });
    // GPU进程崩溃
    app.on('gpu-process-crashed', function () {
      console.error('GPU进程崩溃，程序退出');
      app.exit(0);
    });
    // 保证启动一个实例
    // const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    //   if (this.wechatWindow) {
    //     if (this.wechatWindow.isMinimized()) this.wechatWindow.restore()
    //     this.wechatWindow.focus()
    //   }
    // })
    // if (shouldQuit) {
    //   app.quit()
    // }
    // app.commandLine.appendSwitch('--disable-http-cache')
  };
  initIPC () {
    command(this.wechatWindow, this.winURL)
    // 显示登录窗口
    ipcMain.on('login-window-show', () => {
      console.log('执行login-window-show')
      const size = Common.WINDOW_SIZE_LOGIN
      this.wechatWindow.hide()
      this.wechatWindow.loadURL(`${this.winURL}#/login`)
      this.wechatWindow.setResizable(false)
      this.wechatWindow.setMinimumSize(size.width, size.height)
      this.wechatWindow.setSize(size.width, size.height)
      this.wechatWindow.center()
      if (this.trayMain) {
        this.trayMain.destroy()
        this.trayMain = null
      }
      if (this.trayLogin == null) {
        this.createTrayLogin()
      }
      setTimeout(() => {
        this.wechatWindow.show()
      }, 500);
    });
    // 显示主内容窗口
    ipcMain.on('content-window-show', () => {
      console.log('执行content-window-show')
      const size = Common.WINDOW_SIZE
      this.wechatWindow.hide()
      this.wechatWindow.setResizable(true)
      this.wechatWindow.setMinimumSize(size.width, size.height)
      this.wechatWindow.setSize(size.width, size.height)
      this.wechatWindow.center()

      if (this.trayLogin) {
        this.trayLogin.destroy()
        this.trayLogin = null
      }
      if (this.trayMain == null) {
        this.createTrayMain()
      }
      setTimeout(() => {
        this.wechatWindow.show()
      }, 500)
    });
    // 下载
    this.wechatWindow.webContents.session.on('will-download', (event, item, webContents) => {
      // 设置保存路径,使Electron不提示保存对话框。
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed')
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {
            console.log(`Received bytes: ${item.getReceivedBytes()}`)
          }
        }
      })
      item.once('done', (event, state) => {
        if (state === 'completed') {
          console.log('Download successfully')
        } else {
          console.log(`Download failed: ${state}`)
        }
      })
    })
    ipcMain.on('download', (event, message) => {
      this.wechatWindow.webContents.downloadURL(message);
    });

    ipcMain.on('setting-template', (event, message) => {
      console.log(event, message)
    })
    // 窗口闪烁
    ipcMain.on('flashFrame', (event, message) => {
      this.wechatWindow.flashFrame(true)
    });
    // 窗口闪烁关闭
    ipcMain.on('closeFlashFrame', (event, message) => {
      this.wechatWindow.flashFrame(false)
    });
    // 应用关闭
    ipcMain.on('appQuit', (event, message) => {
      app.quit()
      this.trayLogin && this.trayLogin.destroy()
      this.trayMain && this.trayMain.destroy()
    });
    // 开机自启
    ipcMain.on('openAutoStartApp', (event, message) => {
      autoStart.setAppStart()
    })
    // 关闭开机自启
    ipcMain.on('closeAutoStartApp', (event, message) => {
      autoStart.cancelAppStart()
    })
    // 必要的全局错误捕获
    process.on('uncaughtException', error => {
      console.error(error.stack || JSON.stringify(error));
      app.exit();
    });
  }
  createWeChatWindow () {
    this.wechatWindow = createWindow()
  }
  createTrayLogin () {
    this.trayLogin = trayLoginFn(this.wechatWindow)
  }
  createTrayMain () {
    this.trayMain = trayMainFn(this.wechatWindow)
  }
}
new ElectronicWeChat().init();
