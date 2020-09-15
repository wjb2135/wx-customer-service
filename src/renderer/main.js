import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import axios from './axios'
import Install from './utils/install'
import Win from 'electron-vue-windows'
import Dialog from '@/components/Dialog'
import '@/utils/vueFilter'
import '@/utils/command'
import {
  _API_ROOT
} from '@/config/env'
import db from './utils/db'

import {
  Row,
  Col,
  Button,
  Message,
  Tabs,
  TabPane,
  Table,
  TableColumn,
  Select,
  Option,
  OptionGroup,
  Input,
  DatePicker,
  TimeSelect,
  TimePicker,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Tree,
  Badge,
  Scrollbar,
  Popover,
  Form,
  FormItem,
  InputNumber,
  Pagination,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Transfer,
  Autocomplete,
  ColorPicker,
  Loading,
  Upload,
  Image,
  Alert
} from 'element-ui'
import './theme/default/index.css'
import utilscore from 'utilscore/dist/index.js'

const dialog = require('electron').remote.dialog
global.globalMoniterTimer = null
global.sessionMoniterTimer = null
global.hasHandleUnreadMsg = false // 是否读取未读消息
global.unreadMessageArr = [] // 未读消息
global.db = null

// 按需引入组件（element-ui）
Vue.use(Row)
Vue.use(Col)
Vue.use(Button)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Input)
Vue.use(DatePicker)
Vue.use(TimeSelect)
Vue.use(TimePicker)
Vue.use(Checkbox)
Vue.use(CheckboxButton)
Vue.use(CheckboxGroup)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Tree)
Vue.use(Badge)
Vue.use(Scrollbar)
Vue.use(Popover)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(InputNumber)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(Pagination)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Transfer)
Vue.use(Autocomplete)
Vue.use(ColorPicker)
Vue.use(Loading.directive)
Vue.use(Upload)
Vue.use(Image)
Vue.use(Alert)
Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message
Vue.prototype._APIROOT = _API_ROOT
Vue.prototype.ipc = require('electron').ipcRenderer
Vue.prototype.$db = db.db

// 渲染进程中发送
Vue.prototype.$ipcSend = function (name, message) {
  require('electron').ipcRenderer.send('ipcContact', name, message)
}
// 渲染进程中接受
Vue.prototype.$ipcOn = function (name, fn) {
  require('electron').ipcRenderer.on(name, fn)
}
Vue.prototype.$ipcRemove = function (name) {
  require('electron').ipcRenderer.removeAllListeners(name)
}

Vue.prototype.GLOBAL_moniterTimeOut = null

// 基于Element-ui的dialog改造的，适用于类似dialog视图的子窗口组件
Vue.component('Dialog', Dialog);

/**
 * 业务代码工具库
 * 相关API https://github.com/cgxqd/utilscore
 */
Vue.prototype.$utilscore = utilscore
Vue.prototype.$dialog = dialog

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.use(Install)
axios.install(Vue)

Win.init(router, {
  freeWindowNum: 3, // 初始空闲窗口数量（选填：默认为1）
  port: 9080 // 端口号（选填：默认9080）
})
Vue.prototype.$Win = Win

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
