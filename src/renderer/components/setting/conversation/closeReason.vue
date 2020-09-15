<template>
  <div class="conversation-close-reason">
    <!-- 导航 关闭 退回xxx -->
    <div class="nav">
      <ul>
        <li
          :class="navActiveClass === index ? 'active' : ''" 
          v-for="(item, index) in navList" 
          :key="index" 
          @click="changeBtn(index)">{{item}}</li>
      </ul>
    </div>
    <!-- 理由按钮 -->
    <setting-btn
      title1="添加理由"
      title2="删除理由"
      @btnClick="btnClick"></setting-btn>
    <div class="flex-box">
      <!-- 左侧list -->
      <setting-list
        class="flex"
        :data="list"
        :activeClass="activeClass"
        :prevDisabled="prevDisabled"
        :nextDisabled="nextDisabled"
        @moveClick="moveClick"
        @listClick="listClick"></setting-list>
      <!-- 右侧表单 -->
      <div class="rg-wrap">
        <div class="title">编辑或添加理由</div>
        <div class="form">
          <input type="text" placeholder="请输入分组名称" v-model="reason.title" @focus="focus('item')" @blur="blur('title')">
          <textarea placeholder="请输入分组备注" v-model="reason.memo" @focus="focus('item')" @blur="blur('memo')"></textarea>
          <div class="tx-rg" v-show="addStatus"><el-button type="primary" size="mini" @click="reasonAdd">添加</el-button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import settingList from '@/components/setting/list'
import settingBtn from '@/components/setting/button'

export default {
  components: {
    settingList,
    settingBtn
  },
  data () {
    return {
      // navList: ['关闭', '退回', '转接', '备注', '共享'],
      navList: ['关闭', '退回', '转接'],
      list: ['一小时后继续跟进', '两小时后继续跟进'],
      prevDisabled: true,
      nextDisabled: false,
      reason: {
        title: '',
        memo: ''
      },
      id: 0,
      addStatus: false,
      navActiveClass: 0,
      activeClass: 0,
      focusText: '',
      closeType: 1
    }
  },
  created () {
    this.getReasonList()
  },
  watch: {
    activeClass: {
      handler () {
        if (this.activeClass === 0) {
          this.prevDisabled = true
          this.nextDisabled = false
        } else if (this.activeClass === this.list.length - 1) {
          this.prevDisabled = false
          this.nextDisabled = true
        } else {
          this.prevDisabled = false
          this.nextDisabled = false
        }
      },
      deep: true
    },
    list () {
      if (this.list.length <= 1) {
        this.nextDisabled = true
      } else {
        if (this.status) {
          this.nextDisabled = false
          this.status = false
        }
      }
    }
  },
  methods: {
    /**
     * 获取状态变更理由数据
     */
    getReasonList () {
      this.$http.post('/reason_setting_list', {
        type: 1,
        close_type: this.closeType
      }).then(res => {
        this.list = res.data
        this.status = false
        if (this.list.length) {
          this.reason.title = res.data[0].title
          this.reason.memo = res.data[0].memo
          this.id = res.data[0].id
          this.addStatus = false
        } else {
          this.reason.title = ''
          this.reason.memo = ''
          this.addStatus = true
        }
      })
    },
    /**
     * 切换nav
     */
    changeBtn (i) {
      this.navActiveClass = i
      this.closeType = i + 1
      this.getReasonList()
    },
    /**
     * 请求数据
     */
    setCustomSetting (v) {
      this.$http.post('/setCustomSetting', {
        setting_type: 'time_setting',
        time_setting: v
      }).then((res) => {
        this.$store.dispatch('timeSetting', v)
      }).catch(err => {
        this.$message.error(err.message)
      })
    },
    /**
     * 添加删除 按钮点击
     */
    btnClick (i) {
      if (i) { // 删除
        if (this.list.length === 0) return
        this.reasonDelete()
      } else { // 添加
        let noIds = true
        this.addStatus = true
        this.id = 0
        this.list.forEach((item, index) => {
          if (!item.id) {
            noIds = false
            this.activeClass = index
            this.reason.title = item.title
            this.reason.memo = item.memo
          }
        })
        if (!noIds) return
        console.log(noIds)
        this.reason.title = ''
        this.reason.memo = ''
        let reason = {}
        reason.title = ''
        reason.memo = ''
        this.list.push(reason)
        this.activeClass = this.list.length - 1
      }
    },
    /**
     * 列表点击
     */
    listClick (item) {
      console.log(item)
      if (item.id) {
        this.addStatus = false
      } else {
        this.addStatus = true
      }
      // 右侧填充理由
      this.activeClass = item.index
      this.id = item.id
      let list = this.list[item.index]
      this.reason.title = list.title
      this.reason.memo = list.memo
    },
    /**
     * 向上/向下移动 按钮点击
     */
    moveClick (type) {
      let option = this.list[this.activeClass]
      let tempOption = []
      if (type === 'prev') {
        tempOption = this.list[this.activeClass - 1]
        this.$set(this.list, this.activeClass - 1, option)
        this.$set(this.list, this.activeClass, tempOption)
        this.activeClass = this.activeClass - 1
      } else {
        tempOption = this.list[this.activeClass + 1]
        this.$set(this.list, this.activeClass + 1, option)
        this.$set(this.list, this.activeClass, tempOption)
        this.activeClass = this.activeClass + 1
      }
      let ids = ''
      this.list.forEach(item => {
        let id = parseInt(item.id)
        ids += id += ','
      })
      this.postSort(ids)
    },
    postSort (ids) {
      this.$http.post('/reason_setting_setsort', {
        ids: ids
      }).then(() => {
      }).catch(err => {
        this.$message.err(err.message)
      })
    },
    /**
     * input/textarea focus
     */
    focus (type) {
      if (this.list.length === 0) return
      let item = this.list[this.activeClass]
      if (type === 'title') {
        this.focusText = item.title
      } else {
        this.focusText = item.memo
      }
    },
    /**
     * input/textarea blur
     */
    blur (type) {
      let item = this.list[this.activeClass]
      if (this.list.length === 0 || !item.id) { return }
      if (type === 'title' && this.reason.title !== item.title) {
        this.reasonEdit(this.reason, item.id)
      }
      if (type === 'memo' && this.reason.memo !== item.memo) {
        this.reasonEdit(this.reason, item.id)
      }
    },
    /**
     * 修改理由
     */
    reasonEdit (item, id) {
      this.$http.post('/reason_setting_edit', {
        id: id,
        title: item.title,
        memo: item.memo
      }).then((res) => {
        this.list[this.activeClass].title = res.data.title
        this.list[this.activeClass].memo = res.data.memo
      })
    },
    /**
     * 添加理由
     */
    reasonAdd (item) {
      if (this.reason.title === '') {
        this.$message.error('请输入分组名称')
        return
      }
      if (this.reason.memo === '') {
        this.reason.memo = this.reason.title
      }
      this.$http.post('/reason_setting_add', {
        type: 1,
        close_type: this.closeType,
        title: this.reason.title,
        memo: this.reason.memo
      }).then((res) => {
        this.id = res.data.id
        this.list.splice(this.activeClass, 1)
        this.list.push(res.data)
        this.addStatus = false
      })
    },
    /**
     * 删除理由
     */
    reasonDelete () {
      if (this.list.length === 0) return // 列表长度为0
      if (!this.list[this.activeClass].id) { // 当前选中的没有id
        this.list.splice(this.activeClass, 1)
        this.activeClass = 0
        return
      }
      if (this.list.length === 0) return
      this.$http.post('/reason_setting_delete', {
        id: this.id
      }).then(() => {
        this.list.splice(this.activeClass, 1)
        this.activeClass = 0
        if (this.list.length) {
          this.reason.title = this.list[0].title
          this.reason.memo = this.list[0].memo
          this.id = this.list[0].id
        } else {
          this.reason.title = ''
          this.reason.memo = ''
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .conversation-close-reason {
    width: 100%;
    .nav {
      border-radius: 4px;
      overflow: hidden;
      padding: 10px 16px;
      border-bottom: 1px solid @border-color;
      ul {
        display: inline-block;
        border: 1px solid @color-primary;
        border-radius: 4px;
        li {
          cursor: pointer;
          color: @color-primary;
          display: inline-block;
          border-right: 1px solid @color-primary;
          padding: 5px 20px;
          &.active, &:hover {
            color: @color-white;
            background: @color-primary;
          }
          &:last-of-type {
            border-right: none;
          }
        }
      }
    }
    .flex-box {
      display: flex;
      height: 72.5%;
      .rg-wrap {
        flex: 1;
        .title {
          padding: 10px 16px;
        }
      }
    }
  }
</style>