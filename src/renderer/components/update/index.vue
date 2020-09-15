<template>
  <div class="app-container">
    <el-dialog
      :title="title"
      :visible.sync="updateDialogVisible"
      width="40%" 
      :close-on-click-modal="false" 
      :close-on-press-escape="false"    
      @close="close()" 
      center>
      <span v-html="remark"></span>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="updateApp">立即更新</el-button>
        <el-button size="small" @click="close()">以后再说</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :visible.sync="downloadDialogVisible"
      :show-close="false" 
      :close-on-click-modal="false" 
      :close-on-press-escape="false"  
      title="正在下载更新..."
      width="30%"
      >
      <div>
        <el-progress :percentage="downloadPercent"></el-progress>
        <div style="margin-top:5px;">当前进度：{{progressInf}}</div>
        <div style="margin-top:5px;">下载速度：{{bytesPerSecond}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { ipcRenderer } from 'electron'
import { Dialog, Progress } from 'element-ui'
Vue.use(Dialog)
Vue.use(Progress)
export default {
  props: {
    updateDialogVisible: {
      type: Boolean,
      default: false
    }
  },
  created () {
    this.checkAppUpgrade()
  },
  data () {
    return {
      downloadPercent: 0,
      downloadDialogVisible: false,
      title: '',
      remark: '',
      bytesPerSecond: '',
      progressInf: ''
    }
  },
  methods: {
    updateApp () {
      this.$emit('closeUpdateDialogVisible')
      this.downloadDialogVisible = true
      this.downloadUpdate()
    },
    downloadUpdate () {
      ipcRenderer.send('downloadUpdate')
      // 注意："downloadProgress”事件可能存在无法触发的问题，只需要限制一下下载网速就好了
      ipcRenderer.on('downloadProgress', (event, progressObj) => {
        console.log(progressObj)
        this.downloadPercent = Math.trunc(progressObj.percent) || 0
        this.total = `${(progressObj.total / 1024 / 1024).toFixed(2)}`
        this.transferred = `${(progressObj.transferred / 1024 / 1024).toFixed(2)}`
        this.progressInf = `${this.transferred}MB / ${this.total}MB`
        this.bytesPerSecond = progressObj.bytesPerSecond / 1024 > 1 ? `${(progressObj.bytesPerSecond / 1024 / 1024).toFixed(2)}MB/s` : `${progressObj.bytesPerSecond / 1024}KB/s`
        // this.downloadPercent = progressObj.percent.toFixed(2) || 0
        if (Math.trunc(this.downloadPercent) === 100) {
          this.downloadDialogVisible = false
        }
      })
    },

    /**
     * 检查更新
     */
    checkAppUpgrade () {
      this.$http.post('/system.check_app_upgrade').then((res) => {
        this.title = `V${res.data.sdk_version}版本更新啦！`
        this.remark = res.data.forced_upgrade_dec
      })
    },
    close () {
      this.$emit('closeUpdateDialogVisible')
    }
  }
}
</script>