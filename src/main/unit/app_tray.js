/**
 * Created by Zhongyi on 5/2/16.
 */

'use strict';

const path = require('path');
const { app, Menu, nativeImage, Tray, ipcMain } = require('electron')
const Common = require('../../common');
let baseUrl = './imgs'
if (process.env.NODE_ENV !== 'production') {
  baseUrl = '../../renderer/assets/images'
}

class AppTray {
  constructor (wechatWindow) {
    console.log(wechatWindow)
    this.wechatWindow = wechatWindow;
    this.lastUnreadStat = 0;
    this.createTray();
  }

  createTray () {
    let image;
    // if (process.platform === 'linux' || process.platform === 'win32') {
    //   image = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/logo.png`));
    //   this.trayIcon = image;
    //   this.trayIconUnread = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/icon.png`));
    // } else {
    //   image = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/logo.png`));
    // }
    // image = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/logo.png`));
    // this.trayIcon = path.join(__dirname, `${baseUrl}/app/logo.png`);
    // this.trayIconUnread = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/icon.png`));
    image = nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/app/logo.png`))
    image.setTemplateImage(true)

    this.tray = new Tray(image)

    // ipcMain.on('refreshIcon', () => this.refreshIcon());

    // if (process.platform === 'linux' || process.platform === 'win32') {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '在线',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/online.png`)),
        click: function () {
          app.quit()
        }
      },
      {
        label: '离开',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/offline.png`)),
        click: function () {
          app.quit()
        }
      },
      {
        label: '忙碌',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/busy.png`)),
        click: function () {
          app.quit()
        }
      },
      {
        label: '',
        type: 'separator'
      },
      {
        label: '关闭提示音',
        click: function () {
          app.quit()
        }
      },
      {
        label: '',
        type: 'separator'
      },
      {
        label: '切换用户',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/switch_user.png`)),
        click: function () {
          app.quit()
        }
      },
      {
        label: '注销',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/logout.png`)),
        click: function () {
          app.quit()
        }
      },
      {
        label: '退出',
        icon: nativeImage.createFromPath(path.join(__dirname, `${baseUrl}/top/quit.png`)),
        click: function () {
          app.quit()
          this.tray.destroy()
        }
      }
    ]);
    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip(Common.ELECTRONIC_WECHAT);
    // }
    this.tray.on('click', () => {
      this.wechatWindow.show()
      global.isHide = false // 是否最小到托盘
    });
    this.tray.on('double-click', function (Event) {
      this.wechatWindow.show() // 显示窗口
      global.isHide = false // 是否最小到托盘
    })
  }

  setTitle (title) {
    this.tray.setTitle(title);
  }

  // hideSplashAndShowWeChat() {
  //   if (this.splashWindow.isShown) return;
  //   this.wechatWindow.show();
  // }

  refreshIcon () {
    this.trayIcon = path.join(__dirname, `${baseUrl}/app/logo.png`);
    this.trayIconUnread = path.join(__dirname, `${baseUrl}/app/logo-unread.png`);
    if (this.lastUnreadStat === 0) {
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
  }

  setUnreadStat (stat) {
    if (stat === this.lastUnreadStat) return;
    this.lastUnreadStat = stat;
    if (stat === 0) {
      this.tray.setImage(this.trayIcon);
    } else {
      this.tray.setImage(this.trayIconUnread);
    }
  }
}

module.exports = AppTray;
