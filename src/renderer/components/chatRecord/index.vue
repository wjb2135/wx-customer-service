<template>
  <div class="page-chat-record">
    <div class="record-content">
      <div class="more-recode" v-if="linkDialogFlag">
        <span class="more" v-if="hasNext == 1" @click="getRecord(1)">查看更多记录</span>
        <span class="no-more" v-else >没有更多记录</span>
      </div>
      <!-- 聊天消息展示 -->
      <div class="chat-bd">
        <div class="list-chat" ref="list_chat">
          <!-- 文本消息 -->
          <div class="item-c" v-for="(item, index) in messageList" :key="index">
            <!-- "wechat_leave_message","wechat_leave_location","wechat_leave_link","wechat_leave_image","wechat_leave_voice","wechat_leave_video" -->
            <!-- 系统消息 -->
            <template v-if="item.action_id == 'wechat_system_message'">
              <div class="item-sysmsg">
                <div class="sysmsg">
                  <label>{{item.action_value.title}}</label>
                  <span>{{item.action_value.content}} {{item.created_at.slice(10, 19)}}</span>
                </div>
              </div>
            </template>
            <!-- 聊天消息 -->
            <template v-else>
              <template v-if="item.action_id == 'wechat_leave_message'">
                <wechat-leave-message :message="item" :baseUserInfo="baseUserInfo" :showType="showType"></wechat-leave-message>
              </template>
              <!-- 自己发的消息 -->
              <template v-if="(showType === 'service' || showType === 'all') && (item.custom_service_id === baseUserInfo.id)">
                <!-- 图片消息 -->
                <template v-if="item.action_id == 'wechat_leave_image'">
                  <div class="item-chat item-chat-r">
                    <div class="info">
                      <!-- <div class="name">{{item.action_value.custom_service_nickname}}</div> -->
                      <div class="msg">
                        <el-image
                          class="msg-img"
                          style="width: 100px; height: 100px"
                          :src="`${item.action_value.source_oss_url}?x-oss-process=image/resize,w_200,h_200,limit_1,m_fill`"
                          :preview-src-list="[item.action_value.source_oss_url]"
                        ></el-image>
                      </div>
                    </div>
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                  </div>
                </template>
                <!-- 链接 -->
                <template v-if="item.action_id == 'wechat_leave_link'">
                  <div class="item-chat item-chat-r">
                    <div class="info">
                      <div class="msg msg-link">
                        <div class="pic-word">
                          <div class="item">
                            <!-- 大图 -->
                            <div class="big-img" @click="jumpLink(item.action_value.link[0].url)">
                              <div
                                class="bg"
                                :style="'background-image:url('+item.action_value.link[0].picurl+')'"
                              ></div>
                              <div class="footer">
                                <p v-html="item.action_value.link[0].title"></p>
                              </div>
                            </div>
                            <div
                              class="small-img"
                              v-for="(itemLink, index) in item.action_value.link"
                              :key="index"
                            >
                              <div class="small-content" v-if="index !== 0">
                                <div class="text">
                                  <p v-html="itemLink.title"></p>
                                </div>
                                <div
                                  class="bg"
                                  :style="'background-image:url('+itemLink.picurl+')'"
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                  </div>
                </template>
                <!-- 语音 -->
                <template v-if="item.action_id == 'wechat_leave_voice'">
                  <div class="item-chat item-chat-r">
                    <div class="info">
                      <div
                        class="msg msg-voice"
                        :class="{'playing': playingVoiceId == item.id}"
                        @click="playAudio(item.action_value.source_oss_url, item.id)"
                      >
                        <span>{{item.action_value.time}}''</span>
                        <span class="icon-voice icon-voice-self"></span>
                      </div>
                    </div>
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                  </div>
                </template>
                <!-- 视频消息 -->
                <template v-if="item.action_id == 'wechat_leave_video'">
                  <div class="item-chat item-chat-r">
                    <div class="info">
                      <div
                        class="msg msg-video"
                        :style="'background-image:url(' + item.action_value.thumb_oss_url + ')'"
                        @click="openVideoPlay(item.id, item.custom_service_nickname)"
                      >
                        <div class="btn-play"></div>
                      </div>
                    </div>
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                  </div>
                </template>
                <!--模板消息 -->
                <template v-if="item.action_id == 'wechat_leave_template_message'">
                  <div class="item-chat item-chat-r">
                    <div class="info">
                      <div class="msg msg-template">
                        <wx-template :list="item.action_value"></wx-template>
                      </div>
                    </div>
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                  </div>
                </template>
              </template>
              <!-- 其他客服 -->
              <template
                v-else-if="(showType === 'service' || showType === 'all') && (item.custom_service_id > 0 && item.custom_service_id !=  baseUserInfo.id)"
              >
                <!-- 图片消息 -->
                <template v-if="item.action_id == 'wechat_leave_image'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.custom_service_nickname}}</div>
                      <div class="msg">
                        <el-image
                          class="msg-img"
                          style="width: 100px; height: 100px"
                          :src="`${item.action_value.source_oss_url}?x-oss-process=image/resize,w_200,h_200,limit_1,m_fill`"
                          :preview-src-list="[item.action_value.source_oss_url]"
                        ></el-image>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 语音 -->
                <template v-if="item.action_id == 'wechat_leave_voice'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.custom_service_nickname}}</div>
                      <div
                        class="msg msg-voice"
                        :class="{'playing': playingVoiceId == item.id}"
                        @click="playAudio(item.action_value.source_oss_url, item.id)"
                      >
                        <span class="icon-voice icon-voice-other"></span>
                        <span>{{item.action_value.time}}''</span>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 视频消息 -->
                <template v-if="item.action_id == 'wechat_leave_video'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.custom_service_nickname}}</div>
                      <div
                        class="msg msg-video"
                        :style="'background-image:url(' + item.action_value.thumb_oss_url + ')'"
                        @click="openVideoPlay(item.id, item.custom_service_nickname)"
                      >
                        <div class="btn-play"></div>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 位置 -->
                <template v-if="item.action_id == 'wechat_leave_location'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.custom_service_nickname}}</div>
                      <div class="msg">
                        <img
                          :src="item.action_value.location_img"
                          @click="jumpMap(item.action_value)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 链接 -->
                <template v-if="item.action_id == 'wechat_leave_link'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.custom_service_nickname}}</div>
                      <div class="msg msg-link">
                        <div class="pic-word">
                          <div class="item">
                            <!-- 大图 -->
                            <div class="big-img" @click="jumpLink(item.action_value.link[0].url)">
                              <div
                                class="bg"
                                :style="'background-image:url('+item.action_value.link[0].picurl+')'"
                              ></div>
                              <div class="footer">
                                <p v-html="item.action_value.link[0].title"></p>
                              </div>
                            </div>
                            <div
                              class="small-img"
                              v-for="(itemLink, index) in item.action_value.link"
                              :key="index"
                            >
                              <div
                                class="small-content"
                                v-if="index !== 0"
                                @click="jumpLink(itemLink.url)"
                              >
                                <div class="text">
                                  <p v-html="itemLink.title"></p>
                                </div>
                                <div
                                  class="bg"
                                  :style="'background-image:url('+itemLink.picurl+')'"
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <!--模板消息 -->
                <template v-if="item.action_id == 'wechat_leave_template_message'">
                  <div class="item-chat item-chat-r">
                    <div class="avatar">
                      <img :src="item.custom_service_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="msg msg-template">
                        <wx-template :list="item.action_value"></wx-template>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
              <!-- 客户发的 -->
              <template v-else-if="item.custom_service_id <= 0 && (showType === 'customer' || showType === 'all')">
                <!-- 图片消息 -->
                <template v-if="item.action_id == 'wechat_leave_image'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.clients_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.clients_nickname}}</div>
                      <div class="msg">
                        <el-image
                          class="msg-img"
                          style="width: 100px; height: 100px"
                          :src="`${item.action_value.source_oss_url}?x-oss-process=image/resize,w_200,h_200,limit_1,m_fill`"
                          :preview-src-list="[item.action_value.source_oss_url]"
                        ></el-image>
                        <!-- <img :src="`${item.action_value.source_oss_url}?x-oss-process=image/resize,w_200,h_200,limit_1,m_fill`" class="msg-img"> -->
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 语音 -->
                <template v-if="item.action_id == 'wechat_leave_voice'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.clients_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.clients_nickname}}</div>
                      <div
                        class="msg msg-voice"
                        :class="{'playing': playingVoiceId == item.id}"
                        @click="playAudio(item.action_value.source_oss_url, item.id)"
                      >
                        <span class="icon-voice icon-voice-other"></span>
                        <span>{{item.action_value.time}}''</span>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 视频消息 -->
                <template v-if="item.action_id == 'wechat_leave_video'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.clients_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.clients_nickname}}</div>
                      <div
                        class="msg msg-video"
                        :style="'background-image:url(' + item.action_value.thumb_oss_url + ')'"
                        @click="openVideoPlay(item.id, item.clients_nickname)"
                      >
                        <div class="btn-play"></div>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 位置 -->
                <template v-if="item.action_id == 'wechat_leave_location'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.clients_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.clients_nickname}}</div>
                      <div class="msg msg-map">
                        <img
                          :src="item.action_value.location_img"
                          @click="jumpMap(item.action_value)"
                          width="180"
                          height="180"
                        />
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 链接 -->
                <template v-if="item.action_id == 'wechat_leave_link'">
                  <div class="item-chat item-chat-l">
                    <div class="avatar">
                      <img :src="item.clients_avatar" alt />
                    </div>
                    <div class="info">
                      <div class="name">{{item.clients_nickname}}</div>
                      <div class="msg msg-link" @click="jumpLink(item.action_value.link[0].url)">
                        <div class="msg-link-r">
                          <img :src="item.action_value.link[0].picurl" alt />
                        </div>
                        <div class="msg-link-l">
                          <div>{{item.action_value.link[0].title}}</div>
                          <div>{{item.action_value.link[0].content}}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import wechatLeaveMessage from '@/components/session/message/wechatLeaveMessage';
import wxTemplate from '@/components/wxTemplate';
import { mapGetters } from 'vuex';
import { normalize, parser, parserWechat } from '@/utils/emoji'
const BenzAMRRecorder = require('benz-amr-recorder');
var amr = null; // 音频对象
const { shell } = require('electron');
window.jumpUrl = function (obj) {
  shell.openExternal(obj.href);
  return false;
};
export default {
  components: {
    wechatLeaveMessage,
    wxTemplate
  },
  computed: {
    ...mapGetters({
      baseUserInfo: 'baseUserInfo'
    }),
    // 会话连接
    linkDialogFlag () {
      return this.baseUserInfo.position.power.service.includes('link_dialog');
    }
  },
  props: {
    userId: {
      type: [Number, String],
      default: ''
    },
    showType: {
      type: String,
      default: 'all' // customer service all
    },
    realTime: {
      type: Boolean,
      default: true // customer service all
    }
  },
  data () {
    return {
      messageList: [],
      hasNext: 1,
      page: 1,
      pagesize: 10,
      playingVoiceId: '', // 当前播放音频的ID
      timer: null,
      messageListId: [],
      lastDate: null
    };
  },
  mounted () {
    this.getRecord();
    this.realTImeEvent()
  },
  destroyed () {
    clearTimeout(this.timer)
    this.timer = null
  },
  methods: {
    /**
     * 轮询聊天消息
    */
    moniter () {
      return this.$http.post('/moniter').then((res) => {
        let message = res.data.message
        // 客户来信息
        if (message && message.length > 0) {
          message.forEach(elMessage => {
            // 轮询消息和当前用户ID一致，则添加至聊天记录里
            if (elMessage.clients_id === this.userId) {
              // 返回聊天记录是否已存在的消息（与当前新消息相同的ID）
              let date = new Date(elMessage.created_at.replace(/-/g, '/')).getTime()
              if (!this.messageListId.includes(elMessage.id) && date > this.lastDate) {
                this.messageList.push(elMessage)
                this.messageListId.push(elMessage.id)
                this.scrollToBottom()
              } else {}
            }
          });
        }
      }).catch(() => {})
    },
    /**
     * 滚动至最新消息
     */
    scrollToBottom () {
      this.$nextTick(() => {
        let listEl = document.querySelector('.record-content')
        if (listEl) {
          listEl.scrollTop = listEl.scrollHeight
        }
      })
    },
    /**
     * 播放视频
     * @params { Number } id 用户ID
     * @params { String } uname 用户名
     */
    openVideoPlay (id, uname) {
      this.newWindows('/session/playVideo?id=' + id + '&uname=' + uname, {
        width: 500,
        height: 405,
        minWidth: 500,
        minHeight: 405,
        resizable: false,
        frame: false
      });
    },
    /**
     * 跳转链接
     */
    jumpLink (url) {
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
     * 跳转至百度地图
     * @params { Object } item 地理位置信息
     */
    jumpMap (item) {
      shell.openExternal(`https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&pointx=${item.location_x}&pointy=${item.location_y}&addr=${item.label}&uid=11587463742936542770&ref=pcmap`);
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
    getRecord (page) {
      // 会话连接权限
      if (!this.linkDialogFlag) {
        return false;
      }
      if (this.hasNext !== 1) {
        return;
      }
      this.page = page ? ++this.page : 1;
      let params = {
        id: this.userId,
        page: this.page,
        pagesize: this.pagesize
      };
      return this.$http.post('/weixin.getmessage', params).then(res => {
        let list = res.data.list.map(item => {
          this.messageListId.push(item.id)
          if (item.action_id === 'wechat_leave_message') {
            // 解析emoji表情
            item.action_value.content = parser(item.action_value.content)
            item.action_value.content = parserWechat(item.action_value.content)
            // 替换链接，改成外部浏览器打开
            item.action_value.content = item.action_value.content.replace(/<a /g, '<a onclick=\'return jumpUrl(this)\' ')
          } else if (item.action_id === 'wechat_leave_location') {
            // 位置消息
            // 图片展示规格
            item.action_value.location_img = `https://st.map.qq.com/api?size=180*180&center=${item.action_value.location_y}%2C${item.action_value.location_x}&zoom=15&markers=${item.action_value.location_y}%2C${item.action_value.location_x}`
          }
          return item;
        });
        this.messageList = list.concat(this.messageList);
        let date = new Date(this.messageList[this.messageList.length - 1].created_at.replace(/-/g, '/'))
        this.lastDate = date.getTime()
        this.hasNext = res.data.has_next;
        if (!page) {
          this.scrollToBottom()
        }
      });
    },
    realTImeEvent () {
      // 会话连接权限
      if (!this.linkDialogFlag) {
        return false;
      }
      // 关闭实时
      if (this.realTime) {
        clearTimeout(this.timer)
      } else {
      // 开启实时
        this.timer = setTimeout(async () => {
          if (this.messageList.length > 0) {
            await this.moniter()
            this.realTImeEvent()
          }
        }, 3000)
      }
    },
    clearRecord () {
      this.page = 0;
      this.messageList = [];
      this.messageListId = [];
      this.hasNext = 1;
    }
  },
  watch: {
    userId () {
      this.page = 1;
      this.messageList = [];
      this.messageListId = []
      this.hasNext = 1;
      this.getRecord();
    },
    realTime () {
      this.realTImeEvent()
    }
  }
};
</script>

<style lang="less" scoped>
.page-chat-record {
  height: 100%;
  width: 100%;
  .record-content {
    padding: 15px;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .more-recode {
    position: relative;
    text-align: center;
    span {
      position: relative;
      z-index: 2;
      width: auto;
      display: inline-block;
      font-size: @font-size-base;
      line-height: 19px;
      padding: 0 5px;
      &.more {
        color: @color-primary;
      }
      &.no-more {
        color: #aeb8c4;
        &::after {
          content: "";
          position: absolute;
          z-index: -1;
          top: 0;
          left: 0;
          width: 100%;
          background-color: #f9fafa;
          height: 100%;
          border-radius: @border-radius-small;
        }
        &::before {
          content: "";
          position: absolute;
          z-index: -2;
          left: -9px;
          right: -9px;
          background-color: @color-white;
          height: 100%;
        }
      }
    }
  }
  .service {
    color: #24272b;
  }
  .item-sysmsg {
    display: flex;
    justify-content: center;
    margin-top: 25px;
    .sysmsg {
      background-color: #e7e9ec;
      color: @color-text-secondary;
      border-radius: 15px;
      width: max-content;
      max-width: 95%;
      text-align: left;
      margin: 0 auto;
      padding: 5px 20px;
      label {
        color: @color-primary;
      }
    }
  }
  .item-chat {
    margin-top: 25px;
    display: flex;
    .avatar {
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      img {
        width: 100%;
        height: 100%;
        border-radius: 100%;
      }
    }
    .info {
      margin-left: 15px;
      .name {
        line-height: 1;
        color: @color-text-secondary;
        margin-top: 3px;
      }
      .msg {
        line-height: 1.5;
        padding: 15px;
        margin-top: 10px;
        max-width: 400px;
        border-radius: 5px;
        border-top-left-radius: 0;
        word-break: break-all;
        &.msg-link {
          display: flex;
          cursor: pointer;
          .msg-link-l {
            min-width: 120px;
            margin-right: 20px;
          }
          .msg-link-r {
            img {
              display: block;
            }
          }
        }
        &.msg-voice {
          width: 150px;
          height: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          line-height: 1;
          cursor: pointer;
          font-size: 16px;
          .icon-voice {
            width: 14px;
            height: 20px;
            display: block;
            &.icon-voice-self {
              background: url("../../assets/images/session/icon-voice-self.png")
                no-repeat;
            }
            &.icon-voice-other {
              background: url("../../assets/images/session/icon-voice-other.png")
                no-repeat;
            }
          }

          &.playing {
            .icon-voice-self {
              background: url("../../assets/images/session/icon-voice-self.gif")
                no-repeat;
            }
            .icon-voice-other {
              background: url("../../assets/images/session/icon-voice-other.gif")
                no-repeat;
            }
          }
        }
        &.msg-video {
          background-repeat: no-repeat;
          background-size: cover;
          width: 150px;
          height: 250px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          .btn-play {
            width: 40px;
            height: 40px;
            border-radius: 40px;
            border: 1px solid #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            &:after {
              content: "\e60f";
              font-family: "iconfont";
              color: #fff;
              font-size: 20px;
              line-height: 1;
              display: block;
            }
          }
        }
      }
    }
    &.item-chat-l {
      justify-content: flex-start;
      .info {
        margin-left: 15px;
      }
      .msg {
        background-color: #f7f9f9;
        border-top-left-radius: 0;
        word-break: break-all;
      }
      .msg-link {
        .msg-link-l {
          margin: 0;
          margin-left: 20px;
        }
      }
    }
    &.item-chat-r {
      justify-content: flex-end;
      .name {
        text-align: right;
      }
      .info {
        margin-right: 15px;
      }
      .msg {
        background-color: #f1f8ff;
        border-top-right-radius: 0;
        margin-top: 3px;
        word-break: break-all;
      }
    }
  }
}
</style>