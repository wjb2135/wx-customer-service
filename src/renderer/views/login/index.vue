
<template>
  <div class="login-page" v-if="pageLoading">
    <!-- 头部 -->
    <div class="header">
      <div class="title">{{sysConfig.name}}</div>
      <div class="icon-wrap">
        <i class="iconfont" @click="hideWindow">&#xe69d;</i>
        <i class="iconfont" @click="closeWindow">&#xe69a;</i>
      </div>
    </div>
    <div class="content">
      <!-- 头像 -->
      <img v-if="!avatar" class="avatar" src="../../assets/images/avatar/avatar-default.png">
      <div class="avatar" v-else :style="{backgroundImage: 'url(' + avatar + ')'}"></div>
      <div class="logining-box" v-show="loading">
        <span>正在登陆，请稍候...</span>
      </div>
      <!-- 表单 -->
      <div class="form" v-show="!loading">
        <!-- 账号 -->
        <div class="input-wrap" :class="{active: accountFocus}">
          <i class="iconfont icon">&#xe6da;</i>
          <input 
            type="text" 
            placeholder="请输入用户账号" 
            @focus="inputFoucs(0)" 
            @blur="inputBlur(0)" 
            v-model.trim="form.account">
          <div 
            :class="{active: selected}" 
            class="icon-down" 
            id="accountSelect"
            @click="selectDown(0)">
            <i class="iconfont">&#xe69e;</i>
          </div>
          <!-- 本地存储的历史账号 -->
          <ul class="select-account" v-show="selected">
            <li v-for="(item, index) in accountList" :key="index" @click="selectDown(1, item)">
              <div class="avatar" :style="{backgroundImage: 'url(' + item.avatar + ')'}">
                <!-- :style="{background: 'url(' + avatar + ')'}" -->
              </div>
              <div class="info">
                {{item.nickname}}
                <p>{{item.account}}</p>
              </div>
              <div class="delete-btn" @click.stop="deleteAccountBtn(item)"><i class="iconfont">&#xe69a;</i></div>
            </li>
          </ul>
        </div>
        <!-- 密码 -->
        <div class="input-wrap" :class="{active: pwdFocus}">
          <i class="iconfont icon">&#xe6d9;</i>
          <input 
            type="password" 
            placeholder="请输入密码" 
            @focus="inputFoucs(1)" 
            @blur="inputBlur(1)" 
            v-model.trim="form.password">
        </div>
        <div class="tips">{{tips}}</div>
      </div>
    </div>
    <!-- 底部 -->
    <div class="footer" v-if="!loading">
        <el-checkbox v-model="checked[0]">自动登录</el-checkbox>
        <el-checkbox v-model="checked[1]">记住密码</el-checkbox>
        <div class="status-wrap" id="statusWrap" @click="statusClick">
          <img :src="statusDefault.icon">{{statusDefault.text}}
          <i class="iconfont">&#xe697;</i>
        </div>
          <!-- 在线状态 -->
        <div class="status-contain" v-show="statusShow">
          <div 
            @click="statusSelected(item)"
            class="status-wrap" 
            v-for="(item, index) in statusList" 
            :key="index">
            <img :src="item.icon">{{item.text}}
          </div>
        </div>
    </div>
    <!-- 登录按钮 -->
    <div class="login-btn">
      <el-button type="primary" size="medium" :loading="loading" @click="loginBtn" :disabled="loading">登录</el-button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
const Cookie = require('@/utils/cookie')
const encrypt = require('encryptjs')
const ipc = require('electron').ipcRenderer
const os = require('os')
const interfaces = os.networkInterfaces()
export default {
  data () {
    return {
      name: '',
      isClick: true,
      winbox: false,
      avatar: '',
      selected: false,
      checkList: [],
      checked: [false, false],
      statusShow: false, // 状态 在线离开离线
      statusDefault: {icon: require('@assets/images/top/online.png'), text: '在线'},
      statusList: [
        {status: 1, icon: require('@assets/images/top/online.png'), text: '在线'},
        {status: 2, icon: require('@assets/images/top/offline.png'), text: '离开'},
        {status: 3, icon: require('@assets/images/top/busy.png'), text: '忙碌'}
      ],
      accountFocus: false,
      pwdFocus: false,
      tips: '',
      loading: false,
      accountList: [],
      form: {
        // account: 'binjian@sss.com',
        // password: 'a156322',
        account: '',
        password: '',
        online_status: 1,
        terminal: '',
        last_login_mac: '',
        last_login_pc_name: ''
      },
      pageLoading: false
    }
  },
  created () {
    let self = this
    self.$db.loginUserData.loadDatabase()
    self.loginList()
    self.getAddress()
  },
  mounted () {
    setTimeout(() => {
      this.$store.dispatch('windowChangeLoading', false)
    }, 5000)

    this.pageLoading = true
    setTimeout(() => {
      this.closeDown()
    }, 1000)
    if (this.$route.query.winbox) {
      this.winbox = this.$route.query.winbox
    }
    window.addEventListener('keyup', this.keyUpEnter)
  },
  methods: {
    ...mapActions(['setToken', 'setBaseUserInfo']),
    /**
     * 监听键盘事件Enter
     */
    keyUpEnter (e) {
      if (e.keyCode === 13 && this.isClick) {
        this.isClick = false
        this.loginBtn()
      }
    },
    getAddress () {
      let interfaces = os.networkInterfaces()
      switch (os.platform()) {
        case 'darwin':
          console.log('mac登录')
          this.form.terminal = 'mac'
          if (interfaces.en0) { // 有线网络
            // console.log('有线网络', interfaces.en0)
            interfaces.en0.map(value => {
              this.form.last_login_mac = value.mac
            })
          } else {
            // console.log('无线网络', interfaces.en6)
            interfaces.en6.map(value => { // 无线网络
              if (value.family === 'IPv4') {
                this.form.last_login_mac = value.mac
              }
            })
          }
          break
        case 'win32':
          this.form.terminal = 'windows'
          // console.log('windows登录')
          // console.log('interfaces', interfaces)
          let i = 0
          for (i in interfaces) {
            interfaces[i].map((item, index) => {
              if (item.mac !== '00:00:00:00:00:00' && item.family === 'IPv4') {
                this.form.last_login_mac = item.mac
              }
            })
          }
          break
        default:
          console.log('微信登录')
          this.form.terminal = 'weixin'
          break
      }
      this.form.last_login_pc_name = os.hostname()
      console.log('主机名', os.hostname(), ', mac 地址', this.form.last_login_mac)
    },
    /**
     * 最小化窗口
     */
    hideWindow () {
      this.ipc.send('hideWindow', {
        winbox: this.winbox
      })
    },
    /**
     * 关闭窗口
     */
    closeWindow () {
      this.ipc.send('closeWindow', {
        winbox: this.winbox
      })
    },
    /**
     * 点击其它地方，关闭下拉
     */
    closeDown () {
      let statusWrap = document.getElementById('statusWrap')
      let accountSelect = document.getElementById('accountSelect')
      document.addEventListener('click', (e) => {
        if (statusWrap) {
          if (!statusWrap.contains(event.target)) {
            this.statusShow = false
          }
        }
        if (accountSelect) {
          if (!accountSelect.contains(event.target)) {
            this.selected = false
          }
        }
      })
    },
    /**
     * 下拉历史记录点击
     */
    selectDown (v, item) {
      if (v) {
        this.avatar = item.avatar
        console.log('当前点击存储的信息', item)
        this.form.account = item.account
        this.form.password = item.password
        this.form.online_status = item.online_status
        this.checked[0] = !!item.auto_login
        this.checked[1] = !!item.save_password
        this.avatar = item.avatar

        switch (item.online_status) {
          case 1:
            this.statusDefault = this.statusList[0]
            break;
          case 2:
            this.statusDefault = this.statusList[1]
            break;
          case 3:
            this.statusDefault = this.statusList[2]
            break;

          default:
            break;
        }

        if (item.auto_login === 1) { // 自动登录
          this.loginBtn()
        }
        this.selected = false
      } else {
        this.selected = !this.selected
      }
    },
    /**
     * 删除本地账户
     */
    deleteAccountBtn (i) {
      let self = this
      self.selected = false
      console.log(i)
      this.$db.loginUserData.remove({ user_id: i.user_id }, function (err, numRemoved) {
        if (err) {
          console.log(err)
        } else {
          console.log('删除成功')
          if (self.form.account === i.account) {
            self.form.account = ''
            self.form.password = ''
            self.checked[0] = false
            self.checked[1] = false
            self.statusDefault = self.statusList[0]
          }
          self.loginList()
        }
      })
    },
    inputFoucs (i) {
      if (i) {
        this.pwdFocus = true
      } else {
        this.accountFocus = true
      }
    },
    inputBlur (i) {
      if (i) {
        this.pwdFocus = false
      } else {
        // console.log(this.selected)
        this.accountFocus = false
      }
    },
    /**
     * 点击状态显示
     */
    statusClick () {
      this.statusShow = true
    },
    /**
     * 点击状态选择
     */
    statusSelected (item) {
      this.form.online_status = item.status
      this.statusDefault = item
      this.statusShow = false
    },
    /**
     * 本地存储的账号列表
     */
    loginList () {
      let self = this
      self.$db.loginUserData.find({}, function (err, docs) {
        if (err) {
          console.log(err)
        } else {
          if (Cookie.getCookies('isLogout')) {
            if (docs && docs.length > 0) {
              self.$db.loginUserData.update({ auto_login: true }, { $set: { auto_login: false } }, { multi: true }, function (err, numReplaced) {
                console.log(err)
                console.log(numReplaced)
              });
            }
            docs.forEach(element => {
              element.auto_login = false
            });
          }
          // 数组去重（去除重复记录的账号）
          let result = []
          for (const i of docs) {
            !JSON.stringify(result).includes(JSON.stringify(i)) && result.push(i)
          }
          self.accountList = result
          if (result && result.length > 0) {
            self.form.account = result[0].account
            self.form.password = result[0].password
            self.form.online_status = result[0].online_status
            self.avatar = result[0].avatar
            self.checked[0] = !!result[0].auto_login
            self.checked[1] = !!result[0].save_password

            switch (result[0].online_status) {
              case 1:
                self.statusDefault = self.statusList[0]
                break;
              case 2:
                self.statusDefault = self.statusList[1]
                break;
              case 3:
                self.statusDefault = self.statusList[2]
                break;

              default:
                break;
            }

            if (self.checked[0]) { // 自动登陆
              setTimeout(() => {
                self.loginBtn()
              }, 1000);
            }
          }
        }
      })
    },
    /**
     * 登录按钮
     */
    loginBtn () {
      let self = this
      if (this.loading) return
      if (this.$utilscore.isEmpty(this.form.account)) {
        this.tips = '请输入用户账号'
        this.isClick = true
        return
      }
      if (this.$utilscore.isEmpty(this.form.password)) {
        this.tips = '请输入密码'
        this.isClick = true
        return
      }
      this.loading = true
      this.$http.post('/login', this.form).then(res => {
        this.loading = false
        this.pageLoading = false
        res.data.login_time = this.getLoginTime()
        Cookie.setCookie('_token', res.data._token)
        Cookie.setCookie('isLogout', false)
        this.setToken(res.data._token) // 存储登录凭证
        this.setBaseUserInfo(res.data)
        this.$store.dispatch('logoutStatus', res.data.online_status)
        // 保存账号登陆记录
        this.$db.loginUserData.find({account: this.form.account}, (err, docs) => {
          if (err) {
            console.log(err)
          } else {
            if (docs && docs.length === 0) {
              console.log('插入新数据')
              console.log(self.checked[1])
              // 插入新数据
              let params = {
                user_id: res.data.id,
                account: res.data.account,
                nickname: res.data.nickname,
                online_status: res.data.online_status,
                avatar: res.data.avatar,
                sex: res.datasex,
                password: self.checked[1] ? self.form.password : '',
                auto_login: self.checked[0],
                save_password: self.checked[1]
              }
              console.log(params)
              self.$db.loginUserData.insert(params, function (err, newDoc) {
                console.log(err)
                console.log(newDoc)
              });
            } else {
              console.log('已存有数据')
              console.log(self.checked[1])
              // 已存有数据
              let params = {
                user_id: res.data.id,
                account: res.data.account,
                nickname: res.data.nickname,
                online_status: res.data.online_status,
                avatar: res.data.avatar,
                sex: res.datasex,
                password: self.checked[1] ? self.form.password : '',
                auto_login: self.checked[0],
                save_password: self.checked[1]
              }
              console.log(params)
              self.$db.loginUserData.update({ user_id: res.data.id }, params, {}, function (err, numReplaced, upsert) {
                console.log(err)
                console.log(numReplaced)
                console.log(upsert)
              });
            }
          }
        })
        setTimeout(() => {
          this.$emit('windowChange', {
            ipc: 'content-window-show',
            path: '/home'
          })
        }, 300)
      }).catch(err => {
        this.isClick = true
        this.loading = false
        this.tips = err.message
      })
    },
    getLoginTime () {
      let myDate = new Date()
      let year = myDate.getFullYear()
      let month = myDate.getMonth() + 1 < 10 ? '0' + (myDate.getMonth() + 1) : myDate.getMonth() + 1
      let date = myDate.getDate() < 10 ? '0' + myDate.getDate() : myDate.getDate()
      let hours = myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours()
      let minutes = myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes()
      let seconds = myDate.getSeconds() < 10 ? '0' + myDate.getSeconds() : myDate.getSeconds()
      let time = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds
      return time
    }
  },
  computed: {
    ...mapGetters(['sysConfig'])
  },
  destroyed () {
    window.removeEventListener('keyup', this.keyUpEnter)
  }
}
</script>

<style lang="less" scoped>
  .login-page {
    .header {
      height: 110px;
      background: url('../../assets/images/login/login-bg.jpg') no-repeat top center;
      background-size: contain;
      padding: 10px 20px;
      display: flex;
      color: @color-white;
      -webkit-app-region: drag;
      .title {
        flex: 1;
      }
      .icon-wrap {
        -webkit-app-region: no-drag;
        .iconfont {
          font-size: 12px;
          margin-left: 16px;
          cursor: pointer;
          -webkit-app-region: no-drag;
        }
      }
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -40px;
      > .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, .3);
        background-image: url('../../assets/images/avatar/avatar-default.png');
        box-shadow: 1px 1px 16px rgba(0, 0, 0, 0.2);
        background-position: center center;
        background-size: cover;
        background-repeat: no-repeat;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .logining-box {
        height: 148px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: @color-text-secondary;
        font-size: 16px;
      }
      .form {
        width: 240px;
        .input-wrap {
          padding: 6px 0;
          border-bottom: 1px solid @border-color;
          margin-top: 22px;
          display: flex;
          align-items: center;
          position: relative;
          &.active {
            border-bottom: 1px solid #0e88ed;
            .icon {
              color: #0e88ed;
            }
          }
          .icon {
            font-size: @font-size-bigger;
            color: #d1d6dd;
            margin-right: 10px;
          }
          input {
            border: none;
            outline: none;
            flex: 1;
            font-size: @font-size-base;
          }
          .icon-down {
            color: #d1d6dd;
            cursor: pointer;
            position: relative;
            transition: .2s;
            &.active {
              transform: rotatex(200deg);
            }
          }
          .select-account {
            position: absolute;
            top: 29px;
            z-index: 2;
            background: #fff;
            box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.3);
            width: 100%;
            padding-top: 5px;
            border-bottom-left-radius: 4px;
            border-bottom-right-radius: 4px;
            height: 115px;
            overflow: auto;
            -webkit-overflow-scrolling: touch;
            li {
              display: flex;
              align-items: center;
              padding: 8px 10px 8px 15px;
              cursor: pointer;
              &:hover {
                background: #f1f8ff;
              }
              .avatar {
                width: 38px;
                height: 38px;
                margin-right: 15px;
                border-radius: 50%;
                background-color: #fffbfc;
                background-size: cover;
                background-position: center;
                overflow: hidden;
                img {
                  width: 100%;
                }
              }
              .info {
                display: flex;
                flex: 1;
                flex-direction: column;
                justify-content: center;
                p {
                  color: @color-text-secondary;
                }
              }
              .delete-btn {
                i {
                  font-size: 12px;
                  color: #d1d6dd;
                }
              }
            }
          } 
        }
        .tips {
          color: @color-red;
          font-size: @font-size-small;
          margin-top: 5px;
        }
      }
    }
    .footer {
      position: relative;
      display: flex;
      align-items: center;
      width: 240px;
      margin: 10px auto;
      font-size: @font-size-small;
      .status-wrap {
        cursor: pointer;
        display: flex;
        align-items: center;
        img {
          margin-right: 5px;
        }
        .iconfont {
          font-size: 8px;
          margin-left: 5px;
        }
      }
      .status-contain {
        display: flex;
        flex-direction: column;
        position: absolute;
        background: #fff;
        padding: 4px 0;
        z-index: 1;
        right: -53px;
        top: 20px;
        box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.3);
        border-radius: 4px;
        .status-wrap {
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px 10px;
          width: 100px;
          &:hover {
            background: #f1f8ff;
          }
        }
      }
    }
    .login-btn {
      width: 240px;
      margin: 20px auto;
      button {
        width: 100%;
      }
    }
  }
</style>

<style lang="less">
  .login-page {
    .el-checkbox {
      flex: 1;
      margin-right: 18px;
      display: flex;
      align-items: center;
      .el-checkbox__label {
        padding-left: 4px;
        font-size: 12px;
      }
    }
  }
</style>