<template>
  <div class="page-session">
    <div class="layout-row">
      <div class="layout-col layout-col-l">
        <!-- 选择消息类型 -->
        <div class="session-tab">
          <div class="tab-i" title="我的对话" :class="{'active': activeSessionType == 'new'}" @click="selectSessionType('new')">
            <i class="icon iconfont">&#xe615;</i>
          </div>
          <div class="tab-i" title="最近联系" :class="{'active': activeSessionType == 'history'}" @click="selectSessionType('history')">
            <i class="icon iconfont">&#xe6b9;</i>
          </div>
          <div class="tab-i" title="联系人" :class="{'active': activeSessionType == 'liaison'}" @click="selectSessionType('liaison')">
            <i class="icon iconfont">&#xe632;</i>
          </div>
        </div>
        <div class="session-main">
          <!-- 我的会话 -->
          <div class="session-main-new" v-show="activeSessionType == 'new'">
            <el-tree class="list-u"
              :data="shList"
              :props="defaultProps"
              :accordion="true"
              @node-click="handleNodeClick"
              node-key="label_type"
              :default-expanded-keys="defaultExpandedKeys"
              :highlight-current="true"
              ref="tree"
            >
              <template slot-scope="{ node, data }">
                <div class="list-u-label" :class="{'active': activeChatType == data.label}" v-if="data.label" @click="selectChatType(data.label)">
                  <span class="label">{{data.label}}</span>
                  <span class="badge">{{data.count}}</span>
                </div>
                <template v-else>
                  <msg-prompt :data="data" :activeChatUserId="nowUserId" v-on:selectChatUser="selectChatUser" v-on:receive="receive"></msg-prompt>
                </template>
              </template>
            </el-tree>
          </div>
          <!-- 最近联系 -->
          <div class="session-main-history" v-show="activeSessionType == 'history'">
            <div class="list-history">
              <div v-for="(item, index) in shHistoryList" :key="index">
                <msg-prompt :data="item" :activeChatUserId="nowUserId" v-on:selectChatUser="selectChatUserOther"></msg-prompt>
              </div>
            </div>
          </div>
          <!-- 联系人 -->
          <div class="session-main-liaison" v-show="activeSessionType == 'liaison'">
            <div class="visitor-select">
              <el-select v-model="labelSelect" filterable @visible-change="select" placeholder="标签搜索" ref='labelSelect'>
                <el-option-group
                  v-for="group in options"
                  :key="group.label"
                  :label="group.options == undefined? '':group.label"
                >
                  <template v-if="group.options == undefined">
                    <el-option :key="group.value" :label="group.label" :value="group.value"></el-option>
                  </template>
                  <template v-else>
                    <el-option
                      v-for="item in group.options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </template>
                </el-option-group>
              </el-select>
            </div>
            <div class="list-liaison">
              <div v-for="(item, index) in searchList" :key="index">
                <msg-prompt :data="item" :activeChatUserId="nowUserId" v-on:selectChatUser="selectChatUserOther"></msg-prompt>
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
            v-on:updateMsg="updateMsg"
            v-on:setNowUserId="setNowUserId"
            v-on:setDefaultExpandedKeys="setDefaultExpandedKeys"
            v-on:refreshLeftData="refreshLeftData"
            v-on:getData="getData"
            v-on:getUserInfo="getUserInfo"
            v-on:setUserInfoCompulsoryInvitation="setUserInfoCompulsoryInvitation"
            v-on:setShList="setShList"
            v-on:setShHistoryList="setShHistoryList"
            v-on:setUserInfo="setUserInfo"
            v-on:setUnableInvite="setUnableInvite"
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
      chat
    },
    data () {
      return {
        nowUserId: this.$route.query.uid || this.$store.getters.nowUser || '',
        keyWord: '', // 搜索关键字
        activeSessionType: 'new',
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
        userInfo: '', // 当前接待的客户信息
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
      let self = this
      global.hasHandleUnreadMsg = true
      this.setHasNewClient(false)
      this.getUserSearchList()
      this.defaultExpandedKeys = [sessionStorage.getItem('defaultExpandedKeys') || '']
      this.currentNodeKey = sessionStorage.getItem('currentNodeKey') || ''
      this.activeSessionType = sessionStorage.getItem('activeSessionType') || 'new'
      this.getData()
      ipcRenderer.send('closeTrayFlash')
      this.$ipcOn('refreshSearchList', (event, val) => {
        this.getUserSearchList()
      })
      this.$ipcOn('refreshVisitorList', (event, val) => {
        if (val.id) {
          this.labelSelect = val.id;
        } else {
          this.labelSelect = '自定义';
        }
        // 搜索
        this.select(false, 'dialog', val);
      });
      // 刷新访客信息
      this.$ipcOn('refreshUserInfo', (event, val) => {
        if (this.userInfo && this.nowUserId) {
          this.getUserInfo(this.nowUserId)
        }
      })
      // 关闭当前聊天
      this.$ipcOn('closeUserChat', (event, val) => {
        this.closeUserChat()
      })
      // 刷新左侧列表数据
      this.$ipcOn('refreshLeftData', (event, val) => {
        this.refreshLeftData()
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
      localStorage.setItem('lastReadMessageId', this.$route.query.msgId)
    },
    methods: {
      ...mapActions(['setHasNewClient', 'setDefaultExpandedKeys', 'setNowUser']),
      getData (isRefresh = false) {
        switch (this.activeSessionType) {
          case 'new':
            this.getShList(isRefresh)
            break;
          case 'history':
            this.getShHistoryList()
            break;
          default:
            break;
        }
      },
      handleNodeClick (data) {
        // if (data.label_type.includes('_')) {
        //   sessionStorage.setItem('currentNodeKey', data.label_type)
        //   sessionStorage.setItem('userId', data.id)
        // } else {
        //   sessionStorage.setItem('defaultExpandedKeys', data.label_type)
        // }
      },
      selectSessionType (i) {
        this.activeSessionType = i
        sessionStorage.setItem('activeSessionType', i)
        switch (i) {
          case 'new':
            this.getShList()
            break;
          case 'history':
            this.getShHistoryList()
            break;
          case 'liaison':
            // this.userSearchList()
            break;
  
          default:
            break;
        }
      },
      selectChatType (i) {
        this.activeChatType = i;
      },
      setNowUserId (i) {
        this.nowUserId = i
        this.setNowUser(i)
      },
      /**
       * 选择聊天对象
       */
      selectChatUser (item) {
        let self = this
        self.nowUserId = item.id
        self.currentNodeKey = item.id
        sessionStorage.setItem('currentNodeKey', item.label_type)
        sessionStorage.setItem('defaultExpandedKeys', item.label_type)
        this.setNowUser(item.id)
        self.$nextTick(() => {
          self.$refs.wxChat.resetPagination()
          self.$refs.wxChat.getMessage()
          self.getUserInfo()
        })
      },
      /**
       * 选择聊天对象
       */
      selectChatUserOther (item) {
        let self = this
        self.nowUserId = item.id
        self.setNowUser(item.id)
        self.$nextTick(() => {
          self.$refs.wxChat.resetPagination()
          self.$refs.wxChat.getMessage()
          self.getUserInfo()
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
      getShList (isRefresh = false) {
        let self = this
        if (this.loadingShList) return
        this.loadingShList = true
        this.$http.post('/user.get_sh_list').then((res) => {
          this.loadingShList = false
  
          let list1 = res.data.list1
          let list2 = res.data.list2
          let list3 = res.data.list3
          let list4 = res.data.list4
          list1.forEach(element => {
            element.group_type = '等待接待'
            element.label_type = '等待接待_' + element.id
            if (element.label_type === self.currentNodeKey) {
              !isRefresh && this.selectChatUser(element)
            }
          })
          list2.forEach(element => {
            element.group_type = '正在接待'
            element.label_type = '正在接待_' + element.id
            element.last_send_time_str = this.formatLastSendTime(element.last_send_time)
            if (element.label_type === self.currentNodeKey) {
              !isRefresh && this.selectChatUser(element)
            }
          })
          list3.forEach(element => {
            element.group_type = '在线访客'
            element.label_type = '在线访客_' + element.id
            element.last_send_time_str = this.formatLastSendTime(element.last_send_time)
            if (element.label_type === self.currentNodeKey) {
              !isRefresh && this.selectChatUser(element)
            }
          })
          list4.forEach(element => {
            element.group_type = '留言访客'
            element.label_type = '留言访客_' + element.id
            element.last_send_time_str = this.formatLastSendTime(element.last_send_time)
            if (element.label_type === self.currentNodeKey) {
              !isRefresh && this.selectChatUser(element)
            }
          })
          this.shList = [{
            label_type: '等待接待',
            label: res.data.list1_str,
            count: res.data.list1_count,
            children: list1
          }, {
            label_type: '正在接待',
            label: res.data.list2_str,
            count: res.data.list2_count,
            children: list2
          }, {
            label_type: '在线访客',
            label: res.data.list3_str,
            count: res.data.list3_count,
            children: list3
          }, {
            label_type: '留言访客',
            label: res.data.list4_str,
            count: res.data.list4_count,
            children: list4
          }]
          self.$nextTick(function () {
            console.log('currentNodeKey' + self.currentNodeKey)
            if (self.currentNodeKey) {
              console.log('设置：' + self.currentNodeKey)
              if (self.$refs.tree) {
                self.$refs.tree.setCurrentKey(self.currentNodeKey);
              }
            }
          })
        }).catch(() => {
          this.loadingShList = false
        })
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
      setDefaultExpandedKeys (arr) {
        this.defaultExpandedKeys = arr
      },
      /**
       * 访客查询初始化
       */
      async getUserSearchList () {
        let res = await this.$http.post('/user.search_list')
        this.userSearchList = res.data
      },
      select (flag, type, val) {
        if (flag) { return }
        if (this.labelSelect === '自定义' && type !== 'dialog') {
          this.$refs.labelSelect.blur();
          this.setWindow();
        } else {
          if (this.loadingSearchList) return
          this.loadingSearchList = true
          let params = {id: this.labelSelect}
          if (type === 'dialog') {
            params = {id: this.labelSelect, ...val}
          }
          this.$http.post('/user.get_search_list', params).then((res) => {
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
       * 刷新数据
       */
      refreshLeftData () {
        switch (this.activeSessionType) {
          case 'new':
            this.getShList()
            break;
          case 'history':
            this.getShHistoryList()
            break;

          default:
            break;
        }
        // this.getUserInfo()
      },
      /**
       * 获取当前接待的客户资料
       */
      getUserInfo (id) {
        console.log('刷新用户信息2')
        this.$http.post('/user.info', {
          id: id || this.nowUserId
        }).then((res) => {
          console.log('刷新用户信息3')
          this.userInfo = res.data
          let lastOperationTime = new Date(res.data.last_operation_time).getTime()
          let nowTime = new Date().getTime()
          let leftTime = nowTime - lastOperationTime
          if (parseInt(leftTime / 1000 / 3600) >= 48) { // 超过48小时后，无法正常邀请
            this.unableInvite = true
          } else {
            this.unableInvite = false
          }
        })
      },
      setUserInfo (i) {
        this.userInfo = i
      },
      setUnableInvite (i) {
        this.unableInvite = i
      },
      setUserInfoCompulsoryInvitation (i) {
        this.$set(this.userInfo, 'compulsory_invitation', i)
      },
      /**
       * 更新未读消息
       */
      updateMsg (data, isClients = false) {
        let self = this
        let unreadMessageCount = 0
        let unreadMessageCountHistory = 0
        self.shList.forEach((val, index, arr) => {
          self.shList[index].children.forEach(element => {
            if (element.id === data.clients_id) {
              if (data.action_id !== 'wechat_system_message') {
                if (isClients) {
                  element.message_count = unreadMessageCount++
                } else {
                  element.message_count = 0
                  element.user_status = data.user_status
                }
                element.last_client.action_value.content = data.action_value.content
              }
            }
          })
        })
        self.shHistoryList.forEach((val, index, arr) => {
          if (val.id === data.clients_id && !data.is_read) {
            if (data.action_id !== 'wechat_system_message') {
              if (isClients) {
                val.message_count = unreadMessageCountHistory++
              } else {
                val.message_count = 0
                val.user_status = data.user_status
              }
              val.last_client.action_value.content = data.action_value.content
            }
          }
        })
      },
      receive (id) {
        this.$refs.wxChat.receive(id)
      },
      setShList (data) {
        this.shList = data
      },
      setShHistoryList (data) {
        this.shHistoryList = data
      },
      /**
       * 关闭当前聊天
       */
      closeUserChat () {
        this.nowUserId = ''
        this.userInfo = ''
      }
    },
    watch: {
      moniterMessage () {
        // if (this.moniterMessage && this.moniterMessage.length > 0) {
        //   this.getShList();
        // }
      },
      moniterClient () {
        if (this.moniterClient && this.moniterClient.length > 0) {
          this.getShList()
        }
      },
      needRefreshShList () {
        if (this.needRefreshShList) {
          this.refreshLeftData()
          this.getUserInfo()
        }
      },
      hasNewClient () {
        if (this.hasNewClient) {
          this.getData()
        }
      }
    },
    computed: {
      ...mapGetters(['baseUserInfo', 'moniterMessage', 'moniterClient', 'needRefreshShList', 'hasNewClient']),
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
</style>