<template>
  <!-- 邀请消息列表 -->
  <div class="list-invite">
    <el-collapse v-model="activeNames" accordion class="collapse-invite">
      <el-collapse-item
        :title="item.title"
        :name="item.id"
        v-for="(item,index) in inviteList"
        :key="item.id"
      >
        <template slot="title">
          <div class="invite-title">{{item.real_time}}</div>
          <div class="invite-status">
            <template v-if="item.send_status === 0">未发送</template>
            <template v-if="item.send_status === 1">已发送</template>
            <template v-if="item.send_status === 2">发送失败</template>
            {{item.title}}
          </div>
        </template>
        <div class="invite-other-info">
          <div>
            邀请客服：{{item.custom_service.nickname || item.custom_service.realname}}
            <!-- 删除 -->
            <i @click="del(item,index)" class="iconfont del-icon">&#xe69a;</i>
            <!-- 编辑 微信模板 并且邀请时间未过期-->
            <i
              v-if="item.weixin_template && !item.overtime"
              @click="edit(item)"
              class="iconfont edit-icon"
            >&#xe6ae;</i>
          </div>
          <div>接待客服：{{item.receive_custom_service && (item.receive_custom_service.nickname || item.receive_custom_service.realname) || '暂无'}}</div>
          <div>创建时间：{{item.created_at}}</div>
          <div>
            <div>
              邀请结果：
              <template v-if="item.result === 0">邀请中</template>
              <template v-if="item.result === 1">邀请成功</template>
              <template v-if="item.result === 2">邀请失败</template>
            </div>
            <div>
              <div class="invite-content">邀请内容：</div>
              <!-- 文本 -->
              <div class="text" v-if="item.content.type === 'text'" v-html="item.content.content"></div>
              <!-- 图片 -->
              <div v-if="item.content.type === 'image'" class="image-box">
                <img :src="item.content && item.content.content&& item.content.content.oss_url" alt />
              </div>
              <!-- 图文 -->
              <div v-if="item.content.type === 'imagetext'" class="pic-word">
                <div class="item">
                  <!-- 大图 -->
                  <div class="big-img" v-for="title in item.content.title_item" :key="title.id">
                    <div class="bg" :style="'background-image:url('+title.thumb_url+')'"></div>
                    <div class="footer">
                      <p v-html="title.title"></p>
                    </div>
                  </div>
                  <!-- 小图 -->
                  <div class="small-img" v-for="news in item.content.news_item" :key="news.id">
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
              <div v-if="item.content.type === 'doc'" class="doc-box">
                <div class="left" :style="'background-image:url('+item.content.content.wx_url+')'"></div>
                <div class="right">
                  <p class="name">
                    {{item.content.content.name}}
                    <span
                      v-if="!item.content.content.name.includes('.'+item.content.content.file_format)"
                    >.{{item.content.content.file_format}}</span>
                  </p>
                  <p class="size">{{item.content.content.file_size}} kb</p>
                </div>
              </div>
              <!-- 语音 -->
              <div v-if="item.content.type === 'voice'" class="voice-box">
                <div @click="playAudio(item.content.content.oss_url, item.content.content.id)">
                  <span>{{item.content.content.name}}
                    <span
                      v-if="!item.content.content.name.includes('.'+item.content.content.file_format)"
                    >.{{item.content.content.file_format}}</span>
                    </span>
                  <audio class="audio-mp3" :id="'voice'+item.content.content.id">
                    <source :src="item.content.content.oss_url" />
                  </audio>
                </div>
              </div>
              <!-- 视频 -->
              <div v-if="item.content.type === 'video'" class="video-box">
                <div>
                  <video
                    class="video-mp4"
                    :src="item.content.content.oss_url"
                    :id="'video'+item.content.content.id"
                  ></video>
                </div>
              </div>
              <!-- 微信模板 -->
              <div class="wxTemplate" v-if="item.weixin_template">
                <wx-template :list="item"></wx-template>
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Vue from 'vue';
import { Collapse, CollapseItem } from 'element-ui';
import wxTemplate from '@/components/wxTemplate';
const BenzAMRRecorder = require('benz-amr-recorder');
const { shell } = require('electron');
var amr = null; // 音频对象
window.jumpUrl = function (obj) {
  shell.openExternal(obj.href);
  return false;
};
Vue.use(Collapse);
Vue.use(CollapseItem);
export default {
  components: {
    wxTemplate
  },
  data () {
    return {
      activeNames: '',
      inviteList: []
    };
  },
  props: {
    id: {
      type: [String, Number],
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    lastOperationTime: {
      type: String,
      default: ''
    }
  },
  created () {
    this.getIndex();
    // 监听新增邀请
    this.$ipcOn('refreshInviteList', (event, val) => {
      this.getIndex();
    });
    // this.del({id: 254})
  },
  methods: {
    /**
     * 跳转链接
     */
    jumpLink (event, url) {
      event.preventDefault()
      console.log(url, 'log内容')
      shell.openExternal(url);
    },
    /**
     * 播放音频
     * @params { String } url 播放地址
     * @params { Number } id 消息ID
     */
    playAudio (url, id) {
      let self = this;
      if (self.playingVoiceId && self.playingVoiceId === id) {
        amr.stop();
        return;
      }
      amr = new BenzAMRRecorder();
      // 初始化
      amr.initWithUrl(url).then(function () {
        amr.play();
      });
      // 监听正在播放
      amr.onPlay(() => {
        self.playingVoiceId = id;
      });
      // 监听停止播放
      amr.onStop(() => {
        self.playingVoiceId = '';
        amr = null;
      });
    },
    /**
     * 微信模板编辑
     */
    edit (val) {
      // appid
      let o = {
        wxAppid: val.appid,
        clientsId: val.clients_id,
        clientsName: this.name,
        inviteId: val.id,
        realTime: val.real_time,
        title: val.title,
        templateId: val.template_id,
        receiveName:
          val.receive_custom_service &&
          (val.receive_custom_service.realname ||
            val.receive_custom_service.nickname),
        receiveId: val.receive_custom_service_id,
        lastOperationTime: this.lastOperationTime
      };
      this.newWindows(`/session/createInvite?data=${JSON.stringify(o)}`, {
        width: 570,
        height: 460
      });
    },
    /**
     * 删除
     */
    del (val, index) {
      this.$http
        .post('/res.delete', {
          id: val.id
        })
        .then(res => {
          this.$message({
            message: '删除成功',
            type: 'success'
          });
          this.inviteList.splice(index, 1);
        });
    },
    // 将匹配结果替换表情图片
    emotion (res) {
      const list = [
        '微笑',
        '撇嘴',
        '色',
        '发呆',
        '得意',
        '流泪',
        '害羞',
        '闭嘴',
        '睡',
        '大哭',
        '尴尬',
        '发怒',
        '调皮',
        '呲牙',
        '惊讶',
        '难过',
        '酷',
        '冷汗',
        '抓狂',
        '吐',
        '偷笑',
        '可爱',
        '白眼',
        '傲慢',
        '饥饿',
        '困',
        '惊恐',
        '流汗',
        '憨笑',
        '大兵',
        '奋斗',
        '咒骂',
        '疑问',
        '嘘',
        '晕',
        '折磨',
        '衰',
        '骷髅',
        '敲打',
        '再见',
        '擦汗',
        '抠鼻',
        '鼓掌',
        '糗大了',
        '坏笑',
        '左哼哼',
        '右哼哼',
        '哈欠',
        '鄙视',
        '委屈',
        '快哭了',
        '阴险',
        '亲亲',
        '吓',
        '可怜',
        '菜刀',
        '西瓜',
        '啤酒',
        '篮球',
        '乒乓',
        '咖啡',
        '饭',
        '猪头',
        '玫瑰',
        '凋谢',
        '示爱',
        '爱心',
        '心碎',
        '蛋糕',
        '闪电',
        '炸弹',
        '刀',
        '足球',
        '瓢虫',
        '便便',
        '月亮',
        '太阳',
        '礼物',
        '拥抱',
        '强',
        '弱',
        '握手',
        '胜利',
        '抱拳',
        '勾引',
        '拳头',
        '差劲',
        '爱你',
        'NO',
        'OK',
        '爱情',
        '飞吻',
        '跳跳',
        '发抖',
        '怄火',
        '转圈',
        '磕头',
        '回头',
        '跳绳',
        '挥手',
        '激动',
        '街舞',
        '献吻',
        '左太极',
        '右太极'
      ];
      let info = '';
      // 匹配表情
      let word = res.replace(/\[(\D){1,3}\]*/gi, $1 => {
        // 去掉[]
        let face = $1.replace(/\[|\]/gi, '');
        let index = list.indexOf(face);
        if (index >= 0) {
          info = `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${index}.gif" align="middle">`;
        } else {
          info = '';
        }
        return info;
      });
      return word;
    },
    /**
     * 获取邀请列表
     */
    getIndex () {
      this.inviteList = [];
      let params = {
        clients_id: this.id,
        pagesize: 0
      };
      this.$http
        .post('/res.index', params)
        .then(res => {
          this.inviteList = res.data.map(item => {
            if (item.content.type === 'text') {
              item.content.content = this.emotion(item.content.content);
              item.content.content = item.content.content.replace(/<a /g, "<a onclick='return jumpUrl(this)' ")
            } else if (item.content.type === 'imagetext') {
              let mediacontent = JSON.parse(item.content.content.media_content);
              item.content.title_item = mediacontent.news_item.splice(0, 1);
              item.content.news_item = mediacontent.news_item;
            }
            // 是否已过邀请时间
            item.overtime =
              new Date(item.real_time).getTime() - new Date().getTime() <= 0;
            return item;
          });
        })
        .catch(() => {});
    }
  },
  watch: {
    id () {
      this.getIndex();
    }
  }
};
</script>


<style lang="less">
.collapse-invite {
  &.el-collapse{
    border: 0;
  }
  .el-collapse-item {
    margin-top: 10px;
  }
  .el-collapse-item__header {
    position: relative;
    display: block;
    height: 68px;
    background-color: #f2f8ff;
    .el-collapse-item__arrow {
      position: absolute;
      top: 42px;
      right: 3px;
    }
  }
  .el-collapse-item__wrap {
    border-bottom: 0;
    background-color: #f2f8ff;
  }
  .el-collapse-item__content {
    background-color: #f2f8ff;
    padding: 0 15px 15px;
  }
  .invite-title {
    height: 32px;
    line-height: 32px;
    padding: 0 15px;
  }
  .invite-status {
    height: 34px;
    line-height: 32px;
    margin: 0 15px;
    border-top: 1px solid #fff;
  }
  .invite-other-info {
    color: @color-text-secondary;
    .del-icon,
    .edit-icon {
      font-size: 10px;
      color: @color-red;
      float: right;
      cursor: pointer;
      position: relative;
      right: -3px;
      top: 3px;
      z-index: 1;
    }
    .edit-icon {
      color: @color-primary;
      margin-right: 5px;
    }
    .invite-content {
      margin-bottom: 5px;
    }
    .text{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .image-box {
      img {
        max-width: 100%;
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
        width: 100%;
        object-fit: fill;
      }
    }
  }
}
</style>
