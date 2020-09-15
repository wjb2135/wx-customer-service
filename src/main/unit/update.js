/**
 * 检查APP版本更新
 */

'use strict';
import { ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
const fs = require('fs-extra')
const path = require('path')
const uploadUrl = 'http://www.wwj.fanwe.com/download'

let updaterCacheDirName = 'my-project-updater'
const updatePendingPath = path.join(autoUpdater.app.baseCachePath, updaterCacheDirName, 'pending')
fs.emptyDir(updatePendingPath)

// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle (mainWindow) {
  let message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  };
  // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
  autoUpdater.autoDownload = false
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.updateConfigPath = path.join(__dirname, 'default-app-update.yml')
  } else {
    autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
  }
  autoUpdater.setFeedURL(uploadUrl);
  autoUpdater.on('error', function () {
    sendUpdateMessage(message.error, mainWindow)
  });
  autoUpdater.on('checking-for-update', function () {
    console.log('checking-for-update')
    sendUpdateMessage(message.checking, mainWindow)
  });
  autoUpdater.on('update-available', function (info) {
    console.log('update-available')
    sendUpdateMessage(message.updateAva, mainWindow)
  });
  autoUpdater.on('update-not-available', function (info) {
    console.log('update-not-available')
    sendUpdateMessage(message.updateNotAva, mainWindow)
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    const dialogOpts = {
      type: 'info',
      buttons: ['重新启动', '稍后'],
      title: '应用更新',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '已下载新版本，重新启动应用程序以应用更新。'
    }
    dialog.showMessageBox(dialogOpts, (response) => {
      if (response === 0) {
        autoUpdater.quitAndInstall()
        mainWindow.destroy()
      }
    })

    // ipcMain.on('isUpdateNow', (e, arg) => {
    //   console.log(arguments);
    //   console.log('开始更新');
    //   // some code here to handle event
    //   autoUpdater.quitAndInstall();
    //   mainWindow.destroy()
    // });

    // mainWindow.webContents.send('isUpdateNow')
  });
  ipcMain.on('checkForUpdate', () => {
    // 执行自动更新检查
    fs.emptyDir(updatePendingPath)
    autoUpdater.checkForUpdates();
  })
  ipcMain.on('downloadUpdate', () => {
    // 下载
    autoUpdater.downloadUpdate()
  })
}
// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage (text, mainWindow) {
  mainWindow.webContents.send('message', text)
}

module.exports = updateHandle;
