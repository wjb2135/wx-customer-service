<template>
  <div class="reason-dialog">
    <!-- 头部 -->
    <div class="header drag">
      <span>提示</span>
      <i class="iconfont no-drag" @click="closeWindow">&#xe69a;</i>
    </div>
    <P>{{reason}}</P>
    <div class="footer">
        <el-button class="el-button" type="primary" size="mini" @click="closeWindow">确定</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    return {
    }
  },
  methods: {
    /**
     * 关闭窗口
     */
    closeWindow () {
      this.$Win.closeWin()
      if (global.globalMoniterTimer) {
        clearInterval(global.globalMoniterTimer)
        global.globalMoniterTimer = null
      }
      if (global.sessionMoniterTimer) {
        clearInterval(global.sessionMoniterTimer)
        global.sessionMoniterTimer = null
      }
      this.$ipcSend('loginOut')
    }
  },
  computed: {
    reason () {
      let reasonText
      switch (this.$route.query.reason) {
        case '1':
          reasonText = '您的账号在其他地方登录'
          break;
        case '2':
          reasonText = '您的账号已被强制下线'
          break;

        default:
          break;
      }
      return reasonText
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
    P {
      padding: 20px 10px;
    }
    .footer {
      position: absolute;
      width: 100%;
      bottom: 0;
      padding: 10px;
      text-align: right;
    }
  }
</style>