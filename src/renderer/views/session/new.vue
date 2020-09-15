<template>
  <div class="page-session-new">
    <div class="layout-row">
      <div class="chat-top drag">
        <span class="chat-top-l">{{baseUserInfo.nickname}}的对话</span>
        <span class="chat-top-r no-drag">
          <i class="icon iconfont" @click="minWindows" title="最小化">&#xe68d;</i>
          <i class="icon iconfont" @click="maxWindows" title="最大化/还原">&#xe68c;</i>
          <i class="icon iconfont" @click="hideWindows" title="关闭">&#xe690;</i>
        </span>
      </div>
      <div class="layout-col layout-col-l">
        <div class="list-user">
          <div
            class="item-user"
            :class="{'active': item.id == nowUser.id}"
            v-for="(item, index) in userList"
            :key="index"
            @click="selectChatUser(item)"
          >
            <div class="avatar">
              <img :src="item.avatar" />
            </div>
            <div class="name">
              {{item.nickname}}</div>
            <div class="close" @click.stop="delChatUser(item)">
              <i class="iconfont">&#xe88a;</i>
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
            :type="type"
            v-on:updateMsg="updateMsg"
            v-on:setNowUserId="setNowUserId"
            v-on:setDefaultExpandedKeys="setDefaultExpandedKeys"
            v-on:refreshData="refreshData"
            v-on:getData="getData"
            v-on:getUserInfo="getUserInfo"
            v-on:setUserInfoCompulsoryInvitation="setUserInfoCompulsoryInvitation"
            v-on:setShList="setShList"
            v-on:setShHistoryList="setShHistoryList"
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
import { mapGetters, mapActions } from 'vuex'
import { normalize, parser } from '@/utils/emoji'
const { ipcRenderer } = require('electron')
export default {
  components: {
    searchBar,
    msgPrompt,
    rightMenu,
    chat
  },
  data () {
    return {
      type: 'new',
      nowUserId: this.$route.query.uid || this.$route.query.id,
      winbox: this.$route.query.winbox,
      nowUser: '',
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
      userList: [],
      win: '',
      userListIds: [],
      unableInvite: false, // 48小时后无法正常邀请
      showTipSendMSgNull: false, // 发送内容为空提示
      hideWindow: false
    };
  },
  beforeRouteEnter (to, from, next) {
    if (global.moniterTimer) {
      clearInterval(global.moniterTimer)
      global.moniterTimer = null
      next()
    } else {
      next()
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
    ipcRenderer.send('closeTrayFlash')
    this.init();
    // 监听重新获取聊天用户数据
    this.$ipcOn('refreshUserInfo', async event => {
      let res = await this.$http.post('/user.info', {
        id: this.$route.query.id
      });
      this.userInfo = res.data;
    });
    this.ipc.on('showWindow', () => {
      self.hideWindow = false
    })
    this.ipc.on('hideWindow', () => {
      self.hideWindow = true
    })
    console.log('nowUserId' + this.nowUserId)
    if (this.nowUserId) {
      this.getUserInfo()
    }
  },
  methods: {
    setInfo (item) {
      this.userInfo = {}
      this.nowUser = {}
      setTimeout(() => {
        this.userInfo = item
        this.nowUser = item
      }, 0)
    },
    delChatUser (item) {
      let index = this.userListIds.indexOf(item.id)
      let length = this.userListIds.length
      if (length === 1) {
        this.hideWindows()
        return
      }
      this.userListIds.splice(index, 1)
      this.userList.splice(index, 1)
      if (index + 1 >= length) {
        index = length - 2
      }
      this.setInfo(this.userList[index])
    },
    // 第一次打开初始化
    async init () {
      let id = this.$route.query.uid || this.$route.query.id;
      this.userListIds.push(parseInt(id));
      let res = await this.getUser(id);
      this.userInfo = res.data;
      this.nowUser = res.data;
      this.userList.push(res.data);
    },
    getUser (id) {
      return this.$http.post('/user.info', { id: id });
    },
    updata () {
      console.log(this.data['等待接待']);
      this.data[0].children.push({
        nick_name: '周杰伦',
        avatar: require('@assets/images/default-avatar.png'),
        msg: '你这个怎么卖这么贵咯~~'
      });
    },
    handleNodeClick (data) {
      console.log(data);
    },
    selectSessionType (i) {
      this.activeSessionType = i;
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
    minWindows: function () {
      this.ipc.send('minWindow', {
        winbox: this.winbox
      });
    },
    maxWindows: function () {
      this.ipc.send('maxWindow', {
        winbox: this.winbox
      });
    },
    hideWindows: function () {
      this.$ipcSend('hasCreatedNewSessionWin', false);
      this.ipc.send('hideWindow', {
        winbox: this.winbox
      });
    },
    /**
     * 获取当前接待的客户资料
     */
    async getUserInfo (id) {
      let res = await this.$http.post('/user.info', {
        id: id || this.nowUserId
      })
      let lastOperationTime = new Date(res.data.last_operation_time).getTime()
      let nowTime = new Date().getTime()
      let leftTime = nowTime - lastOperationTime
      this.setInfo(res.data)
      let userListArr = this.userList
      userListArr.forEach((val, index, arr) => {
        if (val.id === res.data.id) {
          userListArr[index] = res.data
        }
      })
      this.userList = userListArr
      this.$set(this, 'userList', userListArr)
      if (parseInt(leftTime / 1000 / 3600) >= 48) { // 超过48小时后，无法正常邀请
        this.unableInvite = true
      } else {
        this.unableInvite = false
      }
    },
    /**
     * 选择聊天对象
     */
    selectChatUser (item) {
      this.nowUserId = item.id
      this.$nextTick(() => {
        this.getUserInfo(item.id)
        this.$refs.wxChat.getMessage()
      })
    },
    setMessageList (i) {
      this.messageList = i;
    },
    /**
     * 接待客户
     */
    receive (id) {
      this.$http
        .post('/user.reception', {
          id: id
        })
        .then(res => {
          this.defaultExpandedKeys = ['正在接待'];
          this.getUserInfo(id);
        });
    },
    /**
     * 预约邀请列表
     */
    getResIndex () {
      this.$http.post('/res.index').then(res => {
        this.inviteList = res.data.data;
      });
    },
    destroyed () {
      this.$ipcSend('createdSessionWin', false);
    },
    setNowUserId (i) {
      this.nowUserId = i
      this.setNowUser(i)
    },
    setUserInfoCompulsoryInvitation (i) {
      this.$set(this.userInfo, 'compulsory_invitation', i)
    },
    setDefaultExpandedKeys (arr) {
      // this.defaultExpandedKeys = arr
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
    getData (isRefresh = false) {

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
    setShList (data) {
      this.shList = data
    },
    setShHistoryList (data) {
      this.shHistoryList = data
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo', 'newUser'])
  },
  watch: {
    async newUser () {
      if (!this.userListIds.includes(this.newUser)) {
        this.userListIds.push(this.newUser);
        let res = await this.getUser(this.newUser);
        this.userList.push(res.data);
        this.userInfo = res.data;
        this.nowUser = res.data;
        this.nowUserId = res.data.id;
        this.$nextTick(() => {
          this.$refs.wxChat.getMessage()
        })
      } else {
        for (let item of this.userList) {
          if (item.id === this.newUser) {
            this.userInfo = item;
            this.nowUser = item;
            this.nowUserId = item.id;
            this.$nextTick(() => {
              this.$refs.wxChat.getMessage()
            })
            return;
          }
        }
      }
    }
  }
};
</script>

<style lang="less">
.page-session-new {
  height: 100%;
  background-color: #fff;
  .layout-row {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #fff;
    .layout-col {
      display: table-cell;
      vertical-align: top;
      height: 100%;
    }
    .layout-col-c {
      width: 100%;
      flex-shrink: 1;
      overflow: hidden;
      padding-top: 40px;
    }
    .layout-col-l {
      width: 170px;
      background-color: @color-primary;
      color: #fff;
    }
    .layout-col-l,
    .layout-col-r {
      flex-shrink: 0;
      overflow: hidden;
    }
    .layout-col-r {
      width: 270px;
      height: 100%;
      overflow: hidden;
      overflow-y: auto;
      padding-top: 40px;
      &.layout-col-r-tip {
        position: relative;
        width: 100%;
        flex-shrink: 1;
        overflow: hidden;
      }
    }
    & .layout-col-l,
    & .layout-col-c {
      border-right: 1px solid @border-color;
    }
  }
  .chat-top {
    position: absolute;
    top: 0;
    left: 170px;
    z-index: 999;
    width: calc(100% - 170px);
    padding: 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f7f7f7;
    .chat-top-l,
    .chat-top-r {
      position: relative;
      z-index: 10;
    }
    .chat-top-r {
      .iconfont {
        color: #7c7c7c;
        margin: 0 7px;
        cursor: pointer;
      }
    }
    .drag-bg {
      position: absolute;
      height: 100%;
      width: 100%;
      left: 0;
      -webkit-app-region: drag;
      z-index: 1;
    }
  }
  .menu-title {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: #f7f7f7;
    .iconfont {
      margin: 0 15px;
      color: #7c7c7c;
      line-height: 1;
      display: block;
    }
  }
  .list-user {
    height: 100%;
    overflow: auto;
    .item-user {
      display: flex;
      padding: 15px;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      .avatar {
        flex: 0 0 30px;
        width: 30px;
        height: 30px;
        margin-right: 10px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      &.active {
        background-color: #99ddff;
        color: @color-text-primary;
      }
      .name {
        flex: 1 1 auto;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .close {
        display: none;
        color: @color-text-primary;
        .iconfont{
          font-size: @font-size-small;
        }
        &:hover {
          color: @color-red;
        }
      }
      &:hover {
        .close {
          display: block;
        }
      }
    }
  }
  .chat-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .chat-tip-logo {
      margin-bottom: 30px;
      width: 60px;
    }

    .chat-tip-info {
      position: relative;

      .tip-title {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: @color-primary;
        color: #fff;
        height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        display: flex;
        width: max-content;
        border-radius: 40px;
      }

      .tip-info {
        border-radius: 10px;
        background-color: #f7f7f7;
        width: 300px;
        padding: 30px 20px;
        min-height: 100px;
        padding-top: 50px;
        color: @color-text-secondary;
      }
    }
  }
}
</style>