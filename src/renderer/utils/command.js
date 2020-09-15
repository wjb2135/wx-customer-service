'use strict'

import store from '@/store'
import axios from 'axios'
const ipc = require('electron').ipcRenderer
const Cookie = require('@/utils/cookie')

//  注销登陆
ipc.on('loginOut', () => {
  Cookie.setCookie('isLogout', true)
  Cookie.setCookie('_token', '')
  store.dispatch('logoutStatus', 0)
  store.dispatch('setToken', '')
  ipc.send('login-window-show')
})
// 清除轮询定时器
ipc.on('clearIntervalMoniter', () => {
  if (global.globalMoniterTimer) {
    clearInterval(global.globalMoniterTimer)
    global.globalMoniterTimer = null
  }
  if (global.sessionMoniterTimer) {
    clearInterval(global.sessionMoniterTimer)
    global.sessionMoniterTimer = null
  }
})
// 清除缓存
ipc.on('clearCache', () => {
  localStorage.clear()
  sessionStorage.clear()
  store.dispatch('clearAllChatState')
  store.dispatch('clearAllVisitorState')
  store.dispatch('clearAllAppState')
})
// 监听tray.js 托盘 登录状态改变
ipc.on('logoutWin', (event, arg) => {
  if (store.getters.baseUserInfo.online_status === arg) return
  if (Number(arg) === 1) {
    Cookie.getCookies('_token').then((res) => {
      axios.post('/cs.onlinestatus', {
        _token: res,
        online_status: 1
      }).then(res => {
        store.dispatch('onlineStatus', 1)
        ipc.send('ipcContact', 'refreshCsInfo')
      })
    })
  } else {
    ipc.send('newWindows', {
      url: '/dialog/reason?logout=1&type=' + arg,
      options: {
        width: 360,
        height: 280
      }
    })
  }
})
