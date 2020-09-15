import Vue from 'vue'
import router from './router'
import axios from 'axios'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import './assets/css/nprogress.css'// Progress 进度条样式
const {
  ipcRenderer
} = require('electron')
const Moniter = require('@/utils/getMoniter')
const Cookie = require('@/utils/cookie')
const _API_ROOT = 'http://crmapi.wwj.fanwe.com'
let _token = ''
var monit = new Moniter() // 初始化轮询任务
ipcRenderer.on('closeTrayFlash', () => {
  monit && (monit.hasHandleUnreadMsg = true)
})
router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log(11111)
  if (to.name === 'login') {
    store.dispatch('windowChangeLoading', true)
  }
  if (to.name === 'login' || to.name === 'logoutDialog' || to.path === '/session' || to.path === '/friend' || to.path === '/session/new' || to.path === '/monitor') {
    if (global.globalMoniterTimer) {
      monit.clearMoniterTimeOut()
    }
    if (global.sessionMoniterTimer) {
      clearInterval(global.sessionMoniterTimer)
    }
  }
  console.log(22222)
  Cookie.getCookies('_token').then(async (res) => {
    console.log(33333)
    _token = res
    if (_token) {
      if (to.path !== '/session' && to.path !== '/friend' && to.path !== '/session/new') {
        if (!global.globalMoniterTimer) {
          monit.initMoniterTimeOut()
        }
      }
      if (store.getters._TOKEN === '') {
        store.dispatch('setToken', _token)
      }
      // 个人设置
      if (!store.getters.customSetting) {
        let resCustomSetting = await axios.post(`${_API_ROOT}/getCustomSetting`, {
          _token: _token
        })
        // if (resCustomSetting.data.notice_setting.auto_learning_notice === 1) { // 开启自动启动
        //   ipcRenderer.send('openAutoStartApp')
        // } else { // 关闭自动启动
        //   ipcRenderer.send('closeAutoStartApp')
        // }
        store.dispatch('setCustomSetting', resCustomSetting.data.notice_setting)
      }
      if (!store.getters.sysConfig && !store.getters.baseUserInfo) {
        axios.all([axios.post(`${_API_ROOT}/system.get_config`), axios.post(`${_API_ROOT}/cs.info`, {
          _token: _token
        })])
          .then(axios.spread(function (sysConfig, baseUserInfo) {
            store.dispatch('setBaseUserInfo', baseUserInfo.data.data || baseUserInfo.data)
            store.dispatch('setSysConfig', sysConfig.data.data || sysConfig.data)
            next()
          }))
      } else {
        if (!store.getters.sysConfig) {
          axios.all([axios.post(`${_API_ROOT}/system.get_config`)])
            .then(axios.spread(function (sysConfig) {
              store.dispatch('setSysConfig', sysConfig.data.data || sysConfig.data)
              next()
            }))
        } else if (!store.getters.baseUserInfo) {
          axios.all([axios.post(`${_API_ROOT}/cs.info`, {
            _token: _token
          })])
            .then(axios.spread(function (baseUserInfo) {
              store.dispatch('setBaseUserInfo', baseUserInfo.data.data || baseUserInfo.data)
              next()
            }))
        } else {
          next()
        }
      }
    } else {
      if (global.globalMoniterTimer) {
        monit.clearMoniterTimeOut()
      }
      if (global.sessionMoniterTimer) {
        clearInterval(global.sessionMoniterTimer)
      }
      if (to.name === 'login') {
        next()
        NProgress.done()
      } else {
        next({
          path: '/login'
        })
        NProgress.done()
      }
    }
  })
})

router.afterEach((to, from) => {
  console.log(44444)
  if (to.name === 'logoutDialog' || to.name === 'login') {
    if (global.globalMoniterTimer) {
      monit.clearMoniterTimeOut()
    }
    if (global.sessionMoniterTimer) {
      clearInterval(global.sessionMoniterTimer)
    }
  }
  NProgress.done() // 结束Progress
  store.dispatch('windowChangeLoading', false)
})
