import Axios from 'axios'
import store from '../store'
import router from '../router'
import db from './db'
const notifier = require('node-notifier')
const {
  ipcRenderer
} = require('electron')

/**
 * 轮询任务
 */
class Moniter {
  constructor () {
    this.moniterTimeOut = null
    this.loadingMoniter = false
    this.hasUnreadMsg = false // 是否有未读消息
    this.hasPlayAudio = false // 是否已播放过提示声
    this.unreadMessageArr = []
    this.lastUnreadMessageId = null
    this.$db = db.db
    this.close_learning_notice = 0
    this.wait_visitor_notice = 0
  }
  initMoniterTimeOut () {
    let self = this
    if (global.globalMoniterTimer) return
    this.hasPlayAudio = false
    this.lastUnreadMessageId = null
    this.$db.customSetting.loadDatabase()
    this.$db.customSetting.find({}, function (err, docs) {
      console.log(docs)
      if (err) {
        console.log(err)
      } else {
        if (docs && docs.length > 0) {
          self.close_learning_notice = docs[0].close_learning_notice
          self.wait_visitor_notice = docs[0].wait_visitor_notice
        }
      }
    })
    global.globalMoniterTimer = setInterval(() => {
      if (this.loadingMoniter) return
      this.loadingMoniter = true
      if (typeof router.currentRoute.query.winbox !== 'undefined') return;
      Axios.post('/moniter?').then((res) => {
        this.loadingMoniter = false
        // 新到访客
        this.handleClient(res.data.client)
        // 未读消息
        this.handleMessage(res.data.message)
      }).catch(() => {
        global.loadingMoniter = false
      })
    }, 2000)
  }
  // 处理新到访客
  handleClient (client) {
    console.log('client')
    console.log(client)
    if (client && client.length > 0) {
      if (!store.getters.hasNewClient) {
        store.dispatch('setHasNewClient', true)
      }
      if (this.wait_visitor_notice === 1) { // 个人设置》开启新到等待接待访客提醒
        notifier.notify({
          title: '新到访客 - 等待接待',
          icon: client[0].avatar,
          message: client[0].nickname + '来访',
          sound: true,
          wait: true
        }, function (error, response) {
          console.log(error)
        }).on('click', function () {
          router.push('/session?id=' + client[0].id)
        });
      }
    }
  }
  // 处理未读消息
  handleMessage (message) {
    console.log(message)
    if (message && message.length > 0) {
      this.unreadMessageArr = message.filter(element => {
        // 返回轮询消息里微信用户发的未读消息
        return element.custom_service_id === 0 && (element.action_id === 'wechat_leave_image' || element.action_id === 'wechat_leave_voice' || element.action_id === 'wechat_leave_video' || element.action_id === 'wechat_leave_location' || element.action_id === 'wechat_leave_link' || element.action_id === 'wechat_leave_message')
      })
      // 轮询消息按消息ID升序进行排序
      this.unreadMessageArr.sort((a, b) => {
        return a.id - b.id
      })
      // 和上一次返回的未读消息不同
      if (this.unreadMessageArr && this.unreadMessageArr.length > 0) {
        if (this.lastUnreadMessageId) {
          if (this.unreadMessageArr[this.unreadMessageArr.length - 1].id > this.lastUnreadMessageId) {
            this.lastUnreadMessageId = this.unreadMessageArr[this.unreadMessageArr.length - 1].id // 轮询里最后一条未读消息ID
            this.hasUnreadMsg = true
          } else {
            this.hasUnreadMsg = false
          }
        } else {
          this.lastUnreadMessageId = this.unreadMessageArr[this.unreadMessageArr.length - 1].id // 轮询里最后一条未读消息ID
          let lastReadMessageId = localStorage.getItem('lastReadMessageId') // 本地存储的已读的最后一条消息ID
          if (lastReadMessageId) {
            if (parseInt(this.lastUnreadMessageId) > parseInt(lastReadMessageId)) { // 当轮询最后一条消息ID大于本地存储的最后已读消息ID，则有未读消息
              this.hasUnreadMsg = true
            } else {
              this.hasUnreadMsg = false
            }
          } else {
            this.hasUnreadMsg = true
          }
        }
        if (this.hasUnreadMsg) {
          ipcRenderer.send('openTrayFlash', this.unreadMessageArr[this.unreadMessageArr.length - 1].clients_id, this.lastUnreadMessageId)
          if (this.close_learning_notice === 0 && !this.hasPlayAudio) { // 个人设置》关闭提示声
            let audio = document.getElementById('audioPlay')
            audio && audio.play()
          }
        }
      }
    }
  }
  clearMoniterTimeOut () {
    clearInterval(global.globalMoniterTimer)
    global.globalMoniterTimer = null
    ipcRenderer.send('closeTrayFlash')
  }
};
module.exports = Moniter
