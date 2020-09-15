<template>
  <div class="page-session friend">
    <div class="layout-row">
      <div class="layout-col layout-col-l">
        <div class="col-l-inner">
          <div class="hd-menu">
            <el-radio-group v-model="activeSessionType" size="mini" @change="onChangeStatus">
              <el-radio-button label="visitor">访客：{{contactedList.length}}</el-radio-button>
              <el-radio-button label="customerService">客服：{{csList.length}}</el-radio-button>
            </el-radio-group>
            <el-popover
              placement="bottom-end"
              width="150"
              popper-class="popover-onlineStatus"
              trigger="click">
              <el-checkbox-group class="checkbox-onlineStatus" v-model="csOnlineStatus">
                <el-checkbox :label="0">
                  <img class="icon-onlineStatus" src="@/assets/images/top/online.png">在线
                </el-checkbox>
                <el-checkbox :label="1">
                  <img class="icon-onlineStatus" src="@/assets/images/top/offline.png">离开
                </el-checkbox>
                <el-checkbox :label="2">
                  <img class="icon-onlineStatus" src="@/assets/images/top/busy.png">忙碌
                </el-checkbox>
                <el-checkbox :label="3">
                  离线
                </el-checkbox>
                <el-checkbox :label="4">
                  PC端
                </el-checkbox>
                <el-checkbox :label="5">
                  移动端
                </el-checkbox>
              </el-checkbox-group>
              <span class="cs-status" slot="reference">客服状态<i class="el-icon-caret-bottom"></i></span>
            </el-popover>
          </div>
          <div class="bd-list">
            <div class="visitor" v-show="sessionType == 'visitor'">
              <div class="list-history">
                <div v-for="(item, index) in contactedList" :key="index">
                  <msg-prompt :data="item" :activeChatUserId="nowUser.id" v-on:selectChatUser="selectChatUser"></msg-prompt>
                </div>
              </div>
            </div>
            <div class="customer-service" v-show="sessionType == 'customerService'">
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
                      <msg-prompt :data="item" :activeChatUserId="nowUser.id" v-on:selectChatUser="selectChatUser"></msg-prompt>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 匹配到对应客户，则显示对话窗 -->
      <template v-if="nowUser && nowUser.id">
        <div class="layout-col layout-col-c" :span="12">
          <left-chat
            :messageList="messageList"
            :userInfo="userInfo"
            :baseUserInfo="baseUserInfo"
            :loadingMessageList="loadingMessageList"
            :loadSending="loadSending"
            :loadEnd="loadEnd"
            v-on:setMessageList="setMessageList"
            v-on:getShList="getShList"
            v-on:receive="receive"
            v-on:sendMessage="sendMessage"
            v-on:sendMultiple="sendMultiple"
            v-on:loadMoreMsg="loadMoreMsg"
            ref="left_chat">
          </left-chat>
        </div>
        <div class="layout-col layout-col-r" :span="6">
          <right-menu v-if="Object.keys(userInfo).length>0" :user="userInfo" :baseUserInfo="baseUserInfo" :messageList="messageList" :inviteList="inviteList"></right-menu>
        </div>
      </template>
      <!-- 没匹配到对应客户，则显示操作小技巧 -->
      <template v-else>
        <div class="layout-col layout-col-r layout-col-r-tip" :span="18">
          <chat-tip></chat-tip>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar'
import msgPrompt from '@/components/session/msgPrompt'
import LeftChat from '@/components/session/LeftChat'
import rightMenu from '@/components/session/rightMenu'
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
    LeftChat,
    rightMenu,
    chatTip
  },
  data () {
    return {
      nowUser: {},
      keyWord: '', // 搜索关键字
      activeFriendSessionType: 'visitor',
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
      csOnlineStatus: '0', // 客服状态
      contactedList: '', // 最近联系人
      contactedByCsList: '', // 最近联系人
      csList: '', // 客服列表
      activeCsId: '', // 当前选中的客服ID
      searchKey: '' // 搜索客服名称，部门关键字
    }
  },
  created () {
    this.defaultExpandedKeys = [sessionStorage.getItem('defaultExpandedKeys') || '']
    this.activeSessionType = sessionStorage.getItem('activeFriendSessionType') || 'new'
    this.getContactedList()
    this.getList()
  },
  mounted () {
    let self = this
    document.getElementById('input_search').addEventListener('keyup', (e) => {
      if (e.keyCode === 13) {
        self.getList(this.searchKey)
      }
    })
  },
  methods: {
    onClickCs (id) {
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
    async getList (name = '') {
      let res = await this.$http.post('/cs.get_list', {
        name: name
      })
      this.csList = res.data
    },

    /**
     * 获取最近联系人列表
     */
    getContactedList () {
      this.$http.post('/user.get_contacted_list').then((res) => {
        this.contactedList = res.data.list
      })
    },
    ...mapActions(['setNeedRefreshShList', 'setHasNewClient', 'setDefaultExpandedKeys']),
    getData () {
      switch (this.activeSessionType) {
        case 'new':
          this.getShList()
          break;
        case 'history':
          this.getShHistoryList()
          break;
        case 'liaison':
          // this.getShHistoryList()
          break;
        default:
          break;
      }
    },
    handleNodeClick (data) {
      if (data.label_type.includes('_')) {
        sessionStorage.setItem('currentNodeKey', data.label_type)
        sessionStorage.setItem('userId', data.id)
      } else {
        sessionStorage.setItem('defaultExpandedKeys', data.label_type)
      }
    },
    send () {
      ipcRenderer.send('openTrayFlash')
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
        this.setNeedRefreshShList(false)
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
          if (self.currentNodeKey) {
            self.$refs.tree.setCurrentKey(self.currentNodeKey);
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
    /**
       * 接待客户
       */
    receive (id) {
      this.$http.post('/user.reception', {
        id: id
      }).then((res) => {
        this.defaultExpandedKeys = ['正在接待']
        this.getShList()
        this.getUserInfo(id)
      });
    },
    setMessageList (i) {
      this.messageList = i
    },
    /**
       * 获取当前接待的客户资料
       */
    getUserInfo (id) {
      this.$http.post('/user.info', {
        id: id || this.nowUser.id
      }).then((res) => {
        this.userInfo = res.data
      })
    },
    /**
       * 获取聊天记录
       */
    getMessage (isLoadMore = false) {
      let self = this
      let page
      self.isLoadMore = isLoadMore
      if (self.loadingMessageList) return
      self.loadingMessageList = true
      if (self.isLoadMore) {
        page = self.page
      } else {
        page = 1
        self.messageList = []
      }
      self.$http.post('/weixin.getmessage', {
        id: self.nowUser.id,
        page: page,
        pagesize: 20
      }).then((res) => {
        let list = self.isLoadMore ? res.data.list.reverse() : res.data.list
        self.loadingMessageList = false
        self.messageList = [...list, ...self.messageList]
        self.hasNext = res.data.has_next
        if (self.hasNext) {
          self.page++
          self.loadEnd = false
        } else {
          self.loadEnd = true
        }
        if (global.sessionMoniterTimer === null) {
          self.moniter()
        }
      }).catch(() => {
        self.loadingMessageList = false
        self.isLoadMore = false
      })
    },
    /**
       *  发送消息
       */
    sendMessage (params) {
      let self = this
      let data = Object.assign({}, { id: self.userInfo.id }, params)
      if (self.loadSending) return
      self.loadSending = true
      if (params.contentType === 'multipart/form-data') {
        // 二进制数据类型
        self.$http.post('/weixin.send', params.data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          self.loadSending = false
          self.messageList.push(res.data)
          self.$refs.left_chat.resetFormChat()
          self.getShList(true)
        }).catch(() => {
          self.loadSending = false
        })
      } else {
        self.$http.post('/weixin.send', data).then((res) => {
          self.loadSending = false
          self.messageList.push(res.data)
          self.$refs.left_chat.resetFormChat()
          self.getShList(true)
        }).catch(() => {
          self.loadSending = false
        })
      }
    },
    /**
       *  发送多素材
       */
    sendMultiple (params) {
      let self = this
      let data = Object.assign({}, { id: self.userInfo.id }, params)
      if (self.loadSending) return
      self.loadSending = true
      self.$http.post('/weixin.multiple_send', data).then((res) => {
        self.loadSending = false
        self.messageList = [...self.messageList, ...res.data]
        self.$refs.left_chat.resetFormChat()
      }).catch(() => {
        self.loadSending = false
      })
    },
    /**
       * 轮询聊天消息
       */
    moniter () {
      let self = this
      clearInterval(global.sessionMoniterTimer)
      global.sessionMoniterTimer = null
      global.sessionMoniterTimer = setInterval(() => {
        if (self.loadingMoniter) return
        let messageListArr = []
        let messageList = self.messageList
        self.loadingMoniter = true
        console.log('getmonter')
        self.$http.post('/moniter').then((res) => {
          let message = res.data.message
          // 客户来信息
          if (message && message.length > 0) {
            message.forEach(elMessage => {
              // 轮询消息和当前用户ID一致，则添加至聊天记录里
              if (elMessage.clients_id === self.nowUser.id) {
                // hasNewMsg - 返回聊天记录是否已存在的消息（与当前新消息相同的ID）
                // hasAddedNewMsg - 新消息是否添加至数组messageListArr
                let hasNewMsg = true
                let hasAddedNewMsg = false

                if (messageList && messageList.length > 0) {
                  try {
                    messageList.forEach((elMessageList) => {
                      if (elMessageList.id === elMessage.id) {
                        hasAddedNewMsg = true
                        throw new Error('EndIterative')
                      }
                    })
                  } catch (e) {
                    if (e.message !== 'EndIterative') {
                      throw e
                    }
                  }
                }
                if (!hasAddedNewMsg && messageListArr && messageListArr.length > 0) {
                  try {
                    messageListArr.forEach((elMessageListArr) => {
                      if (elMessageListArr.id === elMessage.id) {
                        hasNewMsg = false
                        throw new Error('EndIterative_2')
                      }
                    })
                  } catch (e) {
                    if (e.message !== 'EndIterative_2') {
                      throw e
                    }
                  }
                }
                if (hasNewMsg && !hasAddedNewMsg) {
                  messageListArr.push(elMessage)
                }
              }
            });
            if (messageListArr && messageListArr.length > 0) {
              messageList = [...messageList, ...messageListArr]
              self.messageList = messageList
              self.getShList(true)
              // 监听发送语音消息成功
              ipcRenderer.send('openTrayFlash')
              ipcRenderer.send('flashFrame')
            }
          }
          self.loadingMoniter = false
        }).catch(() => {
          self.loadingMoniter = false
        })
      }, 1500)
    },
    /**
       * 滚动至最新消息
       */
    scrollToBottom () {
      this.$nextTick(() => {
        let listEl = document.querySelector('.chat-bd')
        if (listEl) {
          this.listScrollHeight = listEl.scrollHeight
          listEl.scrollTop = this.listScrollHeight
        }
      })
    },
    /**
       * 将匹配结果替换表情图片
       */
    emotion (res) {
      let wordSelf = res.replace(/\[|\]/gi, '')
      let wordOther = res
      const listSelf = ['微笑', '撇嘴', '色', '发呆', '得意', '流泪', '害羞', '闭嘴', '睡', '大哭', '尴尬', '发怒', '调皮', '呲牙', '惊讶', '难过', '酷', '冷汗', '抓狂', '吐', '偷笑', '可爱', '白眼', '傲慢', '饥饿', '困', '惊恐', '流汗', '憨笑', '大兵', '奋斗', '咒骂', '疑问', '嘘', '晕', '折磨', '衰', '骷髅', '敲打', '再见', '擦汗', '抠鼻', '鼓掌', '糗大了', '坏笑', '左哼哼', '右哼哼', '哈欠', '鄙视', '委屈', '快哭了', '阴险', '亲亲', '吓', '可怜', '菜刀', '西瓜', '啤酒', '篮球', '乒乓', '咖啡', '饭', '猪头', '玫瑰', '凋谢', '示爱', '爱心', '心碎', '蛋糕', '闪电', '炸弹', '刀', '足球', '瓢虫', '便便', '月亮', '太阳', '礼物', '拥抱', '强', '弱', '握手', '胜利', '抱拳', '勾引', '拳头', '差劲', '爱你', 'NO', 'OK', '爱情', '飞吻', '跳跳', '发抖', '怄火', '转圈', '磕头', '回头', '跳绳', '挥手', '激动', '乱舞', '献吻', '左太极', '右太极']
      const listOther = ['/::)', '/::~', '/::B', '/::|', '/:8-)', '/::<', '/::$', '/::X', '/::Z', '/::’(', '/::-|', '/::@', '/::P', '/::D', '/::O', '/::(', '/::+', '/:–b', '/::Q', '/::T', '/:,@P', '/:,@-D', '/::d', '/:,@o', '/::g', '/:|-)', '/::!', '/::L', '/::>', '/::,@', '/:,@f', '/::-S', '/:?', '/:,@x', '/:,@@', '/::8', '/:,@!', '/:!!!', '/:xx', '/:bye', '/:wipe', '/:dig', '/:handclap', '/:&-(', '/:B-)', '/:<@', '/:@>', '/::-O', '/:>-|', '/:P-(', '/::’|', '/:X-)', '/::*', '/:@x', '/:8*', '/:pd', '/:<W>', '/:beer', '/:basketb', '/:oo', '/:coffee', '/:eat', '/:pig', '/:rose', '/:fade', '/:showlove', '/:heart', '/:break', '/:cake', '/:li', '/:bome', '/:kn', '/:footb', '/:ladybug', '/:shit', '/:moon', '/:sun', '/:gift', '/:hug', '/:strong', '/:weak', '/:share', '/:v', '/:@)', '/:jj', '/:@@', '/:bad', '/:lvu', '/:no', '/:ok', '/:love', '/:', '/:jump', '/:shake', '/:', '/:circle', '/:kotow', '/:turn', '/:skip', '/:&>', '/:#-0', '/:hiphot', '/:kiss', '/:<&', '/:oY']
      let indexSelf = listSelf.indexOf(wordSelf)
      let indexOther = listOther.indexOf(wordOther)
      if (indexSelf >= 0) {
        return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${indexSelf}.gif" align="middle">`
      } else if (indexOther >= 0) {
        return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${indexOther}.gif" align="middle">`
      } else {
        return ''
      }
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
      this.newWindows('/dialog/filter', { width: 600, height: 480 });
    },
    /**
       * 加载更多
       */
    loadMoreMsg () {
      this.getMessage(true)
    }
  },
  watch: {
    csOnlineStatus () {

    },
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
        this.getShList()
      }
    },
    nowUser () {
      console.log(2222)
      this.getUserInfo()
      this.getMessage()
    },
    messageList () {
      let self = this
      if (self.messageList && self.messageList.length > 0) {
        self.messageList.map(e => {
          switch (e.action_id) {
            case 'wechat_leave_message': // 文本消息
              // 解析emoji表情
              e.action_value.content = parser(e.action_value.content)
              e.action_value.content = parserWechat(e.action_value.content)
              // 替换链接，改成外部浏览器打开
              e.action_value.content = e.action_value.content.replace(/<a /g, '<a onclick=\'return jumpUrl(this)\' ')
              break;
            case 'wechat_leave_image': // 图片消息
              //  图片展示规格
              // e.action_value.source_oss_url = `${e.action_value.source_oss_url}?x-oss-process=image/resize,w_200,h_200,limit_1,m_fill`
              break;
            case 'wechat_leave_location': // 位置消息
              //  图片展示规格
              e.action_value.location_img = `https://st.map.qq.com/api?size=211*211&center=${e.action_value.location_y}%2C${e.action_value.location_x}&zoom=15&markers=${e.action_value.location_y}%2C${e.action_value.location_x}`
              break;

            default:
              break;
          }
        });
      }
      if (!self.isLoadMore) {
        self.scrollToBottom()
      }
      self.isLoadMore = false
    }
  },
  computed: {
    ...mapGetters({
      'baseUserInfo': 'baseUserInfo',
      'moniterMessage': 'moniterMessage',
      'moniterClient': 'moniterClient',
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