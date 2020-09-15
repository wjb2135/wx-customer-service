import { ipcMain, Menu, app, Tray } from 'electron'
import store from '../../renderer/store/index'
import Vue from 'vue'
const electron = require('electron');
// const { BrowserWindow } = electron;
const { ipcRenderer } = require('electron');
const vue = new Vue()
const path = require('path')
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`
let baseUrl = './imgs'
let trayImage

if (process.env.NODE_ENV !== 'production') {
  baseUrl = '../../renderer/assets/images'
}
if (process.platform === 'linux' || process.platform === 'win32') {
  trayImage = path.join(__dirname, `${baseUrl}/app/tray.ico`)
} else {
  trayImage = path.join(__dirname, `${baseUrl}/app/tray@2x.png`)
}

/**
 * 主线程托盘
 * @param {Object} win 窗口对象
 */
function trayMainFn (win) {
  let tray
  let count = 0
  let timer = null
  let unreadMessageId = null // 当前未读消息ID
  let unreadMessageUserId = null // 当前未读消息对应的微信用户ID
  let mainWindow = win
  tray = new Tray(trayImage)
  let contextMenu
  let template = [{
    label: '在线',
    icon: path.join(__dirname, `${baseUrl}/top/online.png`),
    click: function () {
      win.webContents.send('logoutWin', 1)
    }
  },
  {
    label: '离开',
    icon: path.join(__dirname, `${baseUrl}/top/offline.png`),
    click: function () {
      win.webContents.send('logoutWin', 2)
    }
  },
  {
    label: '忙碌',
    icon: path.join(__dirname, `${baseUrl}/top/busy.png`),
    click: function () {
      win.webContents.send('logoutWin', 3)
    }
  },
  {
    label: '',
    type: 'separator'
  },
  {
    label: '关闭提示音',
    icon: store.getters.closeMsgSound ? path.join(__dirname, `${baseUrl}/top/close-msg-sound.png`) : '',
    click: function () {
      let closeMsgSound = store.getters.closeMsgSound
      store.dispatch('setCloseMsgSound', !closeMsgSound)
      template[4].icon = !closeMsgSound ? path.join(__dirname, `${baseUrl}/top/close-msg-sound.png`) : ''
      contextMenu = Menu.buildFromTemplate(template)
      tray.setContextMenu(contextMenu)
    }
  },
  {
    label: '',
    type: 'separator'
  },
  {
    label: '切换用户',
    icon: path.join(__dirname, `${baseUrl}/top/switch_user.png`),
    click: function () {
      win.webContents.send('logoutWin', 4)
    }
  },
  {
    label: '注销',
    icon: path.join(__dirname, `${baseUrl}/top/logout.png`),
    click: function () {
      win.webContents.send('logoutWin', 4)
    }
  },
  {
    label: '退出',
    icon: path.join(__dirname, `${baseUrl}/top/quit.png`),
    click: function () {
      win.webContents.send('logoutWin', 5)
    }
  }]
  /**
   * 底部托盘图标的右键菜单
   */
  contextMenu = Menu.buildFromTemplate(template)
  // 名称
  const name = store.state.user.baseUserInfo.company.name
  const realname = store.state.user.baseUserInfo.realname
  tray.setToolTip('企业: ' + name + '\n' + '客服: ' + realname)
  tray.setContextMenu(contextMenu)
  // 双击
  tray.on('double-click', function (Event) {
    mainWindow.show() // 显示窗口
    global.isHide = false // 是否最小到托盘
  })
  // 单击
  tray.on('click', function (Event) {
    if (timer) {
      clearTimeout(timer)
      timer = null
      count = 0
      tray.setImage(path.join(__dirname, `${baseUrl}/app/tray.png`))
      win.loadURL(`${winURL}#/session?uid=${unreadMessageUserId}&msgId=${unreadMessageId}`)
      win.webContents.send('closeTrayFlash')
    }
  })
  // 图标闪烁
  function TrayFlash () {
    timer = setTimeout(function () {
      count++
      if (count % 2 === 0) {
        tray.setImage(path.join(__dirname, `${baseUrl}/app/tray.png`))
      } else {
        tray.setImage(path.join(__dirname, `${baseUrl}/app/empty.png`))
      }
      TrayFlash()
    }, 500)
  }
  ipcMain.on('openTrayFlash', (sys, uid, msgId) => {
    unreadMessageUserId = uid
    unreadMessageId = msgId
    if (timer) return
    TrayFlash()
  })
  // 取消闪烁
  ipcMain.on('closeTrayFlash', (sys, msg) => {
    clearTimeout(timer)
    timer = null
    count = 0
    tray.setImage(path.join(__dirname, `${baseUrl}/app/tray.png`))
  })
  return tray
}
/**
 * 登录线程托盘
 * @param {Object} win 窗口对象
 */
function trayLoginFn (win) {
  let tray
  let mainWindow = win
  tray = new Tray(trayImage)
  /**
   * 底部托盘图标的右键菜单
   */
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开主界面',
      click: function () {
        mainWindow.show()
      }
    },
    {
      label: '',
      type: 'separator'
    },
    {
      label: '退出',
      icon: path.join(__dirname, `${baseUrl}/top/quit.png`),
      click: function () {
        app.quit()
        tray.destroy()
      }
    }
  ])
  // 名称
  tray.setToolTip('方维微客服')
  tray.setContextMenu(contextMenu)
  // 单击
  tray.on('click', function (Event) {
    mainWindow.show()
    global.isHide = false // 是否最小到托盘
  })
  return tray
}
export { trayMainFn, trayLoginFn }
