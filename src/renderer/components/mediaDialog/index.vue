<template>
  <div class="dialog-media-material">
    <Dialog title="媒体素材选择" :before-close="handleClose">
      <div class="content">
        <!-- head -->
        <div class="head">
          <div class="left">
            <el-select v-model="account" placeholder="请选择" size="mini">
              <el-option
                v-for="item in weixinAccount"
                :key="item.appid"
                :label="item.nick_name"
                :value="item.appid"
              ></el-option>
            </el-select>
          </div>
          <!-- tabs -->
          <div class="right">
            <ul>
              <li
                :class="nowTab == item.value? 'active':''"
                @click="changeTab(item.value)"
                v-for="item in tabs"
                :key="item.value"
              >{{item.label}}</li>
            </ul>
          </div>
        </div>
        <!-- body -->
        <div class="body">
          <!-- left-tabs -->
          <div class="left">
            <ul>
              <li
                @click="changeLeftTabs(item.value)"
                :class="nowLeftTab == item.value? 'active':''"
                v-for="item in leftTabs"
                :key="item.value"
              >{{item.label}}</li>
            </ul>
          </div>
          <div class="right">
            <div class="main">
              <!-- 图片 -->
              <div class="pic" v-show="nowTab == 'image'">
                <div
                  class="item"
                  :class="selectids.includes(item.id)?'active':''"
                  @click="selectEvent(item)"
                  v-for="item in imageArr"
                  :key="'pic'+item.id"
                >
                  <div class="bg" :style="'background-image:url('+item.oss_url+')'"></div>
                  <div class="footer">
                    <p>{{item.name}}</p>
                  </div>
                  <div class="icon-box">
                    <i class="iconfont">&#xe643;</i>
                  </div>
                </div>
              </div>
              <!-- 图片 -->

              <!-- 图文 -->
              <div class="pic-word" v-show="nowTab == 'imagetext'">
                <div
                  class="item"
                  :class="selectids.includes(item.id)?'active':''"
                  @click="selectEvent(item)"
                  v-for="item in imagetextArr"
                  :key="'pic-word'+item.id"
                >
                  <!-- 大图 -->
                  <div
                    class="big-img"
                    v-for="title in item.media_content.title_item"
                    :key="title.id"
                  >
                    <div class="bg" :style="'background-image:url('+title.thumb_url+')'"></div>
                    <div class="footer">
                      <p class="big-img-title" v-html="title.title"></p>
                    </div>
                  </div>
                  <!-- 小图 -->
                  <div
                    class="small-img"
                    v-for="news in item.media_content.news_item"
                    :key="news.id"
                  >
                    <div class="small-content">
                      <div class="text">
                        <p v-html="news.title"></p>
                      </div>
                      <div class="bg" :style="'background-image:url('+news.thumb_url+')'"></div>
                    </div>
                  </div>
                  <div class="icon-box">
                    <i class="iconfont">&#xe643;</i>
                  </div>
                </div>
              </div>
              <!-- 图文 -->

              <!-- 文件 -->
              <div class="file" v-show="nowTab == 'doc'">
                <div
                  class="item"
                  :class="selectids.includes(item.id)?'active':''"
                  @click="selectEvent(item)"
                  v-for="item in docArr"
                  :key="'file'+item.id"
                >
                  <div class="left" :style="'background-image:url('+item.wx_url+')'"></div>
                  <div class="right">
                    <p class="name">{{item.name}}.{{item.file_format}}</p>
                    <p class="size">{{item.file_size}} kb</p>
                    <div class="icon-box">
                      <i class="iconfont">&#xe643;</i>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 文件 -->

              <!-- 语音 -->
              <div class="voice" v-show="nowTab == 'voice'">
                <div class="operate">
                  <el-button type="primary" size="mini" :disabled="isManage === 0">上传语音</el-button>
                  <el-button type="primary" size="mini" :disabled="isManage === 0">录音</el-button>
                </div>
                <div class="voice-table">
                  <el-table
                    stripe
                    :data="voiceArr"
                    highlight-current-row
                    tooltip-effect="dark"
                    class="fw-table visitor-table"
                    size="mini"
                    @selection-change="handleSelectionChange"
                    @current-change="handleCurrentChange"
                  >
                    <el-table-column type="selection" width="55" v-if="type === ''"></el-table-column>
                    <el-table-column label="语音名称">
                      <template slot-scope="scope">{{scope.row.name}}.{{scope.row.file_format}}</template>
                    </el-table-column>
                    <el-table-column label="播放" align="center" width="50">
                      <template slot-scope="scope">
                        <audio class="audio-mp3" :id="'voice'+scope.row.id">
                          <source :src="scope.row.oss_url" />
                        </audio>
                        <i
                          class="iconfont voice-icon"
                          @click="voicePause(scope.row.id)"
                          v-if="nowVoicePlayid === scope.row.id"
                        >&#xe6e0;</i>
                        <i
                          class="iconfont voice-icon"
                          @click="voicePlay(scope.row.id)"
                          v-else
                        >&#xe6de;</i>
                      </template>
                    </el-table-column>
                    <!-- <el-table-column label="删除" align="center" width="50">
                      <template slot-scope="scope">
                        <i
                          class="iconfont voice-icon"
                          :class="isManage === 0?'disabled':''"
                          @click="del(scope.row.id)"
                        >&#xe69a;</i>
                      </template>
                    </el-table-column>-->
                    <!-- <el-table-column label="修改" align="center" width="50">
                      <template slot-scope="scope">
                        <i
                          class="iconfont voice-icon"
                          :class="isManage === 0?'disabled':''"
                          @click="edit(scope.row.id)"
                        >&#xe6df;</i>
                      </template>
                    </el-table-column>-->
                    <el-table-column label="下载" align="center" width="50">
                      <template slot-scope="scope">
                        <i class="iconfont voice-icon" @click="download(scope.row)">&#xe6dd;</i>
                      </template>
                    </el-table-column>
                    <el-table-column label="时长" width="100" align="center">
                      <template slot-scope="scope">{{scope.row.file_time}} 秒</template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
              <!-- 语音 -->

              <!-- 视频 -->
              <div class="video" v-show="nowTab == 'video'">
                <div
                  class="item"
                  :class="selectids.includes(item.id)?'active':''"
                  v-for="item in videoArr"
                  :key="'video'+item.id"
                  @click="selectEvent(item)"
                >
                  <video class="video-mp4" :src="item.oss_url" :id="'video'+item.id"></video>
                  <div class="footer">
                    <p>{{item.name}}</p>
                    <span @click="videoPause(item.id)" v-if="nowVideoPlayid === item.id">暂停</span>
                    <span @click="videoPlay(item.id)" v-else>播放</span>
                  </div>
                  <div class="icon-box">
                    <i class="iconfont">&#xe643;</i>
                  </div>
                </div>
              </div>
              <!-- 视频 -->
            </div>
            <div class="page">
              <el-pagination
                :current-page.sync="currentPage"
                :page-size="100"
                layout="prev, pager, next,total"
                :total="50"
              ></el-pagination>
              <el-button type="primary" @click="submit" size="mini">确 定</el-button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog';
const { ipcRenderer } = require('electron');
export default {
  components: {
    Dialog
  },
  data () {
    return {
      // type 类型
      type: '',
      // type 为show 时候选中的数据
      radioData: {},
      // 图片
      imageArr: [],
      // 图文
      imagetextArr: [],
      // 文件
      docArr: [],
      // 语音
      voiceArr: [],
      // 视频
      videoArr: [],
      // 选中的id
      selectids: [],
      // 素材类型
      tabs: [
        {
          label: '图片',
          value: 'image'
        },
        {
          label: '图文',
          value: 'imagetext'
        },
        {
          label: '文件',
          value: 'doc'
        },
        {
          label: '语音',
          value: 'voice'
        },
        {
          label: '视频',
          value: 'video'
        }
      ],
      // 素材分组
      leftTabs: [],
      // 当前分组
      nowLeftTab: '',
      // 当前类型
      nowTab: 'image',
      // 当前页数
      currentPage: 1,
      // 当前微信公众号
      account: '',
      // 公众号列表
      weixinAccount: [],
      // 是否为管理员
      isManage: '',
      nowVoicePlayid: '',
      nowVideoPlayid: '',
      win: ''
    };
  },
  async created () {
    /**
     * @params type
     * @value show 单选 + 展示
     */
    this.type = this.$route.query.type || '';
    this.win = this.$route.query.win || '';
    // 获取公众号列表
    this.weixinAccount =
      this.$store.state.user.baseUserInfo.weixin_account || [];
    this.account = this.weixinAccount[0].appid;
    this.isManage = this.$store.state.user.baseUserInfo.is_manage;
    await this.getWxsourceGroup();
    this.getWxsource();
  },
  methods: {
    /**
     * 语音的多选
     */
    handleSelectionChange (val) {
      this.selectids = val.map(item => {
        return item.id;
      });
    },
    /**
     * 语音的单选
     */
    handleCurrentChange (val) {
      this.radioData = val;
      this.selectids = [];
      this.selectids.push(val.id);
    },
    /**
     * 视频播放
     */
    videoPlay (id) {
      this.nowVideoPlayid = id;
      document.getElementById('video' + id).play();
      let videoMp4 = document.getElementsByClassName('video-mp4');
      Array.prototype.slice.call(videoMp4).forEach(item => {
        // 暂停
        item.pause();
      });
      // 当前视频对象
      let nowVideo = document.getElementById('video' + id);
      nowVideo.play();
      nowVideo.addEventListener('ended', () => {
        this.nowVideoPlayid = '';
        nowVideo.currentTime = 0;
      });
    },
    /**
     * 视频暂停
     */
    videoPause (id) {
      this.nowVideoPlayid = '';
      document.getElementById('video' + id).pause();
    },
    /**
     * 素材选中
     */
    selectEvent (val) {
      let id = val.id;
      if (this.type === 'show') {
        if (!this.selectids.includes(id)) {
          this.selectids = [];
          this.selectids.push(id);
          this.radioData = val;
        } else {
          this.selectids.splice(this.selectids.indexOf(id), 1);
          this.radioData = {};
        }
      } else {
        if (!this.selectids.includes(id)) {
          this.selectids.push(id);
        } else {
          this.selectids.splice(this.selectids.indexOf(id), 1);
        }
      }
    },
    /**
     * 获取分组
     */
    getWxsourceGroup () {
      this.selectids = [];
      let params = {
        type: this.nowTab,
        appid: this.account
      };
      return this.$http
        .post('/cs.get_wxsource_group', params)
        .then(res => {
          this.leftTabs = [];
          if (res.data && res.data.length > 0) {
            this.nowLeftTab = res.data[0].id;
            res.data.forEach(item => {
              this.leftTabs.push({
                label: `${item.name}(${item.num})`,
                value: item.id
              });
            });
          }
        })
        .catch(() => {});
    },
    /**
     * 获取素材
     */
    getWxsource () {
      this.selectids = [];
      let params = {
        type: this.nowTab,
        appid: this.account,
        source_group_id: this.nowLeftTab
      };
      this.$http
        .post('/cs.get_wxsource', params)
        .then(res => {
          this[this.nowTab + 'Arr'] = res.data;
          // 图文类型时候特殊处理数据
          if (this.nowTab === 'imagetext') {
            this[this.nowTab + 'Arr'] = res.data.map(item => {
              let mediacontent = JSON.parse(item.media_content);
              item.media_content = mediacontent;
              item.media_content.title_item = mediacontent.news_item.splice(
                0,
                1
              );
              item.media_content.news_item = mediacontent.news_item;
              return item;
            });
          }
        })
        .catch(() => {
          this[this.nowTab + 'Arr'] = [];
        });
    },
    /**
     * mp3播放
     */
    voicePlay (id) {
      this.nowVoicePlayid = id;
      let audioMp3 = document.getElementsByClassName('audio-mp3');
      Array.prototype.slice.call(audioMp3).forEach(item => {
        // 暂停 播放位置为最开始
        item.pause();
        // item.currentTime = 0;
      });
      // 当前音频对象
      let nowAudio = document.getElementById('voice' + id);
      nowAudio.play();
      nowAudio.addEventListener('ended', () => {
        this.nowVoicePlayid = '';
      });
    },
    /**
     * mp3暂停
     */
    voicePause (id) {
      this.nowVoicePlayid = '';
      document.getElementById('voice' + id).pause();
    },
    /**
     * 删除
     */
    del () {},
    /**
     * 编辑
     */
    edit () {},
    /**
     * 下载
     */
    download (voice) {
      ipcRenderer.send('download', voice.oss_url);
    },
    /**
     * 切换素材类型
     */
    async changeTab (val) {
      this.nowTab = val;
      await this.getWxsourceGroup();
      this.getWxsource();
    },
    /**
     * 切换素材分组
     */
    changeLeftTabs (val) {
      this.nowLeftTab = val;
      this.getWxsource();
    },
    handleClose (done) {
      done();
    },
    submit () {
      if (this.type === 'show') {
        let params = {
          type: this.nowTab,
          source_id: this.selectids,
          data: this.radioData
        };
        if (this.win) {
          params.winbox = this.win;
        }
        this.$ipcSend('radioMedia', params);
      } else {
        let params = {
          id: this.$route.query.u_id,
          type: this.nowTab,
          source_id: this.selectids
        };
        ipcRenderer.send('confirmMedia', params);
      }
      this.$Win.closeWin();
    }
  }
};
</script>
<style lang="less">
.dialog-media-material {
  .dialog__wrapper {
    height: 100%;
    .dialog {
      height: 100%;
      .dialog__body {
        height: calc(100% - 40px);
        padding: 0;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.dialog-media-material {
  height: 100%;
  .content {
    height: 100%;
    .head {
      display: flex;
      height: 50px;
      align-items: center;
      .left {
        flex: 0 0 165px;
        width: 165px;
        padding: 10px;
        border-right: 1px solid @border-color;
      }
      .right {
        flex: 1 1 auto;
        border-bottom: 1px solid @border-color;
        ul {
          padding-left: 40px;
          li {
            height: 50px;
            line-height: 50px;
            display: inline-block;
            margin-right: 40px;
            border-bottom: 2px solid transparent;
            font-size: @font-size-base;
            color: #24272b;
            cursor: pointer;
            &.active {
              border-bottom: 2px solid @color-primary;
              color: @color-primary;
            }
          }
        }
      }
    }
    .body {
      height: calc(100% - 50px);
      display: flex;
      .left {
        height: 100%;
        width: 165px;
        flex: 0 0 165px;
        border-right: 1px solid @border-color;
        ul {
          li {
            line-height: 44px;
            height: 44px;
            border-left: 2px solid transparent;
            color: #24272b;
            font-size: @font-size-base;
            text-align: left;
            padding-left: 30px;
            cursor: pointer;
            &.active {
              border-left: 2px solid @color-primary;
              background-color: #f1f8ff;
            }
            &:hover {
              background-color: #f7f9f9;
            }
          }
        }
      }
      .right {
        height: 100%;
        flex: 1 1 auto;
        .main {
          height: calc(100% - 50px);
          overflow-y: auto;
          // 视频

          // 语音
          .voice {
            height: 100%;
            .operate {
              padding: 10px 16px;
              border-bottom: 1px solid @border-color;
            }
            .voice-table {
              height: calc(100% - 49px);
            }
            .voice-icon {
              color: #090a0a;
              cursor: pointer;
              &.disabled {
                cursor: default;
              }
            }
            .audio-mp3 {
              visibility: hidden;
              width: 0;
              height: 0;
            }
          }
          // 文件
          .file {
            display: flex;
            flex-wrap: wrap;
            padding: 16px 16px 16px 5px;
            font-size: 0;
            .item {
              flex: 0 0 50%;
              width: 50%;
              padding-left: 11px;
              cursor: pointer;
              position: relative;
              display: flex;
              height: 50px;
              margin-bottom: 10px;
              .left {
                flex: 0 0 50px;
                background-color: #fff;
                background-repeat: no-repeat;
                background-size: 100%;
              }
              .right {
                flex: 1 1 auto;
                padding: 5px 25px 5px 10px;
                background-color: #f7f9f9;
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
                .size {
                }
              }

              .icon-box {
                top: 5px;
                right: 5px;
                position: absolute;
                background-color: rgba(0, 0, 0, 0.3);
                width: 20px;
                height: 20px;
                border-radius: 100%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                  color: @color-white;
                  font-size: @font-size-smaller;
                }
              }
              &.active {
                .icon-box {
                  background-color: @color-primary;
                }
              }
            }
          }
          // 图片、图文
          .pic,
          .pic-word,
          .video {
            display: flex;
            flex-wrap: wrap;
            padding: 16px 16px 16px 6px;
            font-size: 0;
            .item {
              flex: 0 0 33.33%;
              width: 33.33%;
              padding-left: 10px;
              margin-bottom: 10px;
              cursor: pointer;
              position: relative;
              .icon-box {
                top: 5px;
                right: 5px;
                position: absolute;
                background-color: rgba(0, 0, 0, 0.3);
                width: 20px;
                height: 20px;
                border-radius: 100%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                i {
                  color: @color-white;
                  font-size: @font-size-smaller;
                }
              }
              &.active {
                .icon-box {
                  background-color: @color-primary;
                }
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
                  -webkit-line-clamp: 2;
                  line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
              }
              img {
                width: 100%;
                height: 100px;
              }
              .bg {
                height: 100px;
                background-repeat: no-repeat;
                background-size: auto 100%;
                background-position: center;
              }
            }
          }
          .video {
            video {
              width: 100%;
              height: 110px;
              object-fit: fill;
            }
            .footer {
              display: flex;
              p {
                flex: 1 1 auto;
                overflow: hidden;
                line-height: 20px;
                height: 20px;
                display: unset !important;
                -webkit-line-clamp: unset !important;
                line-clamp: unset !important;
                -webkit-box-orient: unset !important;
              }
              span {
                flex: 0 0 28px;
                color: @color-primary;
                text-decoration: underline @color-primary;
              }
            }
          }
          .pic-word {
            flex-flow: row wrap;
            align-content: flex-start;
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
                .big-img-title {
                  -webkit-line-clamp: 1;
                  line-clamp: 1;
                }
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
                    text-overflow: -o-ellipsis-lastline;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                    -webkit-box-orient: vertical;
                  }
                }
                .bg {
                  flex: 0 0 50px;
                  height: 50px;
                }
              }
            }
          }
        }
        .page {
          height: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid @border-color;
          padding-right: 16px;
        }
      }
    }
  }
}
</style>