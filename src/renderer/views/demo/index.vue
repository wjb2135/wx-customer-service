<template>
  <div>
    conversation
    <div>数据请求回来的appInfo.appId: {{appInfo}}</div>
    <div @click="openTrayFlash">开启托盘闪烁</div>
    <br>
    <div @click="closeTrayFlash">关闭托盘闪烁</div>
    <br>
    <div @click="addNewWindow">新窗口</div>
    <br>
  </div>
</template>

<script>
const ipc = require('electron').ipcRenderer

export default {
  data () {
    return {
      img: ''
    }
  },
  created () {
    console.log('创建成功')

    // this.resetFrameMain()
    this.getDate()
  },
  computed: {
    appInfo () {
      if (this.$store.state.demo.init.appInfo) {
        return this.$store.state.demo.init.appInfo
      }
    }
  },
  methods: {
    getDate () {
      this.$http.post('/chibi/init').then(res => {
        console.log('1.请求成功: ', res)
        console.log('2.dispatch => actions, 传返回的到actions')
        this.$store.dispatch('DEMO', res.data)
      }).catch(err => {
        console.log('失败code !== 0: ', err)
      })
    },
    openTrayFlash () {
      ipc.send('openTrayFlash')
    },
    closeTrayFlash () {
      ipc.send('closeTrayFlash')
    },
    addNewWindow () {
      let data = this.$Win.openWin({
        width: 700,
        height: 600,
        windowConfig: {
          router: '/setting',
          name: 'setting', // 窗口名称
          data: {id: 1} // 传送数据
        }
      })
      console.log(data) // 新窗口返回的数据 {value: 2}
      // this.rightBottomWindows('http://www.vcoin1.fx.fanwe.cn/mobile#/accept/bind', { width: 600, height: 230, frame: false })
    }
  }
}
</script>

<style lang="less" scoped>
</style>