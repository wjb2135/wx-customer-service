<template>
  <!-- 录制音频 -->
  <div class="record-audio">
    <i class="iconfont icon-close" @click="cancelRecord()">&#xe690;</i>
    <div class="record-audio-bd">
      <div class="run-time">
        <div class="icon-mike"></div>
        <span class="time-text">
          <template v-if="!isStartRecord && !isFinishRecord">录音上限60秒</template>
          <template v-else-if="isFinishRecord && time == 59">录音上限60秒</template>
          <template v-else>{{timeText}}</template>
        </span>
      </div>
      <div class="btn-group">
        <div class="btn-record finish" v-if="isFinishRecord">完成录音</div>
        <template v-else>
          <div class="btn-record start" @click="startRecord" v-if="!isStartRecord">开始录音</div>
          <div class="btn-record stop" @click="finishRecord" v-else>停止录音</div>
        </template>
        <div class="btn-send" @click="send" :class="{'disable': !isFinishRecord}">发送录音</div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
const BenzAMRRecorder = require('benz-amr-recorder')
export default {
  data () {
    return {
      time: 0,
      setIntervalTimer: null,
      isStartRecord: false,
      isFinishRecord: false,
      amrRec: null
    }
  },
  mounted () {
  },
  methods: {
    /**
     * 监听录音事件
     */
    onAction () {
      let self = this
      if (self.amrRec && self.amrRec.isInit) {
        // 开始录音
        self.amrRec.onStartRecord(() => {
          self.isStartRecord = true
        })
        // 结束录音
        self.amrRec.onFinishRecord(() => {
          self.isStartRecord = false
          self.isFinishRecord = true
        })
        // 放弃录音
        self.amrRec.onCancelRecord(() => {
          self.$Win.closeWin()
        })
      }
    },
    /**
     * 开始录音
     */
    startRecord () {
      let self = this
      self.amrRec = new BenzAMRRecorder()
      self.amrRec.initWithRecord().then(function () {
        self.onAction()
        self.setIntervalTimer = setInterval(() => {
          if (self.time === 59) {
            clearInterval(self.setIntervalTimer)
            self.setIntervalTimer = null
            // 停止录制
            self.amrRec.finishRecord()
          } else {
            self.time++
          }
        }, 1000)
        // 开始录制
        self.amrRec.startRecord()
      })
    },
    /**
     * 停止录音
     */
    finishRecord () {
      let self = this
      if (self.amrRec) {
        self.amrRec.finishRecord().then(() => {
          clearInterval(self.setIntervalTimer)
          self.setIntervalTimer = null
        })
      }
    },
    /**
     * 放弃录音
     */
    cancelRecord () {
      let self = this
      if (self.amrRec) {
        self.amrRec.cancelRecord()
      } else {
        self.$Win.closeWin()
      }
    },
    /**
     * 发送语言
     */
    send () {
      let self = this
      let data = self.upload()
      if (this.$route.query.win) {
        return;
      }
      self.$http.post('/weixin.send', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        ipcRenderer.send('sendSuccessVoiceMessage', res.data)
        self.$Win.closeWin()
      })
    },
    /**
     * 上传
     */
    upload () {
      let self = this
      let fd = new FormData()
      let bold = self.amrRec.getBlob()
      let fr = new FileReader()
      fr.readAsDataURL(bold)
      if (this.$route.query.win) {
        fr.onloadend = (ev) => {
          let base64 = ev.target.result
          this.$ipcSend('voiceRecord', {
            data: base64,
            winbox: this.$route.query.win
          })
          self.$Win.closeWin()
        }
      } else {
        let files = new File([bold], 'test.amr', {type: 'audio/amr', lastModified: Date.now()})
        fd.append('fileUpload', files)
        fd.append('id', self.$route.query.uid)
        fd.append('type', 'voice')
        return fd
      }
    },
    /**
     * 取消录制
     */
    cancel () {

    }
  },
  computed: {
    timeText () {
      return this.time < 10 ? '00:0' + this.time : '00:' + this.time
    }
  }
}
</script>

<style lang="less" scoped>
  .record-audio {
    position: relative;
    background: url('../../assets/images/session/bg-recordaudio.png') center 25px no-repeat;
    background-color: #fff;
    padding: 15px;
    .icon-close {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 99;
      color: #24272b;
      display: block;
      cursor: pointer;
    }
    .icon-mike {
      width: 130px;
      height: 130px;
      background: url('../../assets/images/session/icon-mike.png') no-repeat;
      background-position: center center;
    }
    .run-time {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      .time-text {
        margin-top: 10px;
      }
    }
    .record-audio-bd {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .btn-group {
      height: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      & .btn-record, & .btn-send {
        background-color: @color-primary;
        color: #fff;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        width: 106px;
        height: 30px;
        line-height: 1;
      }
      .btn-record {
        &.finish {
          background-color: #d1d6dd;
          color: #87929f;
          cursor: not-allowed;
        }
        &.stop {
          background-color: @color-red;
        }
      }
      .btn-send {
        background-color: @color-red;
        &.disable {
          background-color: #d1d6dd;
          color: #87929f;
          cursor: not-allowed;
        }
      }
    }
  }
</style>
