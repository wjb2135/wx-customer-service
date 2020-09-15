<template>
  <!-- 编辑聊天消息 -->
  <div class="chat-edit">
    <div class="header-tool">
      <div class="edit-title">
        <span v-show="name.length>0">{{name}}：</span>
      </div>
      <!-- 工具栏 -->
      <div class="tool-bar" v-show="showType.length > 0">
        <!-- 表情包 -->
        <el-popover
          v-if="showType.includes('face')"
          placement="top-start"
          width="440"
          v-model="visible"
        >
          <emotion @emotion="handleEmotion" :height="200"></emotion>
          <span class="tool-item tool-phiz" slot="reference"></span>
        </el-popover>
        <!-- 文件夹 -->
        <span
          v-if="showType.includes('folder')"
          class="tool-item tool-folder"
          id="toolFolder"
          title="本地文件"
        >
          <input
            type="file"
            id="upLoad"
            class="input-file"
            @change="upLoad"
            ref="uploadInput"
            :accept="inputAccept"
          />
        </span>
        <!-- 截图 -->
        <span
          v-if="showType.includes('screen')"
          class="tool-item tool-screenshot"
          @click="captureScreen"
        ></span>
        <!-- 媒体 -->
        <span v-if="showType.includes('media')" class="tool-item tool-image" @click="mediaDialog"></span>
        <!-- 链接 -->
        <span v-if="showType.includes('link')" class="tool-item tool-link" @click="linkDialog"></span>
        <!-- 语音 -->
        <span
          v-if="showType.includes('voice')"
          class="tool-item tool-voice"
          @click="openRecordAudio"
        ></span>
        <!-- 模板 -->
        <span
          v-if="showType.includes('template')"
          class="tool-item tool-template"
          @click="openTemplate"
        ></span>
      </div>
    </div>
    <!-- 文本编辑 -->
    <div class="edit-bar">
      <mediaType :data="formChat" @clear="clear" @input="edit" @textareaChange="textareaChange"></mediaType>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { Popover } from 'element-ui';
import Emotion from '@/components/Emotion/index';
import mediaType from '@/components/mediaType/index';
import {mapGetters} from 'vuex'
const { ipcRenderer } = require('electron');
Vue.use(Popover);
export default {
  components: {
    Emotion,
    mediaType
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    showType: {
      type: Array,
      default: []
    },
    content: {
      type: [String, Object],
      default: ''
    },
    id: {
      type: [String, Number],
      default: ''
    }
  },
  data () {
    return {
      inputAccept:
        'application/x-zip-compressed,application/x-rar-compressed,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/*,audio/*,application/msword,application/pdf,application/vnd.ms-powerpoint,application/vnd.ms-excel,video/*',
      visible: false,
      formChat: {
        id: '',
        type: 'text',
        content: '',
        data: {}
      },
      fd: null,
      win: ''
    };
  },
  created () {
    let self = this;
    // 获取当前窗口数值
    self.win = self.$route.query.winbox;
    // 素材选择
    self.$ipcOn('radioMedia', (event, val) => {
      self.formChat = val;
      self.$emit('radioMedia', val);
    });
    // 录音
    self.$ipcOn('voiceRecord', (event, val) => {
      function dataURLtoBlob (dataurl) {
        var arr = dataurl.split(',')
        var mime = arr[0].match(/:(.*?);/)[1]
        var bstr = atob(arr[1])
        var n = bstr.length
        var u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: 'audio/amr' });
      }
      let fd = new FormData()
      let bold = dataURLtoBlob(val.data)
      let files = new File([bold], '录音文件.amr', {type: 'audio/amr', lastModified: Date.now()})
      fd.append('fileUpload', files)
      fd.append('type', 'voice')
      this.formChat.type = 'file';
      this.formChat.fileType = 'voice';
      this.formChat.content = `
          <div class="file-box mp3">
            <div class="">${files.name}</div>
          </div>`;
      this.$emit('radioMedia', {
        contentType: 'multipart/form-data',
        data: fd,
        formChat: this.formChat
      });
    });
    // 截图
    ipcRenderer.on('capture', (event, dataURL) => {
      self.formChat.type = 'image';
      self.formChat.fileType = 1;
      self.formChat.fileUpload = dataURL;
      this.$emit('radioMedia', this.formChat);
    });
    // 超链接
    this.$ipcOn('createLink', (event, msg) => {
      if (this.formChat.type === 'text') {
        this.formChat.content += `<a href="${msg.link}">${msg.name}</a>`;
      } else {
        this.formChat.content = `<a href="${msg.link}">${msg.name}</a>`;
      }
      this.formChat.id = this.id;
      this.formChat.type = msg.type;
      this.$emit('radioMedia', this.formChat);
      this.$emit('textareaChange', this.formChat);
    });
    // 模板
    self.$ipcOn('settingTemplate', (event, val) => {
      self.formChat = val;
      self.$emit('radioMedia', val.content);
    });
  },
  methods: {
    clear () {
      this.formChat = {
        type: 'text',
        content: '',
        fileType: ''
      }
    },
    /**
     * 截图
     */
    captureScreen () {
      ipcRenderer.send('capture-screen', {
        winbox: this.win
      });
    },
    getObjectURL (file) {
      var url = null;
      if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file);
      } else if (window.URL !== undefined) {
        // 仅简单的验证仅如下的浏览器支持 webkit or chrome ie11 ie10 firefox oprea
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL !== undefined) {
        // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
      }
      return url;
    },
    /**
     * 选择文件
     */
    upLoad () {
      let files = this.$refs.uploadInput.files;
      let AllUpExt = '.rar|.zip|.doc|.docx|.xls|.xlsx|.pdf|';
      let extName = files[0].name
        .substring(files[0].name.lastIndexOf('.'))
        .toLowerCase();
      let size = files[0].size;
      size = size / (1024 * 1024);

      if (AllUpExt.indexOf(extName + '|') === '-1') {
        this.$message({
          showClose: true,
          message: '文件格式不正确',
          type: 'error'
        });
        return false;
      }
      if (size > 10) {
        // 10M
        this.$message({
          showClose: true,
          message: '文件过大',
          type: 'error'
        });
        return false;
      }
      this.formChat.content = '';
      var objUrl = this.getObjectURL(files[0]);
      if (extName === '.png' || extName === '.jpg' || extName === '.gif') {
        // 图片类型
        this.formChat.fileType = 'image';
        this.formChat.content = `<img src='${objUrl}' height=80 />`;
      } else if (extName === '.mp4') {
        // 视频类型
        this.formChat.fileType = 'video';
        this.formChat.content = `
          <div class="file-box ${extName.slice(1)}">
            <div class="">${files[0].name}</div>
          </div>`;
      } else if (extName === '.mp3') {
        // 音频类型
        this.formChat.fileType = 'voice';
        this.formChat.content = `
          <div class="file-box ${extName.slice(1)}">
            <div class="">${files[0].name}</div>
          </div>`;
      } else {
        // 文档类型
        this.formChat.fileType = 'doc';
        this.formChat.content = `
          <div class="file-box ${extName.slice(1)}">
            <div class="icon-filetype ${extName.slice(1)}"></div>
            <div class="info">
              <div class="name">${files[0].name}</div>
              <div>${(files[0].size / 1024 / 1024).toFixed(3)} M</div>
            </div>
          </div>`;
      }
      this.formChat.type = 'file';
      this.formChat.fileUpload = objUrl;
      let fd = new FormData();
      fd.append('fileUpload', files[0]);
      fd.append('type', this.formChat.fileType);
      this.fd = fd;
      this.$emit('radioMedia', {
        contentType: 'multipart/form-data',
        data: this.fd,
        formChat: this.formChat
      });
    },
    /**
     * 编辑
     */
    edit (val) {
      this.formChat.content = val;
      this.formChat.type = 'text';
      this.$emit('radioMedia', this.formChat);
    },
    // blur () {
    //   this.$emit('blur', this.formChat);
    // },
    textareaChange () {
      this.formChat.type = 'text';
      this.$emit('textareaChange', this.formChat);
    },
    /**
     * 选择表情
     */
    handleEmotion (i) {
      if (this.formChat.type === 'text') {
        this.formChat.content += i;
      } else {
        this.formChat.content = i;
      }
      this.formChat.type = 'text';
      this.$emit('radioMedia', this.formChat);
      this.$emit('textareaChange', this.formChat);
    },
    /**
     * 素材弹窗
     */
    mediaDialog () {
      this.newWindows(`/dialog/media?type=show&win=` + this.win, {
        width: 660,
        height: 600
      });
    },
    /**
     * 创建链接
     */
    linkDialog () {
      this.newWindows(`session/createLink?win=` + this.win, {
        width: 400,
        height: 200
      });
    },
    /**
     * 打开录制音频面板
     */
    openRecordAudio () {
      this.newWindows(`/session/recordAudio?uid=${this.id}&win=${this.win}`, {
        width: 260,
        height: 290
      });
    },
    /**
     * 打开模板面板
     */
    openTemplate () {
      this.newWindows('/setting/template?win=' + this.win, {
        width: 820,
        height: 580
      });
    }
  },
  watch: {
    content () {
      if (this.content.weixin_template) {
        this.formChat.type = 'wxTemplate';
        this.formChat.content = this.content;
      } else {
        this.formChat.type = this.content.type;
        this.formChat.content = this.content.content;
      }
    }
  },
  computed: {
    ...mapGetters(['audio'])
  }
};
</script>

<style lang="less" scoped>
.chat-edit {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header-tool {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .edit-title {
      height: 37px;
      line-height: 37px;
    }
  }
  .tool-bar {
    height: 37px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    overflow: hidden;
    .tool-item {
      color: #88929f;
      font-family: "iconfont";
      font-size: 20px;
      margin: 0 10px;
      cursor: pointer;
    }
    .tool-folder {
      position: relative;
      .input-file {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        opacity: 0;
        overflow: hidden;
        cursor: pointer;
      }
      &:after {
        content: "\e6ce";
      }
    }
    .tool-phiz {
      &:after {
        content: "\e617";
      }
    }
    .tool-folder {
      &:after {
        content: "\e6ce";
      }
    }
    .tool-screenshot {
      &:after {
        content: "\e625";
      }
    }
    .tool-image {
      &:after {
        content: "\e889";
      }
    }
    .tool-link {
      &:after {
        content: "\e627";
      }
    }
    .tool-voice {
      &:after {
        content: "\e600";
      }
    }
    .tool-template {
      &:after {
        content: "\e6a5";
      }
    }
  }
  .edit-bar {
    height: 100%;
    flex-shrink: 1;
    overflow: hidden;
    #edit-content,
    textarea {
      width: 100%;
      border: 0;
      padding: 5px 15px;
      font-size: 16px;
      height: 100%;
    }
  }
}
</style>