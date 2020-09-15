<template>
    <Frame>
      <mainHead slot="header" title="系统设置"></mainHead>
      <headNav 
        v-show="!$route.meta.hidden"
        slot="nav" 
        @pageChange="pageChange"
        :list="list"
        ></headNav>
      <leftNav 
        v-show="!$route.meta.hidden"
        slot="left" 
        @activeChange="activeChange" 
        :list="leftList" 
        :win="win"
        :winbox="winbox"
        :activeClass="activeClass"></leftNav>
    </Frame>
</template>
<script>
import Frame from '@/components/windows/mainFrame.vue'
import mainHead from '@/components/windows/mainHead.vue'
import headNav from '@/components/setting/headNav.vue'
import leftNav from '@/components/setting/leftNav.vue'
export default {
  name: 'mainWindow',
  components: {
    Frame,
    mainHead,
    headNav,
    leftNav
  },
  data () {
    return {
      list: {},
      leftList: {},
      activeClass: 0, // 左侧高亮默认为0
      win: 0,
      winbox: 0
    }
  },
  async created () {
    let res = await this.$http.post(`${this._APIROOT}/cs.info`)
    let isManage = res.data.is_manage
    let list = {}
    // 基本权限
    list.personal = {
      index: 0,
      title: '个人设置',
      name: 'personal',
      path: '/setting/personal',
      text: ['通知提醒']
    }
    // 客服管理员权限
    if (isManage) {
      list.conversation = {
        index: 1,
        title: '会话设置',
        name: 'conversation',
        path: '/setting/conversation',
        text: ['时间设置', '访客标签设置', '分配规则', '会话关闭理由', '会话类型', '预约邀请']
      }
      list.basic = {
        index: 2,
        title: '基本设置',
        name: 'basic',
        path: '/setting/basic',
        text: ['时间设置', '状态变更理由']
      }
      list.security = {
        index: 3,
        title: '安全设置',
        name: 'security',
        path: '/setting/security',
        text: ['IP地址限制', 'Mac地址限制']
      }
    }
    this.list = list
    this.$nextTick(() => {
      this.leftChange(this.$route)
    })
  },
  mounted () {
    this.win = this.$route.query.winbox
    this.winbox = this.$route.query.winbox
  },
  methods: {
    /**
     * 切换左侧的列表
     */
    leftChange (val) {
      let name = val.name
      this.list[name].path = val.path
      this.leftList = this.list[name]
    },
    /**
     * 切换左侧的列表的高亮
     */
    activeChange (val) {
      this.activeClass = val.activeClass
      this.$router.push({
        path: val.path,
        query: {
          index: val.activeClass,
          win: this.win,
          winbox: this.winbox
        }
      })
    },
    /**
     * 切换右侧的路由、左侧的列表的高亮
     */
    pageChange (val) {
      this.$router.push({
        path: val.path,
        query: {
          win: this.winbox,
          winbox: this.winbox
        }
      })
      this.activeClass = 0
      this.leftChange(val)
    }
  }
}
</script>
<style lang="less">
  .setting-page {
    &.check-box-wrap {
      margin: 28px 30px;
      display: flex;
      .title {
        width: 60px;
      }
      .right-wrap {
        margin-top: 3px;
        > div {
          margin-bottom: 15px;
        }
      }
    }
    .form {
      padding: 0 10px 6px;
      input, textarea {
        border: none;
        background: #f7f9f9;
        display: block;
        width: 100%;
        padding: 10px;
        border-radius: 4px;
        &::placeholder {
          color: @color-text-placeholder;
        }
      }
      textarea {
        height: 110px;
        resize: none;
      }
      .tx-rg {
        text-align: right;
      }
    }
  }
</style>