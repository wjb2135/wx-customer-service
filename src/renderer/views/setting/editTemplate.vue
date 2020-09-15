<template>
  <div class="container">
    <!-- <div class="header drag">
      <span>编辑模板素材（临时）</span>
      <i class="iconfont no-drag" @click="closeWindow">&#xe69a;</i>
    </div> -->
    <mainHead slot="header" title="编辑模板素材（临时）"></mainHead>
    <div>
      <div class="form">
        <div>
          <div class="title">模板ID:</div>
          <div>{{list.weixin_template.wx_template_id}}</div>
        </div>
        <div>
          <div class="title">标题:</div>
          <div>{{list.name}}</div>
        </div>
        <div>
          <div class="title">行业:</div>
          <div v-if="list">{{ list.weixin_template.primary_industry }} -> {{ list.weixin_template.deputy_industry }}</div>
        </div>
        <div>
          <div class="title">链接地址:</div>
          <div class="input-wrap"><input type="text" placeholder="请输入链接地址" v-model="list.detail_url"></div>
        </div>
      </div>
      <div class="form">
        <div v-for="(key, value) in list.weixin_template.content" :key="value">
          <div class="title" v-if="key">{{key}}:</div>
          <div class="title" v-else>{{key}}</div>
          <div class="input-wrap"><input type="text" :placeholder="'请输入' + key.value" v-model="list.content[value].value"></div>
          <div class="color-picker">
            <el-color-picker v-model="list.content[value].color"></el-color-picker>
          </div>
        </div>
      </div>
    </div>
    <div class="bottm-btn">
      <el-button type="primary" size="mini" @click="submit">确定</el-button>
      <el-button type="primary" size="mini" @click="cancel">取消</el-button>
    </div>
  </div>
</template>

<script>
import mainHead from '@/components/windows/mainHead.vue'
const { ipcRenderer } = require('electron');

export default {
  components: {
    mainHead
  },
  data () {
    return {
      list: {},
      form: {
        first: {
          value: '',
          color: '#24272b'
        }
      },
      html: '',
      colorKey: '',
      win: ''
    }
  },
  created () {
    this.appid = this.baseUserInfo.weixin_account[0].appid
    this.list = require('electron').remote.getGlobal('sharedObject').someProperty
    let arr = this.list.content
    let i = 0
    for (i in arr) {
      arr[i].color = '#24272b'
    }
    this.win = this.$route.query.win || ''
    console.log('this.win', this.win)
  },
  mounted () {
  },
  computed: {
    baseUserInfo () {
      return this.$store.state.user.baseUserInfo
    }
  },
  watch: {
    list: {
      handler () {
        console.log('watch list', this.list)
        this.getList()
      }
    }
  },
  methods: {
    getList () {
      this.form = this.list.content
      let i = 0
      for (i in this.form) {
        this.form[i].color = '#24272b'
      }
    },
    /**
     * 获取当前选中颜色的key
     */
    getColorKey (i) {
      console.log('当前获取到的key', i)
      this.colorKey = i
    },
    /**
     * 颜色修改
     */
    colorChange (i) {
      for (i in this.form) {
        console.log(this.form[i].color)
      //   this.form[i].color = '#409EFF'
      }
      // this.form[this.colorKey].color = i
    },
    /**
     * 取消
     */
    cancel () {
      this.$Win.closeWin()
    },
    /**
     * 确定
     */
    submit () {
      let list = {
        winbox: this.win,
        type: 'wxTemplate',
        content: this.list
      }
      console.log('template edit 传值', this.list)
      if (this.win) {
        this.$ipcSend('editTemplate', list)
      } else {
        ipcRenderer.send('editTemplate', list)
      }
      this.$Win.closeWin()
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    .header {
      height: 40px;
      line-height: 40px;
      background: #2483f3;
      color: #fff;
      padding: 0 20px;
      .iconfont {
        position: absolute;
        right: 20px;
        cursor: pointer;
      }
    }
    .form {
      padding: 20px 28px 10px;
      max-height: 325px;
      overflow-y: scroll;
      &:first-of-type {
        border-bottom: 1px solid @border-color;
        > div {
          margin-bottom: 10px;
        }
      }
      > div {
        display: flex;
        align-items: center;
        .title {
          width: 90px;
        }
        .input-wrap {
          flex: 1;
          input {
            border-radius: 4px;
            border: none;
            background: #f7f9f9;
            display: block;
            width: 100%;
            padding: 10px;
          }
        }
        .color-picker {
          margin-left: 10px;
        }
      }
      &:first-of-type {
        border-bottom: 1px solid @border-color;
        > div {
          margin-bottom: 10px;
        }
      }
    }
    .bottm-btn {
      position: absolute;
      right: 0;
      bottom: 12px;
      width: 100%;
      text-align: right;
      padding-right: 16px;
      padding-top: 12px;
      border-top: 1px solid @border-color;
    }
  }
</style>