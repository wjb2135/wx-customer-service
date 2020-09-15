<template>
  <div class="page-session friend">
    <div class="layout-row">
      <div class="layout-col layout-col-l" v-loading="loadingGetList">
        <div class="col-l-inner">
          <div class="hd-menu">
            <el-radio-group v-model="activeSessionType" size="mini" @change="selectSessionType">
              <el-radio-button label="visitor">访客：{{visitorNum}}</el-radio-button>
              <el-radio-button label="customerService">客服：{{csNum}}</el-radio-button>
            </el-radio-group>
            <el-popover
              placement="bottom-end"
              width="150"
              popper-class="popover-onlineStatus"
              v-show="activeSessionType == 'customerService'"
              trigger="click">
              <el-checkbox-group class="checkbox-onlineStatus" v-model="online_status" v-loading="loadingGetList" @change="handleCheckedCitiesChange">
                <el-checkbox label=1>
                  <img class="icon-onlineStatus" src="@/assets/images/top/online.png">在线
                </el-checkbox>
                <el-checkbox label=2>
                  <img class="icon-onlineStatus" src="@/assets/images/top/leave.png">离开
                </el-checkbox>
                <el-checkbox label=3>
                  <img class="icon-onlineStatus" src="@/assets/images/top/busy.png">忙碌
                </el-checkbox>
                <el-checkbox label=0>
                  <img class="icon-onlineStatus" src="@/assets/images/top/offline.png">离线
                </el-checkbox>
              </el-checkbox-group>
              <span class="cs-status" slot="reference">客服状态<i class="el-icon-caret-bottom"></i></span>
            </el-popover>
          </div>
          <div class="bd-list">
            <div class="visitor" v-show="activeSessionType == 'visitor'">
              <div class="list-history">
                <div v-for="(item, index) in contactedList" :key="index">
                  <msg-prompt :data="item" :activeChatUserId="userInfo.id" v-on:selectChatUser="selectChatUser" v-on:receive="receive"></msg-prompt>
                </div>
              </div>
            </div>
            <div class="customer-service" v-show="activeSessionType == 'customerService'">
              <div class="search-bar">
                <el-input
                  placeholder="搜索客服名称，部门"
                  suffix-icon="el-icon-search"
                  size="mini"
                  id="input_search"
                  v-model="searchKey">
                </el-input>
              </div>
              <div class="list-cs">
                <div class="item-cs" v-for="(item, index) in csList" :key="index">
                  <div class="item-cs-inner" @click="onClickCs(item.id)">
                    <span class="visitor-num">{{item.clients_count}}</span>
                    <span class="name">{{item.nickname}}</span>
                    <span class="icon-show"><template v-if="activeCsId === item.id">-</template><template v-else>+</template></span>
                  </div>
                  <template v-if="activeCsId === item.id">
                    <div v-for="(item, index) in contactedByCsList" :key="index">
                      <msg-prompt :data="item" :activeChatUserId="userInfo.id" v-on:selectChatUser="selectChatUser"></msg-prompt>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 匹配到对应客户，则显示对话窗 -->
      <template v-if="nowUserId">
        <div class="layout-col layout-col-c" :span="12">
          <chat
            :nowUserId="nowUserId"
            :userInfo="userInfo"
            :hideWindow="hideWindow"
            :unableInvite="unableInvite"
            :shList="shList"
            :shHistoryList="shHistoryList"
            :contactedList="contactedList"
            :contactedByCsList="contactedByCsList"
            v-on:updateMsg="updateMsg"
            v-on:setNowUserId="setNowUserId"
            v-on:setDefaultExpandedKeys="setDefaultExpandedKeys"
            v-on:refreshData="refreshData"
            v-on:getData="getData"
            v-on:getUserInfo="getUserInfo"
            v-on:setUserInfoCompulsoryInvitation="setUserInfoCompulsoryInvitation"
            v-on:setContactedList="setContactedList"
            v-on:setContactedByCsList="setContactedByCsList"
            ref="wxChat">
          </chat>
        </div>
        <div class="layout-col layout-col-r" :span="6">
          <right-menu v-if="Object.keys(userInfo).length>0" :user="userInfo" :baseUserInfo="baseUserInfo"></right-menu>
        </div>
      </template>
      <!-- 没匹配到对应客户，则显示操作小技巧 -->
      <template v-else>
        <div class="layout-col layout-col-r layout-col-r-tip" :span="18">
          <div class="chat-tip">
            <img src="@/assets/images/app/logo.png" class="chat-tip-logo">
            <div class="chat-tip-info">
              <div class="tip-title">使用小技巧</div>
              <div class="tip-info">轮询分配适合访客量不大的营销型企业</div>  
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar'
import msgPrompt from '@/components/session/msgPrompt'
import rightMenu from '@/components/session/rightMenu'
import chat from '@/components/session/chat'
import { normalize, parser, parserWechat } from '@/utils/emoji'
import chatTip from '@/components/session/chatTip'
import { mapGetters, mapActions } from 'vuex'
const {
  ipcRenderer
} = require('electron')
const BenzAMRRecorder = require('benz-amr-recorder')
export default {
  components: {
    searchBar,
    msgPrompt,
    rightMenu,
    chatTip,
    chat
  },
  data () {
    return {
      nowUserId: this.$route.query.uid || this.$store.getters.nowUser || '',
      nowUser: {},
      keyWord: '', // 搜索关键字
      activeSessionType: sessionStorage.getItem('storageFriend__activeSessionType') || 'visitor',
      activeUserId: Number(sessionStorage.getItem('storageFriend_activeUserId')) || '',
      activeChatType: '',
      customServiceId: '', // 接待的客服ID
      defaultExpandedKeys: [], // 默认展开的客户列表
      inviteList: [], // 预约邀请列表
      shList: [], // 我的对话
      shHistoryList: [], // 最近联系人
      searchList: [], // 联系人
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      hasNext: 0, // 是否还有下一页聊天内容
      isSendSuccess: false, // 是否发送成功
      userInfo: {}, // 当前接待的客户信息
      messageList: [], // 聊天记录
      loadingMessageList: false, // 聊天记录加载指示器
      loadingMoniter: false, // 轮询加载指示器
      loadingContactedList: false, // 最近联系列表加载指示器
      loadingShList: false, // 我的对话列表加载指示器
      labelSelect: '',
      userSearchList: '',
      loadingSearchList: false, // 从我的收藏里筛选用户加载指示器
      loadSending: false, // 发送消息加载指示器
      page: 1,
      loadEnd: false, // 加载所有聊天记录
      isLoadMore: false,
      activeChatUserId: '',
      sessionType: 'visitor', // 会话类型
      online_status: [], // 客服状态
      contactedList: '', // 最近联系人
      contactedByCsList: '', // 最近联系人
      csList: '', // 客服列表
      activeCsId: '', // 当前选中的客服ID
      searchKey: '', // 搜索客服名称，部门关键字
      storageFriend_activeSessionType: 'visitor', // 好友对话类型
      visitorNum: sessionStorage.getItem('storageFriend_visitorNum'), // 访客数量
      csNum: sessionStorage.getItem('storageFriend_csNum'), // 客服数量
      loadingGetList: false,
      unableInvite: false, // 48小时后无法正常邀请
      showTipSendMSgNull: false, // 发送内容为空提示
      lastDate: null,
      hideWindow: false
    }
  },
  beforeRouteLeave (to, from, next) {
    if (global.sessionMoniterTimer) {
      clearInterval(global.sessionMoniterTimer)
      global.sessionMoniterTimer = null
      next()
    } else {
      next()
    }
  },
  created () {
    global.hasHandleUnreadMsg = true
    ipcRenderer.send('closeTrayFlash')
    this.getContactedList()
    this.getList()
    this.$ipcOn('refreshUserInfo', (event, val) => {
      if (this.userInfo && this.nowUserId) {
        this.getUserInfo(this.nowUserId)
      }
    })
    this.ipc.on('showWindow', () => {
      self.hideWindow = false
    })
    this.ipc.on('hideWindow', () => {
      self.hideWindow = true
    })
    if (this.nowUserId) {
      this.getUserInfo()
    }
  },
  mounted () {
    let self = this
    document.getElementById('input_search').addEventListener('keyup', (e) => {
      if (e.keyCode === 13) {
        self.getList()
      }
    })
  },
  methods: {
    ...mapActions(['setNeedRefreshShList', 'setHasNewClient', 'setDefaultExpandedKeys', 'setNowUser']),
    onClickCs (id = this.activeCsId) {
      if (this.activeCsId === id) {
        this.activeCsId = ''
      } else {
        this.$http.post('/user.get_contacted_list', {
          id: id
        }).then((res) => {
          this.activeCsId = id
          this.contactedByCsList = res.data.list
        })
      }
    },
    onChangeStatus (i) {
      switch (i) {
        case 'visitor':
          this.getContactedList()
          break;
        case 'customerService':
          this.getList()
          break;

        default:
          break;
      }
    },
    /**
     * 获取客服列表
     */
    async getList () {
      let res = await this.$http.post('/cs.get_list', {
        name: this.searchKey,
        online_status: this.online_status.join(',')
      })
      this.loadingGetList = false
      this.csList = res.data
      this.csNum = this.csList.length
      sessionStorage.setItem('storageFriend_csNum', res.data.length)
    },

    /**
     * 获取最近联系人列表
     */
    getContactedList () {
      this.$http.post('/user.get_contacted_list').then((res) => {
        this.contactedList = res.data.list
        this.visitorNum = this.contactedList.length
        sessionStorage.setItem('storageFriend_visitorNum', this.contactedList.length)
        this.contactedList.forEach((val, arr, index) => {
          if (val.id === this.activeUserId) {
            this.nowUser = val
            this.nowUserId = val.id
          }
        })
      })
    },
    handleNodeClick (data) {
      if (data.label_type.includes('_')) {
        sessionStorage.setItem('currentNodeKey', data.label_type)
        sessionStorage.setItem('userId', data.id)
      } else {
        sessionStorage.setItem('defaultExpandedKeys', data.label_type)
      }
    },
    selectSessionType (i) {
      this.activeSessionType = i
      sessionStorage.setItem('storageFriend__activeSessionType', i)
      switch (i) {
        case 'visitor':
          this.getContactedList()
          break;
        case 'customerService':
          this.getList()
          break;

        default:
          break;
      }
    },
    /**
     * 更新搜索关键字
     */
    setKeyWord (keyWord) {
      this.keyWord = keyWord;
    },
    selectChatType (i) {
      this.activeChatType = i;
    },
    /**
     * 选择聊天对象
     */
    selectChatUser (item) {
      this.nowUser = item
      this.nowUserId = item.id
      this.activeUserId = item.id
      sessionStorage.setItem('storageFriend_activeUserId', item.id)
      this.setNowUser(item.id)
      this.$nextTick(() => {
        this.getUserInfo()
        this.$refs.wxChat.getMessage()
      })
    },
    /**
     * 格式化最后发送时间
     */
    formatLastSendTime (lastSendTime) {
      const nowDate = new Date()
      const date = new Date(lastSendTime)
      // 格式化最后发送时间
      if (date > 0) {
        if (nowDate.getMonth() !== date.getMonth() && nowDate.getDate() !== date.getDate()) {
          return `${this.formatTime(date.getMonth())}-${this.formatTime(date.getDate())}`
        } else {
          return `${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}:${this.formatTime(date.getSeconds())}`
        }
      } else {
        return ''
      }
    },
    /**
     * 获取我的对话
     */
    getShList () {
      switch (this.activeSessionType) {
        case 'visitor':
          this.getContactedList()
          break;
        case 'customerService':
          this.getList()
          break;

        default:
          break;
      }
    },
    /**
     * 格式化时间
     */
    formatTime (i) {
      return i < 10 ? '0' + i : i
    },
    /**
     * 获取最近联系
     */
    getShHistoryList () {
      if (this.loadingContactedList) return
      this.loadingContactedList = true
      this.$http.post('/user.get_contacted_list').then((res) => {
        this.loadingContactedList = false
        this.shHistoryList = res.data.list
        const nowDate = new Date()
        this.shHistoryList.forEach(element => {
          const date = new Date(element.last_send_time)
          // 格式化最后发送时间
          if (date > 0) {
            if (nowDate.getMonth() !== date.getMonth() && nowDate.getDate() !== date.getDate()) {
              element.last_send_time_str = `${this.formatTime(date.getMonth())}-${this.formatTime(date.getDate())}`
            } else {
              element.last_send_time_str = `${this.formatTime(date.getHours())}:${this.formatTime(date.getMinutes())}:${this.formatTime(date.getSeconds())}`
            }
          }
        });
      }).catch(() => {
        this.loadingContactedList = false
      })
    },
    setMessageList (i) {
      this.messageList = i
    },
    /**
     * 获取当前接待的客户资料
     */
    getUserInfo (id) {
      this.$http.post('/user.info', {
        id: id || this.nowUserId
      }).then((res) => {
        this.userInfo = res.data
      })
    },
    /**
     * 预约邀请列表
     */
    getResIndex () {
      this.$http.post('/res.index').then((res) => {
        this.inviteList = res.data.data
      })
    },
    /**
     * 访客查询初始化
     */
    async getUserSearchList () {
      let res = await this.$http.post('/user.search_list')
      this.userSearchList = res.data
    },
    select (e) {
      if (this.labelSelect === '自定义') {
        this.setWindow();
      } else {
        if (this.loadingSearchList) return
        this.loadingSearchList = true
        this.$http.post('/user.get_search_list', {
          id: e
        }).then((res) => {
          this.loadingSearchList = false
          this.searchList = res.data.list
        }).catch(() => {
          this.loadingSearchList = false
        })
      }
    },
    /**
     * 自定义弹窗
     */
    setWindow () {
      this.newWindows('/dialog/filter', { width: 780, height: 480 });
    },
    /**
     * 加载更多
     */
    loadMoreMsg () {
      this.getMessage(true)
    },
    handleCheckedCitiesChange (value) {
      if (this.loadingGetList) return
      this.loadingGetList = true
      this.getList()
    },
    setNowUserId (i) {
      this.nowUserId = i
      this.setNowUser(i)
    },
    setUserInfoCompulsoryInvitation (i) {
      this.$set(this.userInfo, 'compulsory_invitation', i)
    },
    getData (isRefresh = false) {
      // switch (this.activeSessionType) {
      //   case 'new':
      //     this.getShList(isRefresh)
      //     break;
      //   case 'history':
      //     this.getShHistoryList()
      //     break;
      //   default:
      //     break;
      // }
    },
    /**
     * 刷新数据
     */
    refreshData () {
      // switch (this.activeSessionType) {
      //   case 'new':
      //     this.getShList()
      //     break;
      //   case 'history':
      //     this.getShHistoryList()
      //     break;

      //   default:
      //     break;
      // }
      // this.getUserInfo()
    },
    /**
     * 更新未读消息
     */
    updateMsg (data) {
      // let self = this
      // self.shList.forEach((val, index, arr) => {
      //   self.shList[index].children.forEach(element => {
      //     if (element.id === data.clients_id && !data.is_read) {
      //       element.message_count = 0
      //       element.last_client.action_value.content = data.action_value.content
      //       element.user_status = data.user_status
      //     }
      //   })
      // })
      // self.shHistoryList.forEach((val, index, arr) => {
      //   if (val.id === data.clients_id && !data.is_read) {
      //     val.message_count = 0
      //     val.last_client.action_value.content = data.action_value.content
      //     val.user_status = data.user_status
      //   }
      // })
    },
    receive (id) {
      this.$refs.wxChat.receive(id)
    },
    setContactedList (data) {
      this.contactedList = data
    },
    setContactedByCsList (data) {
      this.contactedByCsList = data
    }
  },
  watch: {
    needRefreshShList () {
      if (this.needRefreshShList) {
        if (this.activeSessionType === 'visitor') {
          this.getContactedList()
        } else {
          this.getList()
        }
      }
    }
  },
  computed: {
    ...mapGetters({
      'baseUserInfo': 'baseUserInfo',
      'moniterMessage': 'moniterMessage',
      'needRefreshShList': 'needRefreshShList'
    }),
    options () {
      let optionsArr = []
      if (this.userSearchList && this.userSearchList.search_list) {
        let res = this.userSearchList.search_list
        let arr = []
        if (res && res.length > 0) {
          res.forEach(element => {
            arr.push({
              value: element.id,
              label: element.name
            })
          });
          optionsArr = [
            {
              value: '自定义',
              label: '自定义'
            },
            {
              label: '我的收藏',
              options: arr
            }
          ]
        } else {
          optionsArr = [
            {
              value: '自定义',
              label: '自定义'
            },
            {
              label: '我的收藏',
              options: []
            }
          ]
        }
      } else {
        optionsArr = [
          {
            value: '自定义',
            label: '自定义'
          },
          {
            label: '我的收藏',
            options: []
          }
        ]
      }
      if (this.labelSelect === '') {
        if (optionsArr.length > 0 && optionsArr[1] && optionsArr[1].options[0]) {
          this.labelSelect = optionsArr[1].options[0].value
          this.select(this.labelSelect)
        }
      }
      return optionsArr
    }
  }
}
</script>

<style lang="less">
  @import "../../assets/css/sessionIndex.less";
  .friend {
    .col-l-inner {
      padding-top: 50px;
    }
    .hd-menu {
      padding: 10px;
      border-bottom: 1px solid @border-color;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      top: 40px;
      width: 249px;
      z-index: 999;
      background-color: #fff;
      .cs-status {
        font-size: 12px;
        cursor: pointer;
      }
    }
    .bd-list {
      .search-bar {
        padding: 15px;
      }
      .list-cs {
        .item-cs {
          .item-cs-inner {
            background-color: #eee;
            border-bottom: 1px solid @border-color;
            display: flex;
            align-items: center;
            height: 30px;
            margin: 1px 0;
            cursor: pointer;
          }
          .visitor-num {
            width: 50px;
            height: 100%;
            background-color: #f7f7f7;
            color: @color-primary;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .name {
            flex-shrink: 1;
            width: 100%;
            height: 100%;
            padding: 0 10px;
            display: flex;
            align-items: center;
          }
          .icon-show {
            width: 15px;
            height: 15px;
            background-color: #bbb;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
            margin-right: 10px;
            font-family: monospace;
          }
        }
      }
    }
  }
  .popover-onlineStatus {
    min-width: 100px !important;
    width: 100px !important;
  }
  .checkbox-onlineStatus {
    .el-checkbox {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 5px 0;
      .el-checkbox__label {
        display: flex;
        font-size: 12px;
        align-items: center;
      }
      .icon-onlineStatus {
        margin-right: 5px;
        width: 14px;
      }
    }
  }
</style>