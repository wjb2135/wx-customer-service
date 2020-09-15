<template>
  <div class="media-type">
    <!-- 文本 -->
    <!-- {{media}} -->
    <!-- {{media.type}} -->
    <div v-if="media.type === 'text'" class="textarea-box">
      <textarea
        :disabled ="!editAble"
        v-model="media.content"
        @input="edit"
        name
        id
        cols="30"
        rows="10"
        @change="textareaChange"
      ></textarea>
    </div>
    <div v-else class="media-box" @keydown.8="clear" :tabindex="(media.type !== 'wxTemplate' && clearAble)?0:''">
      <!-- 选中的文件 -->
      <div class v-if="media.type === 'file'" v-html="media.content"></div>
      <!-- 图片 -->
      <div v-if="media.type === 'image'" class="image-box">
        <img :src="media.data.oss_url || media.fileUpload" alt />
      </div>
      <!-- 图文 -->
      <div v-if="media.type === 'imagetext'" class="pic-word">
        <div class="item">
          <!-- 大图 -->
          <div class="big-img" v-for="title in media.data.media_content.title_item" :key="title.id">
            <div class="bg" :style="'background-image:url('+title.thumb_url+')'"></div>
            <div class="footer">
              <p v-html="title.title"></p>
            </div>
          </div>
          <!-- 小图 -->
          <div class="small-img" v-for="news in media.data.media_content.news_item" :key="news.id">
            <div class="small-content">
              <div class="text">
                <p v-html="news.title"></p>
              </div>
              <div class="bg" :style="'background-image:url('+news.thumb_url+')'"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 文件 -->
      <div v-if="media.type === 'doc'" class="doc-box">
        <div class="left" :style="'background-image:url('+media.data.wx_url+')'"></div>
        <div class="right">
          <p class="name">{{media.data.name}}
            <template v-if="!media.data.name.includes('.' + media.data.file_format)">
              .{{media.data.file_format}}
            </template>
          </p>
          <p class="size">{{media.data.file_size}} kb</p>
        </div>
      </div>
      <!-- 语音 -->
      <div v-if="media.type === 'voice'" class="voice-box">
        <div>
          <span>
            {{media.data.name}}
            <template v-if="!media.data.name.includes('.' + media.data.file_format)">
              .{{media.data.file_format}}
            </template>
          </span>
          <audio class="audio-mp3" :id="'voice'+media.data.id">
            <source :src="media.data.oss_url" />
          </audio>
        </div>
      </div>
      <!-- 视频 -->
      <div v-if="media.type === 'video'" class="video-box">
        <div>
          <video class="video-mp4" :src="media.data.oss_url" :id="'video'+media.data.id"></video>
        </div>
      </div>
      <!-- 微信模板 -->
      <div v-if="media.type === 'wxTemplate'" class="wxTemplate-box">
        <wx-template :list="media.content"></wx-template>
      </div>
    </div>
  </div>
</template>

<script>
import wxTemplate from '@/components/wxTemplate';
export default {
  components: {
    wxTemplate
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {}
      }
    },
    clearAble: {
      type: Boolean,
      default: true
    },
    editAble: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      media: {}
    };
  },
  created () {
    this.media = this.data
    if (this.media.content) {
      this.media.data = this.media.content
      if (this.media.data.media_content) {
        this.media.data.data = this.media.data.media_content
      }
    }
  },
  methods: {
    clear () {
      if (this.media.type !== 'wxTemplate') {
        this.media = {
          type: 'text',
          content: ''
        }
        this.$emit('clear')
      }
    },
    edit () {
      this.$emit('input', this.media.content);
    },
    blur () {
      this.$emit('blur', this.media.content);
    },
    textareaChange () {
      this.$emit('textareaChange', this.media.content);
    }
  },
  watch: {
    data: {
      handler () {
        this.media = this.data
        if (this.media.content) {
          this.media.data = this.media.content
          if (this.media.data.media_content) {
            this.media.data.data = this.media.data.media_content
          }
          // console.log(this.media.data.media_content)
          // console.log(this.media.data)
          // console.log(this.media.type, JSON.parse(this.media.data.media_content))
        }
      },
      deep: true
    }
    // data () {
    //   this.media = this.data;
    //   console.log(this.media, 'media');
    // }
  }
};
</script>
<style lang="less">
.media-type {
  .file-box {
    width: 200px;
    height: 50px;
    border: 1px solid @border-color;
    display: flex;
    align-items: center;
    float: left;
    .icon-filetype {
      width: 50px;
      height: 50px;
      flex: 0 0 50px;
      background-color: #f2f2f2;
      &.doc,
      &.docx {
        background: url(../../assets/images/session/file-type-doc.png);
      }
      &.ppt {
        background: url(../../assets/images/session/file-type-ppt.png);
      }
      &.pdf {
        background: url(../../assets/images/session/file-type-pdf.png);
      }
      &.xlsx,
      &.xls {
        background: url(../../assets/images/session/file-type-xlsx.png);
      }
    }
    .info {
      font-size: 12px;
      height: 100%;
      flex: 0 0 150px;
      width: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      text-align: left;
      padding-left: 10px;
      .name{
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
      }
    }
    &.mp4,
    &.mp3 {
      padding: 15px;
    }
  }
}
</style>
<style lang="less" scoped>
.media-type {
  height: 100%;
  .textarea-box {
    height: 100%;
    textarea {
      height: 100%;
      width: 100%;
      border: 1px solid @border-color;
      padding: 10px;
      &:disabled{
        background-color: #fff;
      }
    }
  }
  .image-box {
    img {
      max-width: 150px;
      max-height: 100%;
    }
  }
  .pic-word {
    flex-flow: row wrap;
    align-content: flex-start;
    width: 150px;
    .bg {
      height: 100px;
      background-repeat: no-repeat;
      background-size: auto 100%;
      background-position: center;
    }
    .footer {
      text-align: center;
      font-size: @font-size-base;
      color: #24272b;
      padding: 5px 0;
      p {
        line-height: 20px;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
      }
    }
    .big-img {
      position: relative;
      border: 1px solid @border-color;
      border-bottom: none;
      .footer {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 30px;
        width: 100%;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.6);
      }
    }
    .small-img {
      border: 1px solid @border-color;
      border-top: none;
      .small-content {
        display: flex;
        .text {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          padding-left: 10px;
          p {
            font-size: 12px;
            line-height: 14px;
          }
        }
        .bg {
          flex: 0 0 50px;
          height: 50px;
        }
      }
    }
  }
  .doc-box {
    display: flex;
    cursor: pointer;
    .left {
      flex: 0 0 50px;
      background-color: #fff;
      background-repeat: no-repeat;
      background-size: 100%;
    }
    .right {
      flex: 1 1 auto;
      padding: 5px 25px 5px 10px;
      overflow: hidden;
      .name,
      .size {
        font-size: @font-size-base;
        line-height: 20px;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #24272b;
      }
    }
  }
  .voice-box {
  }
  .video-box {
    video {
      max-width: 100px;
      max-height: 100%;
      object-fit: fill;
    }
  }
  .media-box {
    height: 100%;
    width: 100%;
    padding: 10px;
    border: 1px solid @border-color;
    overflow: auto;
  }
}
</style>