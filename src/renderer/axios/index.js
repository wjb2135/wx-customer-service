import qs from 'qs'
import axios from 'axios'
import store from '../store'
import Vue from 'vue'
import encrypt from 'encryptjs'
const Cookie = require('@/utils/cookie')
const electron = require('electron')
const ipc = electron.ipcRenderer
let secretkey = 'cryptograph' // 密码
const vue = new Vue()
let islogout = false
// 默认请求地址
axios.defaults.baseURL = 'http://crmapi.wwj.fanwe.com'
// 超时时间
axios.defaults.timeout = 120000

// 发送
axios.interceptors.request.use(
  async (config) => {
    if (config.headers['Content-Type'] !== 'multipart/form-data') {
      if (
        config.method === 'post' ||
        config.method === 'put' ||
        config.method === 'delete'
      ) {
        // 序列化
        config.data = qs.stringify(config.data)
        // 生产环境
        // if (process.env.NODE_ENV !== 'development') {
        //   config.data = encrypt.encrypt(config.data, secretkey, 256)
        // }
      }
    }
    const _token = await Cookie.getCookies('_token')
    config.headers.common['X-USER-TOKEN'] = _token
    return config
  },
  error => {
    return Promise.reject(error.data.message)
  }
)
let loginStatus = false
// 接收
axios.interceptors.response.use(
  res => {
    let data = res.data
    // 生产环境
    // if (process.env.NODE_ENV !== 'development') {
    //   // 解密
    //   data = encrypt.decrypt(data, secretkey, 256)
    //   // 转化为对象
    //   data = qs.parse(data)
    // }
    if (data.errcode) { // 返回的errcode不等于0，阻塞
      if (data.errcode === -10001) { // 在其他地方登录
        if (global.globalMoniterTimer) {
          clearInterval(global.globalMoniterTimer)
          global.globalMoniterTimer = null
        }
        if (global.sessionMoniterTimer) {
          clearInterval(global.sessionMoniterTimer)
          global.sessionMoniterTimer = null
        }
        vue.newWindows('/dialog/logout?reason=1', {width: 240, height: 120})
        loginStatus = true
        return Promise.reject(data)
      }
      if (data.errcode === -10002) { // 被强制下线
        if (global.globalMoniterTimer) {
          clearInterval(global.globalMoniterTimer)
          global.globalMoniterTimer = null
        }
        if (global.sessionMoniterTimer) {
          clearInterval(global.sessionMoniterTimer)
          global.sessionMoniterTimer = null
        }
        vue.newWindows('/dialog/logout?reason=2', {width: 240, height: 120})
        loginStatus = true
        return Promise.reject(data)
      }
      if (data.errcode === -10000) { // 未登录或登录失效,
        if (global.globalMoniterTimer) {
          clearInterval(global.globalMoniterTimer)
          global.globalMoniterTimer = null
        }
        if (global.sessionMoniterTimer) {
          clearInterval(global.sessionMoniterTimer)
          global.sessionMoniterTimer = null
        }
        if (store.state.user.logoutStatus === -10001) {
          Cookie.setCookie('_token', '')
          store.dispatch('setToken', '')
          store.dispatch('windowChangeLoading', true)
          ipc.send('login-window-show')
          this.$store.dispatch('logoutStatus', 0)
          return Promise.reject(data)
        }
        if (loginStatus) return Promise.reject(data)
        if (islogout) return Promise.reject(data)
        islogout = true
        Cookie.setCookie('_token', '')
        store.dispatch('setToken', '')
        store.dispatch('windowChangeLoading', true)
        ipc.send('login-window-show')
        return Promise.reject(data)
      }
      vue.$message({
        message: data.message,
        type: 'error'
      })
      return Promise.reject(data)
    }
    // moniter 参数 online_status：在线状态
    if (res.config.url.indexOf('moniter') >= 0) {
      vue.$ipcSend('changeOnlineStatus', res.data)
    }
    loginStatus = false
    islogout = false
    return res.data
  },
  error => {
    console.log(error)
    if (error.message === 'Network Error') {
      return Promise.reject(error)
    }
    if (error.message || error.response.errcode > 0) {
      vue.$message({
        message: error.message || error.response.message,
        type: 'error'
      })
    }
    return Promise.reject(error)
  }
)

// 对axios的实例重新封装成一个plugin ,方便 Vue.use(xxxx)
export default {
  install: function (Vue) {
    if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
    Object.defineProperty(Vue.prototype, '$http', {
      value: axios
    })
  }
}
