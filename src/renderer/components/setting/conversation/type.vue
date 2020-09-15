<template>
  <div class="conversation-type">
    <!-- 添加/删除按钮 -->
    <setting-btn
      title1="添加理由"
      title2="删除标签"
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
        <div class="list">
          <div class="title">填写标签名称</div>
          <div class="form">
            <input type="text" placeholder="请输入分组名称" v-model="form.name" @blur="blur('title')">
          </div>
        </div>
        <div class="list">
          <div class="title">设置会话类型</div>
          <div class="input-wrap">
            <div>
              访客说了<el-input-number size="mini" :min="-1" v-model="form.caller_min" @change="reasonEdit"></el-input-number>至
              <el-input-number size="mini" :min="-1" v-model="form.caller_max" @change="reasonEdit"></el-input-number>句话
            </div>
            <div>
              客服说了<el-input-number size="mini" :min="-1" v-model="form.custom_service_min" @change="reasonEdit"></el-input-number>至
              <el-input-number size="mini" :min="-1" v-model="form.custom_service_max" @change="reasonEdit"></el-input-number>句话
            </div>
            <div>
              该类型对话得分<el-input-number size="mini" :min="0" v-model="form.fraction" @change="reasonEdit"></el-input-number>分
            </div>
            <div>
                <el-checkbox v-model="checked" @change="reasonEdit('leave_a_call')">是否留电话</el-checkbox>
            </div>
            <div class="tips">*选择-1时为不限制</div>
          </div>
        </div>
        <div class="tx-rg" v-show="addStatus"><el-button type="primary" size="mini" @click="reasonAdd">添加</el-button></div>
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
      activeClass: 0,
      prevDisabled: true,
      nextDisabled: false,
      list: [],
      inputValue: [20, 20, 20, 20, 20],
      checked: false,
      addStatus: false,
      form: {
        name: '',
        caller_min: '',
        caller_max: '',
        custom_service_min: '',
        custom_service_max: '',
        fraction: '',
        leave_a_call: ''
      }
    }
  },
  watch: {
    activeClass: {
      handler () {
        console.log(this.activeClass, this.list.length - 1)
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
    form: {
      handler () {
        if (this.form.leave_a_call === 1) {
          this.checked = true
        } else {
          this.checked = false
        }
      },
      deep: true
    }
  },
  created () {
    this.getTypeSettingList()
  },
  methods: {
    getTypeSettingList () {
      this.$http.post('/session_type_setting_list').then(res => {
        this.list = res.data
        this.form = this.list[0]
        if (this.form.leave_a_call === 1) {
          this.checked = true
        } else {
          this.checked = false
        }
        if (this.list.length <= 1) {
          this.nextDisabled = true
        } else {
          if (this.status) {
            this.nextDisabled = false
            this.status = false
          }
        }
      })
    },
    setUserSetting () {
      this.$http.post('/setUserSetting', {
        setting_type: 'session_type_setting',
        session_type_setting: this.form
      })
    },
    /**
     * 切换nav
     */
    changeBtn (i) {
      this.activeClass = i
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
            this.form = item
          }
        })
        if (!noIds) return
        console.log(noIds)
        this.form = {
          name: '',
          caller_min: 0,
          caller_max: 1,
          custom_service_min: 0,
          custom_service_max: 1,
          fraction: 0,
          leave_a_call: 0
        }
        this.list.push(this.form)
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
      let ids = ''
      this.list.forEach(item => {
        let id = parseInt(item.id)
        ids += id += ','
      })
    },
    postSort (ids) {
      this.$http.post('/session_type_setting_setsort', {
        ids: ids
      }).then(() => {
      }).catch(err => {
        this.$message.err(err.message)
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
      this.form = this.list[item.index]
    },
    /**
     * input blur
     */
    blur (type) {
      let item = this.list[this.activeClass]
      if (this.list.length === 0 || !item.id) { return }
      this.reasonEdit()
    },
    /**
     * 修改理由
     */
    reasonEdit (v) {
      if (this.addStatus) return
      if (v === 'leave_a_call') {
        if (this.checked) {
          this.form.leave_a_call = 1
        } else {
          this.form.leave_a_call = 0
        }
      }
      this.$http.post('/session_type_setting_edit', this.form).then((res) => {
        this.list[this.activeClass].name = res.data.name
      })
    },
    /**
     * 添加理由
     */
    reasonAdd (item) {
      if (this.form.name === '') {
        this.$message.error('请输入分组名称')
        return
      }
      this.$http.post('/session_type_setting_add', this.form).then((res) => {
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
      this.$http.post('/session_type_setting_delete', {
        id: this.id
      }).then(() => {
        this.list.splice(this.activeClass, 1)
        this.activeClass = 0
        if (this.list.length) {
          this.form = this.list[0]
        } else {
          this.form.name = ''
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .conversation-type {
    width: 100%;
    .flex-box {
      display: flex;
      height: 82.6%;
      .rg-wrap {
        flex: 1;
        .title {
          padding: 10px 16px;
          font-size: @font-size-bigger;
        }
        .input-wrap {
          padding: 0 16px;
          > div {
            margin-bottom: 14px;
          }
        }
        .tips {
          color: @color-red;
          margin-top: 25px;
        }
        .tx-rg {
          text-align: right;
          margin-right: 20px;
        }
      }
    }
  }
</style>

<style lang="less">
  .conversation-type {
    .el-input-number--mini {
      width: 120px;
      margin: 0 7px;
    }
  }
</style>
