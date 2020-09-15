<template>
  <div class="setting-page">
    <div v-show="index == 0" class="basic-time-wrap">
      <div class="title">提醒:</div>
      <div class="right-wrap">客服超过
        <el-input-number
          class="input-number" 
          v-model="num" 
          @change="handleChange" 
          :min="0"
          size="mini"></el-input-number>分钟未操作电脑，则自动进入离开状态
        <div class="tips">(0表示不会自动离开，更改设置后需要新登录方可生效)</div>
      </div>
    </div>
    <div v-show="index == 1" class="status-change-r">
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
            <el-input type="text" placeholder="请输入分组名称" v-model="reason.title" @focus="focus('item')" @blur="blur('title')" maxlength="20" show-word-limit></el-input>
            <el-input type="textarea" placeholder="请输入分组备注" v-model="reason.memo" @focus="focus('item')" @blur="blur('memo')" maxlength="100" show-word-limit></el-input>
            <div class="tx-rg" v-show="addStatus"><el-button type="primary" size="mini" @click="reasonAdd">添加</el-button></div>
          </div>
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
      index: 0,
      num: 1,
      prevDisabled: true,
      nextDisabled: false,
      list: [],
      reason: {
        title: '',
        memo: ''
      },
      id: 0,
      addStatus: false,
      activeClass: 0,
      focusText: '',
      pageReady: false
    }
  },
  watch: {
    '$route' (to, from) { // 监听 传参
      this.index = this.$route.query.index
      if (this.index === undefined) {
        this.index = 0
      }
    },
    index: {
      handler () {
        if (this.index === 1) {
          this.pageReady = true
          this.getReasonList()
        }
      }
    },
    activeClass: {
      handler () {
        if (this.activeClass === 0) {
          this.prevDisabled = true
          this.nextDisabled = false
        } else if (this.activeClass === this.list.length - 1) {
          this.prevDisabled = false
          this.nextDisabled = true
        } else {
          console.log(1111)
          this.prevDisabled = false
          this.nextDisabled = false
        }
      },
      deep: true
    },
    list () {
      if (this.list.length <= 1) {
        this.nextDisabled = true
      }
    }
  },
  created () {
    this.getTime()
  },
  methods: {
    /**
     * 获取时间设置数据
     */
    getTime () {
      this.$http.post('/getUserSetting').then(res => {
        this.num = Number(res.data.time_setting)
      })
    },
    /**
     * 获取状态变更理由数据
     */
    getReasonList () {
      this.$http.post('/reason_setting_list', {
        type: 2
      }).then(res => {
        this.list = res.data
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
     * 改变值
     */
    handleChange (v) {
      this.setCustomSetting(v)
    },
    /**
     * 请求数据
     */
    setCustomSetting (v) {
      this.$http.post('/setUserSetting', {
        setting_type: 'time_setting',
        time_setting: v
      }).then(() => {
        this.$store.dispatch('timeSetting', v)
      }).catch(err => {
        this.$message.error(err.message)
      })
    },
    /**
     * 列表点击
     */
    listClick (item) {
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
      console.log(this.activeClass)
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
        type: 2,
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
      }).catch(err => {
        this.$message.error(err.message)
      })
    }
  }
}
</script>

<style lang="less">
  .setting-page {
    flex: 1;
    .form {
      .el-input , .el-textarea {
        margin-bottom: 10px;
      }
    }
    .basic-time-wrap {
      padding: 28px 30px;
      display: flex;
      margin-bottom: 30px;
      .title {
        width: 90px;
        padding-top: 3px;
      }
      .tips {
        color: @color-red;
        margin-top: 10px;
      }
      .input-number {
        margin: 0 10px;
      }
      .m-b {
        margin: 12px 0 20px;
      }
    }
    .status-change-r {
      width: 100%;
      .flex-box {
        display: flex;
        height: 430px;
        .rg-wrap {
          flex: 1;
          .title {
            padding: 10px 16px;
          }
        }
      }
    }
    .el-input .el-input__count .el-input__count-inner , .el-textarea .el-input__count{
      background-color: #f7f9f9;
    }
  }
</style>