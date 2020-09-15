<template>
  <div class="video">
    <div class="video-title drag">
      <span class="video-title-l">来自{{$route.query.uname}}的视频</span>
      <span class="video-title-r no-drag">
        <i class="icon iconfont" @click="minWindows" title="最小化">&#xe68d;</i>
        <!-- <i class="icon iconfont" @click="maxWindows" title="最大化/还原">&#xe68c;</i> -->
        <i class="icon iconfont" @click="hideWindows" title="关闭">&#xe88a;</i>
      </span>
    </div>
    <div class="video-box" v-loading="loading" element-loading-text="加载视频中">
      <video id="myVideo" class="video-js vjs-big-play-centered vjs-4-3">
        <source :src="dataUrl" type="video/mp4">
      </video>
    </div>
  </div>
</template>

<script>
import Video from 'video.js'
import 'video.js/dist/video-js.css'
import { mapGetters } from 'vuex'
export default {
  props: ['data', 'activeChatUserId', 'userInfo'],
  data () {
    return {
      winbox: false,
      dataUrl: '',
      myPlayer: null,
      loading: false
    }
  },
  mounted () {
    let self = this
    this.initVideo()
    window.onresize = () => {
      self.initVideo()
    }
    if (this.$route.query.winbox) {
      this.winbox = this.$route.query.winbox
    }
  },
  methods: {
    /**
     * 获得视频OSS
     */
    getmedia (id) {
      this.loading = true
      this.$http.post('/weixin.getmedia', {
        id: id
      }).then((res) => {
        this.loading = false
        this.dataUrl = res.data.oss_url
        this.$nextTick(() => {
          this.initVideo()
        })
      }).catch(() => {
        this.loading = false
      })
    },
    initVideo () {
      // 初始化视频方法
      let self = this
      self.myPlayer = Video('myVideo', {
        // 确定播放器是否具有用户可以与之交互的控件。没有控件，启动视频播放的唯一方法是使用autoplay属性或通过Player API。
        controls: true,
        // 自动播放属性,muted:静音播放
        autoplay: false,
        // 建议浏览器是否应在<video>加载元素后立即开始下载视频数据。
        preload: 'auto',
        // 设置视频播放器的显示宽度（以像素为单位）
        width: window.innerWidth + 'px',
        // 设置视频播放器的显示高度（以像素为单位）
        height: (window.innerHeight - 30) + 'px',
        sources: [ // 视频源
          {
            src: self.ossUrl,
            type: 'video/mp4'
          }
        ]
      });
    },
    minWindows: function () {
      this.ipc.send('minWindow', {
        winbox: this.winbox
      })
    },
    maxWindows: function () {
      this.ipc.send('maxWindow', {
        winbox: this.winbox
      })
    },
    hideWindows: function () {
      this.ipc.send('hideWindow', {
        winbox: this.winbox
      })
    }
  },
  computed: {
    ...mapGetters(['ossUrl'])
  }
}
</script>

<style lang="less">
  .video {
    .video-title {
      height: 30px;
      background-color: #1b1d25;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
      .video-title-r {
        display: flex;
        .iconfont {
          font-size: 14px;
          margin-left: 20px;
          color: #787879;
          cursor: pointer;
        }
      }
    }
  }
  .video-js{ /* 给.video-js设置字体大小以统一各浏览器样式表现，因为video.js采用的是em单位 */
    font-size: 14px;
  }
  .video-js button{
    outline: none;
  }
  .video-js.vjs-fluid,
  .video-js.vjs-16-9,
  .video-js.vjs-4-3{ /* 视频占满容器高度 */
    height: 100%;
    background-color: #161616;
  }
  .vjs-poster{
    background-color: #161616;
  }
  .video-js .vjs-big-play-button{ /* 中间大的播放按钮 */
    font-size: 2.5em;
    line-height: 2.3em;
    height: 2.5em;
    width: 2.5em;
    -webkit-border-radius: 2.5em;
    -moz-border-radius: 2.5em;
    border-radius: 2.5em;
    background-color: rgba(115,133,159,.5);
    border-width: 0.12em;
    margin-top: -1.25em;
    margin-left: -1.25em;
  }
  .video-js.vjs-paused .vjs-big-play-button{ /* 视频暂停时显示播放按钮 */
    display: block;
  }
  .video-js.vjs-error .vjs-big-play-button{ /* 视频加载出错时隐藏播放按钮 */
    display: none;
  }
  .vjs-loading-spinner { /* 加载圆圈 */
    font-size: 2.5em;
    width: 2em;
    height: 2em;
    border-radius: 1em;
    margin-top: -1em;
    margin-left: -1.5em;
  }
  .video-js .vjs-control-bar{ /* 控制条默认显示 */
    display: flex;
  }
  .video-js .vjs-time-control{display:block;}
  .video-js .vjs-remaining-time{display: none;}

  .vjs-button > .vjs-icon-placeholder:before{ /* 控制条所有图标，图标字体大小最好使用px单位，如果使用em，各浏览器表现可能会不大一样 */
    font-size: 22px;
    line-height: 1.9;
  }
  .video-js .vjs-playback-rate .vjs-playback-rate-value{
    line-height: 2.4;
    font-size: 18px;
  }
  /* 进度条背景色 */
  .video-js .vjs-play-progress{
    color: #ffb845;
    background-color: #ffb845;
  }
  .video-js .vjs-progress-control .vjs-mouse-display{
    background-color: #ffb845;
  }
  .vjs-mouse-display .vjs-time-tooltip{
    padding-bottom: 6px;
    background-color: #ffb845;
  }
  .video-js .vjs-play-progress .vjs-time-tooltip{
    display: none!important;
  }
</style>