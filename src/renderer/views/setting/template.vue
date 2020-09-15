<template>
  <div class="conversation-template">
    <mainHead slot="header" title="设置页面"></mainHead>
    <div class="template-head">
      <ul>
        <li :class="{active: activeClass == 0}" @click="navChange(0)">新建模板</li>
        <li :class="{active: activeClass == 1}" @click="navChange(1)">选择模板</li>
      </ul>
      <el-select class="select" v-model="appid" placeholder="请选择" size="mini" @change="handleChange">
        <el-option
          v-for="item in baseUserInfo.weixin_account"
          :key="item.appid"
          :label="item.nick_name"
          :value="item.appid">
        </el-option>
      </el-select>
    </div>
    <template-create v-if="!index" @wxtemplate="wxtemplate"></template-create>
    <template-choose 
      v-else 
      @navChange="navChange" 
      :templateList="templateList" 
      @wxtemplate="wxtemplate"></template-choose>
  </div>
</template>

<script>
import mainHead from '@/components/windows/mainHead.vue'
import templateCreate from '@/components/setting/conversation/templateCreate'
import templateChoose from '@/components/setting/conversation/templateChoose'
const { ipcRenderer } = require('electron')

export default {
  components: {
    templateCreate,
    templateChoose,
    mainHead
  },
  data () {
    return {
      index: 1,
      activeClass: 1,
      appid: '',
      templateList: {},
      win: ''
    }
  },
  watch: {
    '$route' (to, from) { // 监听 传参
      this.index = this.$route.query.index
      if (this.index === undefined) {
        this.index = 0
      }
    }
  },
  created () {
    this.$ipcOn('editTemplate', (event, val) => {
      console.log('editTemplate', val)
      this.wxtemplate(val.content)
    });
    this.appid = this.baseUserInfo.weixin_account[0].appid
    this.getTemplate(this.appid)
    this.win = this.$route.query.win || ''
  },
  computed: {
    baseUserInfo () {
      return this.$store.state.user.baseUserInfo
    }
  },
  methods: {
    /**
     * 搜索
     */
    handleChange (i) {
      this.getTemplate(i)
    },
    /**
     * 获取模板列表
     */
    getTemplate (appid) {
      this.$http.post('/res.template_pre', {
        appid: appid
      }).then(res => {
        this.templateList = res.data
      })
    },
    /**
     * 切换nav
     */
    navChange (i) {
      this.index = i
      this.activeClass = i
    },
    wxtemplate (val) {
      let list = {
        winbox: this.win,
        type: 'wxTemplate',
        content: val
      }
      if (this.win) {
        this.$ipcSend('settingTemplate', list)
      } else {
        ipcRenderer.send('settingTemplate', list)
      }
      console.log('template 传值', list)
      this.$Win.closeWin()
    }
  }
}
</script>

<style lang="less" scoped>
  .conversation-template {
    width: 100%;
    .template-head {
      .select {
        position: absolute;
        right: 16px;
      }
    }
  }
</style>

<style lang="less">
  .conversation-template {
    .template-head {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid @border-color;
      ul {
        margin-right: 20px;
        border-radius: 4px;
        border: 1px solid @color-primary;
        color: @color-primary;
        display: flex;
        li {
          cursor: pointer;
          padding: 6px 20px;
          flex: 1;
          &.active {
            color: @color-white;
            background: @color-primary;
          }
        }
      }
    }
    .search {
      display: block;
      margin: 12px auto;
      padding: 0 10px;
      input {
        border-radius: 20px;
        background: #f7f9f9;
        border: none;
      }
    }
    .left-list {
      width: 250px;
      border-right: 1px solid @border-color;
      height: 483px;
      p {
        font-size: @font-size-bigger;
        height: 35px;
        line-height: 35px;
        padding: 0 16px;
        cursor: pointer;
        &:hover {
          background: #f7f9f9;
        }
        &.active {
          background: @color-table-hover
        }
      }
    }
  }
</style>