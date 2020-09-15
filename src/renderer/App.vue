<template>
<div>
  <!-- 截图工具 -->
  <div v-if="$route.meta.pageType === 'shortcut'">
    <router-view></router-view>
  </div>
  <div id="app" :class="{'disabled': networkOnlineStatus == 'offline'}" v-loading="pageLoading" v-else>
    <div class="row" v-if="!pageLoading">
      <!-- 左侧菜单 -->
      <div class="row-left" v-if="$route.meta.rowLeftShow || (baseUserInfo.online_status && baseUserInfo.online_status !== 4)">
        <tp-left :active="$route.meta.pageType"></tp-left>
      </div>
      <!-- 右侧主体内容 -->
      <div class="row-right" :class="{ 'no-row-left': !$route.meta.rowLeftShow }" v-if="$route.meta.rowRightShow">
        <tp-top :active="$route.meta.pageType" :networkOnlineStatus="networkOnlineStatus"></tp-top>
        <div class="framebox" id="FrameBox">
          <router-view @windowChange="windowChange"></router-view>
        </div>
      </div>
      <div class="window-bg" id="FrameBox" v-else>
        <router-view @windowChange="windowChange"></router-view>
      </div>
    </div>
  </div>
  <audio id='audioPlay' src="static/audio/msg.mp3" hidden='true'></audio>
  <update-version :remark="remark" :version="version" :updateDialogVisible="updateDialogVisible" v-on:closeUpdateDialogVisible="closeUpdateDialogVisible"></update-version>
</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TpLeft from './components/left/left.vue'
import TpTop from './components/top/top.vue'
import UpdateVersion from '@/components/update'
import router from './router'
// import { app, ipcMain, session, globalShortcut } from 'electron'
const { ipcRenderer } = require('electron');
// const Cookie = require('./utils/cookie')
export default {
  components: {
    'tp-left': TpLeft,
    'tp-top': TpTop,
    UpdateVersion
  },
  data () {
    return {
      leavigInterval: null,
      'clickStatus': null,
      // pageLoading: true,
      'homeLoading': true,
      'window': {},
      'networkOnlineStatus': 'online',
      version: '',
      remark: '',
      updateDialogVisible: false
    }
  },
  watch: {
    '$route' (to, from) { // 监听 传参
      // console.log('APP ##################', to.path, from.path)
    }
  },
  created () {
    let self = this
    self.drag()
  },
  mounted () {
    require('@/permission') // 路由权限控制
    let self = this
    let loading = null
    window.addEventListener('online', function () {
      self.networkOnlineStatus = navigator.onLine ? 'online' : 'offline'
    })
    window.addEventListener('offline', function () {
      self.networkOnlineStatus = navigator.onLine ? 'online' : 'offline'
    })

    this.ipc.on('downloadProgress', (event, data) => {
      this.percent = (data.percent).toFixed(2);
      if (data.percent >= 100) {
        // this.show = false;
      }
    });
    this.ipc.on('message', (event, data) => {
      console.log(data)
      switch (data) {
        case '正在检查更新……':
          loading = this.$loading({
            lock: true,
            text: '正在检查更新……',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          break;
        case '检测到新版本，正在下载……':
          loading && loading.close()
          this.updateDialogVisible = true
          break;
        case '现在使用的就是最新版本，不用更新':
          loading && loading.close()
          this.$message({
            message: '已是最新版本',
            type: 'error'
          })
          this.updateDialogVisible = false
          break;
        case '检查更新出错':
          loading && loading.close()
          this.$message({
            message: '检查更新出错',
            type: 'error'
          })
          this.updateDialogVisible = false
          break
      }
    })
    // 监听用户距离上一次点击多长时间，进行自动切换离开状态
    document.getElementsByTagName('body')[0].addEventListener('click', () => {
      self.autoLeaving()
    })
  },
  methods: {
    ...mapActions(['loadingStatus', 'setMoniterMessage', 'onlineStatus', 'clearAllChatState', 'clearAllVisitorState', 'setBaseUserInfo']),
    drag () {
      document.addEventListener('drag', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('dragstart', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('dragend', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('dragover', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('dragenter', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('dragleave', () => {
        event.preventDefault()
      }, false)
      document.addEventListener('drop', () => {
        event.preventDefault()
      }, false)
    },
    windowChange (i) {
      this.window = i
      this.$router.push(i.path)
      this.ipc.send(this.window.ipc)
    },
    /**
     * 自动登出
     */
    autoLeaving () {
      let time = this.baseUserInfo.time_setting * 60000
      // 当前账号状态不是在线，而且切换自动离开时间为0，则不执行接下来的操作
      if (this.baseUserInfo.online_status === 1 && time > 0) {
        clearTimeout(this.leavigInterval)
        this.leavigInterval = null
        this.leavigInterval = setTimeout(() => {
          this.$http.post('/cs.onlinestatus', {
            online_status: 2,
            msg: ''
          }).then(async (res) => {
            let resUserInfo = await this.$http.post(`/cs.info`)
            this.setBaseUserInfo(resUserInfo.data)
            this.onlineStatus(2)
            clearTimeout(this.leavigInterval)
            this.leavigInterval = null
          })
        }, time)
      }
    },
    /**
     * 登录状态改变
     */
    setOnlineStatus () {
      this.$http.post('/cs.onlinestatus', {
        online_status: 1
      }).then(res => {
        this.onlineStatus(1)
      })
    },
    closeUpdateDialogVisible () {
      this.updateDialogVisible = false
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo']),
    pageLoading () {
      return this.$store.state.user.windowChangeLoading
    }
  }
}
</script>

<style lang="less">
@import './assets/css/reset.less';
@import './assets/css/global.less';
@import './assets/css/resetElementUI.less';
  .el-textarea {
    textarea {
      resize: none;
    }
  }
// 滚动条自定义
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
	background-color: transparent;
}
::-webkit-scrollbar-track {
	// -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.15);
	background-color: #f8f9fb; 
}
::-webkit-scrollbar-thumb {
  width: 5px;
  height: 5px;
	border-radius: 5px;
	// -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.05);
	background-color: #e7e9ec;
}

#app {
  position: fixed;
  height: 100%;
  width: 100%;
  textarea {
    resize: none;
  }
  border-radius: 0;
  overflow: hidden;
  &.disabled {
    pointer-events: none;
  }
}

.window-bg {
  background: #fff;  
  height: 100%;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

img {
  border: none;
}

.row {
  height: 100%;

  .row-left {
    width: 60px;
    height: 100%;
    background: #2b323a;
    position: absolute;
  }

  .row-right {
    position: relative;
    margin-left: 60px;
    height: 100%;
    background: #f7f7f7;
    &.no-row-left {
      margin-left: 0;
    }
  }
}

.framebox {
  position: absolute;
  top: 40px;
  width: 100%;
  height: calc(~'100vh - 40px');
  z-index: 1;
  overflow-y: auto;
}

.framebox::-webkit-scrollbar {
  width: 4px;
}

.framebox::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(85, 85, 85, 0.2);
  background: rgba(85, 85, 85, 0.2);
}

.framebox::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(85, 85, 85, 0.2);
  border-radius: 0;
  background: rgba(85, 85, 85, 0.1);
}
</style>
