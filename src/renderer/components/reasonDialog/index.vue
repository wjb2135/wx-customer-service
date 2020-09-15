<template>
  <div class="reason-dialog">
    <!-- 头部 -->
    <div class="header drag">
      <span>{{title}}</span>
      <i class="iconfont no-drag" @click="closeWindow">&#xe69a;</i>
    </div>
    <div class="wrap">
      <!-- 状态提示文字 -->
      <div class="flex-box">
        <i class="el-icon-warning"></i>
        <div v-if="type === 2" class="flex-box"><span> 离开: </span> 离开状态下将不会分配任何访客。</div>
        <div v-else-if="type === 3" class="flex-box"><span>忙碌: </span> 忙碌状态下将只接受属于我的访客和主动邀请的访客，不会分配新的访客。</div>
        <div v-else class="flex-box"><span> 理由: </span> 请选择以下理由。</div>
      </div>
      <!-- select 选择框 -->
      <el-select
        class="select"
        v-model="value" 
        filterable 
        placeholder="请选择"
        @change="handlechange"
        size="mini">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
      <!-- textarea 输入框 -->
      <el-input
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
        size="mini"
        maxlength="100"
        show-word-limit
        v-model="msg">
      </el-input>
      <!-- 底部footer -->
      <div class="footer flex-box">
        <span>*请输入100个字符以内</span>
        <div>
          <el-button class="el-button" type="primary" size="mini" @click="btnClick" :disabled="disabled" :loadingSubmit="loadingSubmit">确定</el-button>
          <el-button class="el-button" type="primary" size="mini" @click="closeWindow">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookie from '@/utils/cookie'
import { mapActions } from 'vuex'
const ipc = require('electron').ipcRenderer
export default {
  data () {
    return {
      typeText: '离开',
      msg: '',
      options: [],
      value: '',
      type: Number(this.$route.query.type),
      closeType: Number(this.$route.query.close_type),
      needLogout: this.$route.query.logout,
      id: Number(this.$route.query.id),
      postTpye: 0,
      disabled: true,
      loadingSubmit: false
    }
  },
  mounted () {
    this.getList()
  },
  computed: {
    title () {
      if (this.needLogout) {
        this.postTpye = 2
        return '理由'
      } else {
        this.postTpye = 1
      }
      switch (this.closeType) {
        case 1:
          return '关闭会话 - 理由'
        case 2:
          return '退回会话 - 理由'
        default:
          this.postTpye = 2
      }
    }
  },
  methods: {
    ...mapActions(['setToken', 'onlineStatus', 'setCooperationCustomService']),
    /**
     * 关闭窗口
     */
    closeWindow () {
      this.$Win.closeWin()
    },
    /**
     * 获取列表数据
     */
    getList () {
      this.$http.post('/reason_setting_list', {
        type: this.postTpye,
        close_type: this.$route.query.close_type
      }).then(res => {
        console.log(res.data)
        if (res.data && res.data.length > 0) {
          this.options = res.data.map((item, index) => {
            return {value: index, label: item.title, memo: item.memo}
          })
          this.value = res.data[0].title
          this.msg = res.data[0].memo
        }
        this.disabled = false
      })
    },
    /**
     * 切换select
     */
    handlechange (index) {
      this.msg = this.options[index].memo
    },
    /**
     * 点击 确定按钮
     */
    btnClick () {
      if (this.needLogout) {
        switch (this.type) {
          case 4:
            // 注销
            this.logout()
            break;
          case 5:
            // 退出
            this.logout()
            break;

          default:
            this.setOnlineStatus()
            break;
        }
        return
      }
      switch (this.closeType) {
        case 1:
          this.userClose()
          break
        case 2:
          this.userReback()
          break
      }
    },
    /**
     * 登录状态改变
     */
    setOnlineStatus () {
      if (!this.msg) {
        this.$message.error('请输入内容')
        return
      }
      this.$http.post('/cs.onlinestatus', {
        online_status: this.type,
        msg: this.msg
      }).then(res => {
        this.onlineStatus(this.type)
        this.$store.dispatch('logoutStatus', this.type)
        this.$ipcSend('refreshCsInfo')
        this.closeWindow()
      })
    },
    /**
     * 退出登录
     */
    logout () {
      this.$ipcSend('clearIntervalMoniter')
      this.$http.post('/logout', {
        msg: this.msg
      }).then((res) => {
        this.$ipcSend('clearCache')
        if (this.type === 5) {
          Cookie.setCookie('_token', '')
          this.ipc.send('appQuit')
        } else {
          this.$ipcSend('loginOut')
        }
        this.closeWindow()
      }).catch(() => {
        global.globalMoniterTimer.initMoniterTimeOut()
      })
    },
    /**
     * 关闭对话
     */
    userClose () {
      if (!this.msg) {
        this.$message.error('请输入内容')
        return
      }
      this.loadingSubmit = true
      this.$http.post('/user.close', {
        id: this.id,
        msg: this.msg
      }).then((res) => {
        this.$http.post('/user.cooperation', {
          id: this.id,
          ids: ''
        }).then((res) => {
          this.loadingSubmit = false
          this.setCooperationCustomService('')
          this.$ipcSend('refreshLeftData', {
            winbox: this.$route.query.win
          })
          this.$ipcSend('closeUserChat', {
            winbox: this.$route.query.win
          })
          this.$Win.closeWin()
        })
          .catch(() => {
            this.loadingSubmit = false
          })
      })
        .catch(() => {
          this.loadingSubmit = false
        })
    },
    /**
     * 退回会话
     */
    userReback () {
      if (!this.msg) {
        this.$message.error('请输入内容')
        return
      }
      this.loadingSubmit = true
      this.$http.post('/user.reback', {
        id: this.id,
        msg: this.msg
      }).then((res) => {
        // 解散协作
        this.$http.post('/user.cooperation', {
          id: this.id,
          ids: ''
        }).then((res) => {
          this.loadingSubmit = false
          this.setCooperationCustomService('')
          this.$ipcSend('refreshLeftData', {
            winbox: this.$route.query.win
          })
          this.$ipcSend('refreshUserInfo', {
            winbox: this.$route.query.win
          })
          this.$Win.closeWin()
        })
          .catch(() => {
            this.loadingSubmit = false
          })
      })
        .catch(() => {
          this.loadingSubmit = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
  .reason-dialog {
    .header {
      height: 30px;
      line-height: 30px;
      background: #2483f3;
      color: #fff;
      padding: 0 10px;
      .iconfont {
        position: absolute;
        right: 10px;
        cursor: pointer;
        font-size: @font-size-base;
      }
    }
    .wrap {
      padding: 10px;
      .flex-box {
        display: flex;
        flex-direction: row;
        align-items: baseline;
        font-size: @font-size-small;
        height: 34px;
        span {
          margin: 0 5px;
          width: 40px;
          color: @color-primary;
        }
        i {
          color: @color-primary;
        }
      }
      .select {
        width: 100%;
        margin: 15px 0 10px;
      }
      .footer {
        margin-top: 10px;
        color: @color-primary;
        span {
          flex: 1;
        }
      }
    }
  }
</style>