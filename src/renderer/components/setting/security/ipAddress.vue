<template>
  <div class="container">
    <div class="header">
      <div><input type="text" placeholder="请输入地址" v-model="ipAddress"></div>
      <div>
        <el-button type="primary" size="mini" @click="addBtn">添加</el-button>
        <el-button :disabled="disable" type="primary" size="mini" @click="deleteBtn">删除</el-button>
      </div>
    </div>
    <div class="content">
      <div><el-checkbox v-model="checked" @change="handleChange">启用登录IP限制</el-checkbox></div>
      <div class="list">
        <div class="title">允许访问的IP列表：</div>
        <ul>
          <li 
            @click="ipClick(index)"
            :class="activeClass === index ? 'active' : ''" 
            v-for="(item, index) in list" 
            :key="index">{{item.ip}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    checkedProps: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      checked: false,
      index: 0,
      list: {},
      activeClass: -1,
      disable: true,
      ipAddress: ''
    }
  },
  watch: {
    checkedProps: {
      handler () {
        this.checked = this.checkedProps
      },
      deeep: true
    }
  },
  created () {
    this.getAddress()
  },
  methods: {
    /**
     * 获取ip地址
     */
    getAddress () {
      this.$http.post('/get_ip').then(res => {
        this.list = res.data
      })
    },
    /**
     * 点击IP列表
     */
    ipClick (index) {
      let status = false
      this.activeClass = this.activeClass === -1 ? index : -1
      this.disable = this.activeClass !== -1 ? status : !status
    },
    /**
     * 启动/禁用 IP限制
     */
    handleChange (e) {
      let status = e ? 1 : 0
      this.$http.post('/setUserSetting', {
        setting_type: 'IP_address_limitation_setting',
        has_ip_limitation: status
      }).then(() => {
      }).catch(() => {
        this.checked = !e
      })
    },
    addBtn () {
      let already = false
      this.list.forEach(item => {
        if (item.ip === this.ipAddress) {
          already = true
        }
      })
      if (already) return
      this.$http.post('/add_ip', {
        ip: this.ipAddress
      }).then(res => {
        this.ipAddress = ''
        console.log(res.data)
        this.list.push(res.data)
      })
    },
    deleteBtn () {
      if (this.activeClass === -1) return
      this.$http.post('/delete_ip', {
        id: this.list[this.activeClass].id
      }).then(res => {
        this.list.splice(this.activeClass, 1)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    .header {
      display: flex;
      padding: 10px 16px;
      border-bottom: 1px solid @border-color;
      > div {
        &:first-of-type {
          flex: 1;
        }
        input {
          border: none;
          background: #f7f9f9;
          display: block;
          width: 372px;
          padding: 10px;
          &::placeholder {
            color: @color-text-placeholder;
          }
        }
      }
    }
    .content {
      padding: 28px 30px;
      .title {
        margin: 25px 0 15px;
      }
      ul {
        background: #f7f9f9;
        border-radius: 4px;
        font-size: 0;
        padding: 16px 5px 16px 16px;
        height: 307px;
        overflow: scroll;
        li {
          text-align: center;
          cursor: pointer;
          display: inline-block;
          color: @color-white;
          background: @color-primary;
          border-radius: 4px;
          font-size: @font-size-base;
          margin-right: 10px;
          margin-bottom: 10px;
          padding: 7px 0;
          width: 180px; 
          &.active {
            background: @color-red;
            &:hover {
              background: #f78989;
            }
          }
          &:hover {
            background: #66b1ff;
          }
        }
      }
    }
  }
</style>