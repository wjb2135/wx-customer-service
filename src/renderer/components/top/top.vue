<template>
  <div class="menu-top drag">
    <div class="menu-top-left no-drag">
      <img :src="avatar" class="u-avatar" alt="">
      <span class="u-name" @click="openUserInfo">{{baseUserInfo.nickname}}</span>
      <el-dropdown class="u-status" trigger="click" @command="handleCommand">
        <span class="el-dropdown-link">
          <div v-show="userOnlineStatus === 1"><img src="@/assets/images/top/online.png">在线<i class="el-icon-arrow-down el-icon--right"></i></div>
          <div v-show="userOnlineStatus === 2"><img src="@/assets/images/top/leave.png">离开<i class="el-icon-arrow-down el-icon--right"></i></div>
          <div v-show="userOnlineStatus === 3"><img src="@/assets/images/top/busy.png">忙碌<i class="el-icon-arrow-down el-icon--right"></i></div>
        </span>
        <el-dropdown-menu class="u-status-dropdown" slot="dropdown" @command="onCommand">
          <el-dropdown-item command=1><img src="@/assets/images/top/online.png">在线</el-dropdown-item>
          <el-dropdown-item command=2><img src="@/assets/images/top/leave.png">离开</el-dropdown-item>
          <el-dropdown-item command=3><img src="@/assets/images/top/busy.png">忙碌</el-dropdown-item>
          <el-dropdown-item divided command=4><img src="@/assets/images/top/switch_user.png">切换用户</el-dropdown-item>
          <el-dropdown-item command=4><img src="@/assets/images/top/logout.png">注销</el-dropdown-item>
          <el-dropdown-item command=5><img src="@/assets/images/top/quit.png" command="logout">退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="network-offline-tip" v-if="networkOnlineStatus == 'offline'">
      <i class="el-icon-info"></i>
      <span>网络不好，请检查您的网络设置</span>  
    </div>
    <div class="menu-top-right no-drag">
      <span class="version">{{sysConfig.name}}（{{baseUserInfo.group_name}}）{{version}}</span>
      <div class="btn-group">
        <el-dropdown class="right-menu" trigger="click" @command="handleCommandDown">
          <span class="el-dropdown-link">
            <i class="icon iconfont">&#xe69e;</i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="suggestion">意见反馈</el-dropdown-item>
            <el-dropdown-item command="help_url">产品帮助</el-dropdown-item>
            <el-dropdown-item command="about">关于我们</el-dropdown-item>
            <el-dropdown-item command="guide_url">新手引导</el-dropdown-item>
            <el-dropdown-item command="updateApp">检查更新</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- <i class="icon iconfont">&#xe68e;</i> -->
        <i class="icon iconfont" @click="minWindows" title="最小化">&#xe68d;</i>
        <i class="icon iconfont" @click="maxWindows" title="最大化/还原">&#xe68c;</i>
        <i class="icon iconfont" @click="hideWindows" title="关闭">&#xe690;</i>
      </div>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import Cookie from '@/utils/cookie'
import { setTimeout } from 'timers';
const packageV = require('../../../../package.json')
export default {
  props: ['networkOnlineStatus'],
  data () {
    return {
      winbox: false,
      version: '',
      formOnlineStatus: {
        online_status: '',
        online_status_title: '',
        online_status_memo: ''
      },
      hasCreatedWin: false,
      userOnlineStatus: ''
    }
  },
  created () {
    this.version = packageV.version
    this.$ipcOn('closeChildrenWin', (event, val) => {
      this.hasCreatedWin = false
    })
    this.$ipcOn('refreshCsInfo', (event, val) => {
      this.getCsInfo()
    })
    // 监听在线状态
    this.$ipcOn('changeOnlineStatus', (event, val) => {
      if (this.userOnlineStatus !== val.data.online_status) {
        this.userOnlineStatus = val.data.online_status
      }
    })
    // this.getCsInfo()
  },
  mounted (e) {
    if (this.$route.query.winbox) {
      this.winbox = this.$route.query.winbox
    }
  },
  methods: {
    ...mapActions(['setToken', 'onlineStatus', 'setBaseUserInfo']),
    async getCsInfo () {
      let res = await this.$http.post(`/cs.info`)
      this.setBaseUserInfo(res.data)
    },
    minWindows: function () {
      this.ipc.send('minWindow', {
        winbox: this.winbox
      })
    },
    maxWindows: function () {
      this.ipc.send('maxWindow', {
        winbox: this.winbox
      })
    },
    hideWindows: function () {
      this.ipc.send('hideWindow', {
        winbox: this.winbox
      })
    },
    /**
     * 当前用户信息
     */
    openUserInfo () {
      if (this.hasCreatedWin) return
      this.hasCreatedWin = true
      this.newWindows('/session/userInfo', {width: 300, height: 480});
    },
    /**
     * 状态下拉
     */
    handleCommand (command) {
      if (this.baseUserInfo.online_status === Number(command)) return
      if (Number(command) === 1) {
        this.setOnlineStatus()
      } else {
        this.newWindows('/dialog/reason?logout=1&type=' + command, {width: 360, height: 280})
      }
    },
    /**
     * 右侧下拉
     */
    handleCommandDown (command) {
      console.log(command)
      if (command === 'about') {
        this.newWindows('/about', {width: 480, height: 580})
      } else if (command === 'help_url') {
        shell.openExternal(this.sysConfig.help_url)
      } else if (command === 'guide_url') {
        shell.openExternal(this.sysConfig.guide_url)
      } else if (command === 'updateApp') {
        this.ipc.send('checkForUpdate')
      } else {
        this.newWindows('/dialog/suggestion', {width: 360, height: 225})
      }
    },
    onCommand (e) {
      console.log(e);
    },
    /**
     * 登录状态改变
     */
    setOnlineStatus () {
      this.$http.post('/cs.onlinestatus', {
        online_status: 1
      }).then(res => {
        this.onlineStatus(1)
        this.$ipcSend('refreshCsInfo')
      })
    }
  },
  computed: {
    ...mapGetters([
      'sysConfig',
      'baseUserInfo'
    ]),
    status () {
      return this.baseUserInfo.online_status
    },
    avatar () {
      return this.baseUserInfo.avatar || require('@assets/images/avatar/avatar-default.png')
    }
  }
}
</script>

<style lang="less">
.u-status-dropdown {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    img {
      margin-right: 10px;
    }
  }
  .el-dropdown-menu__item--divided:before {
    display: none;
  }
}
.menu-top {
  width: 100%;
  height: 40px;
  background-color: @color-primary;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #d0dcf4;
  .drag-bg {
    position: absolute;
    height: 100%;
    width: 100%;
    left: 0;
    -webkit-app-region: drag;
    z-index: 1;
  }
  .network-offline-tip {
    background-color: #fa5b75;
    height: 39px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    margin-top: 1px;
    padding: 0 15px;
    span {
      margin-left: 5px;
    }
  }
  .menu-top-left {
    margin-left: 15px;
    color: #fff;
    font-weight: 100;
    font-size: 14px;
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
    .u-avatar {
      width: 32px;
      height: 32px;
      border-radius: 32px;
      margin-right: 8px;
    }
    .u-name {
      margin-right: 20px;
      cursor: pointer;
    }
    .u-status {
      color: #fff;
      cursor: pointer;
      padding: 3px 5px;
      .el-dropdown-link {
        display: flex;
        align-items: center;
        img {
          margin-right: 5px;
        }
      }
    }
    .el-dropdown {
      color: #fff;
      background-color: #4293f5;
      border-radius: 3px;
      line-height: 1;
      vertical-align: top;
    }
  }

  .menu-top-right {
    display: flex;
    align-items: center;
    height: 100%;
    color: #d0dcf4;
    -webkit-app-region: no-drag;
    .right-menu {
      color: #d0dcf4;
    }
    .version {
      padding: 0 20px;
    }
    .btn-group {
      border-left: 1px solid #4a9af9;
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 5px;
      .iconfont {
        font-size: 16px;
        margin: 0 15px;
        line-height: 1;
        display: block;
        cursor: pointer;
      }
    }
  }

  .menu-top-right .item {
    -webkit-app-region: no-drag;
    display: inline-block;
    font-size: 24px;
    color: #333;
    margin-right: 10px;
    cursor: pointer;
    position: relative;
    z-index: 10;
  }

  .menu-top-right .item.minsize {
    font-size: 20px;
  }

  .menu-top-right .item.maxsize {
    position: relative;
    top: -3px;
  }

  .menu-top-right .item:hover {
    color: #0074d9;
  }
}
</style>