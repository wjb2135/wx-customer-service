<template>
  <div class="suggestion-dialog">
    <!-- 头部 -->
    <div class="header drag">
      <span>意见反馈</span>
      <i class="iconfont no-drag" @click="closeWindow">&#xe69a;</i>
    </div>
    <div class="wrap">
      <div class="title">您可以写下任何使用中的问题，错误或者意见:</div>
      <el-input
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
        size="mini"
        maxlength="89"
        v-model="content">
      </el-input>
      <div class="tx-rg">
        <el-button type="primary" size="mini" @click="submit">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      content: ''
    }
  },
  mounted () {
  },
  computed: {
  },
  methods: {
    /**
     * 关闭窗口
     */
    closeWindow () {
      this.$Win.closeWin()
    },
    /**
     * 提交反馈
     */
    submit () {
      if (!this.content) {
        this.$message.error('请输入反馈内容')
        return
      }
      this.$http.post('/feedback.send', {
        content: this.content
      }).then((res) => {
        this.$message({
          message: '已提交',
          type: 'success'
        })
        setTimeout(() => {
          this.closeWindow()
        }, 1000)
      }).catch(err => {
        this.$message.error(err.message)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .suggestion-dialog {
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
      padding: 20px 10px 10px;
      .title {
        margin-bottom: 5px;
      }
      .tx-rg {
        margin-top: 10px;
        text-align: right;
      }
    }
  }
</style>