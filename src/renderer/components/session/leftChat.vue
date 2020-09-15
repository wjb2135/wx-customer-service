<template>
  <!-- 左侧聊天面板（聊天窗） -->
  <div class="chat">
    <!-- 聊天标题栏 -->
    <div class="chat-hd">
      <div class="chat-hd-l">
        <div class="title">
          <span class="title-l">{{userInfo.nickname}}</span>
          <span class="title-r">
            <i class="icon iconfont icon-sex">
              <template v-if="userInfo.sex == 1">&#xe6db;</template>
              <template v-else>&#xe6dc;</template>
            </i>
            <span class="type">{{userInfo.user_status}}</span>
          </span>
        </div>
        <div
          class="sub-title"
        >{{userInfo.weixin_account_name}} / 上次接待客服:{{userInfo.last_custom_service && userInfo.last_custom_service.nickname || '无'}}</div>
      </div>
      <div class="chat-hd-r">
        <div class="op-bar">
          <!-- 发起协作 -->
          <span class="i-op" @click="openWinSessionChooseKf">
            <i class="icon iconfont">&#xe7da;</i>
          </span>
          <el-popover
            placement="bottom-end"
            title
            width="400"
            trigger="click"
            class="i-op"
            v-model="remarkVisible"
          >
            <!-- 会话备注 -->
            <set-session-remark
              v-if="userInfo"
              :userInfo="userInfo"
              :selectTags="selectTags"
              @hide="hideRemarkVisible"
            ></set-session-remark>
            <span class slot="reference">
              <i class="icon iconfont">&#xe6b4;</i>
            </span>
          </el-popover>
          <el-dropdown class="i-op" trigger="click" @command="handleCommand">
            <span class>
              <i class="icon iconfont">&#xe60c;</i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="0">转接</el-dropdown-item>
              <el-dropdown-item command="1">关闭</el-dropdown-item>
              <el-dropdown-item command="2">退回</el-dropdown-item>
              <el-dropdown-item command="3">预约</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <!-- 聊天消息展示 -->
    <div class="chat-bd">
      <div class="chat-tip" v-if="userInfo == ''">
        <div class="chat-tip-title">使用小技巧</div>
        <div class="chat-tip-info">轮询分配适合访客量不大的营销型企业</div>
      </div>
      <div class="list-chat" ref="list_chat" v-else>
        <!-- 文本消息 -->
        <span class="load-more-msg end" v-if="loadEnd">没有更多记录</span>
        <span class="load-more-msg" @click="loadMoreMsg" v-else>查看更多消息</span>
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
              <wechat-leave-message :message="item" :baseUserInfo="baseUserInfo"></wechat-leave-message>
            </template>
            <!-- 自己发的消息 -->
            <template v-if="item.custom_service_id === baseUserInfo.id">
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
                          <div class="big-img">
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
                              <div class="bg" :style="'background-image:url('+itemLink.picurl+')'"></div>
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
                      @click="openVideoPlay(item.id, item.custom_service_nickname, item.action_value.source_oss_url)"
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
              v-else-if="item.custom_service_id > 0 && item.custom_service_id !=  baseUserInfo.id"
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
                      @click="openVideoPlay(item.id, item.custom_service_nickname, item.action_value.source_oss_url)"
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
                              <div class="bg" :style="'background-image:url('+itemLink.picurl+')'"></div>
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
            <template v-else>
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
                      v-loading="activePlayVideoId == item.id && loadingGetmedia"
                      element-loading-text="资源加载中"
                      element-loading-spinner="el-icon-loading"
                      element-loading-background="rgba(0, 0, 0, 0.5)"
                      class="msg msg-video"
                      :style="'background-image:url(' + item.action_value.thumb_oss_url + ')'"
                      @click="openVideoPlay(item.id, item.clients_nickname)"
                    >
                      <template v-if="activePlayVideoId == item.id">
                        <div class="btn-play" v-if="!loadingGetmedia"></div>
                      </template>
                      <template v-else>
                        <div class="btn-play"></div>
                      </template>
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
                        width="211"
                        height="211"
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
                    <div class="msg msg-wxlink" @click="jumpLink(item.action_value.link.url)">
                      <div class="title">{{item.action_value.link.title}}</div>
                      <div class="content">
                        <div class="content-text">{{item.action_value.link.content}}</div>
                        <div class="content-icon">
                          <i class="iconfont">&#xe627;</i>
                        </div>
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
    <!-- 编辑聊天消息 -->
    <div class="chat-edit" :class="{'wait': userInfo.compulsory_invitation == 1 || (!unableInvite && userInfo.custom_service_id === 0)}" v-if="userInfo">
      <!-- 强制邀请中 -->
      <template v-if="userInfo.compulsory_invitation == 1">
        <!-- 等待接待 -->
        <div class="chat-edit-wait">
          <p>强制邀请成功，等待对方回复</p>
        </div>
      </template>
      <template v-else>
        <template v-if="unableInvite">
          <el-alert
            v-if="unableInvite"
            :closable="false"
            class="session-error-alert"
            title="提示：访客超过48小时未沟通，无法正常邀请"
            type="error">
          </el-alert>
          <div class="chat-edit-form">
            <!-- 工具栏 -->
            <div class="tool-bar">
              <!-- 表情包 -->
              <el-popover placement="top-start" width="440" v-model="visible">
                <emotion @emotion="handleEmotion" :height="200"></emotion>
                <span class="tool-item tool-phiz" slot="reference" title="表情"></span>
              </el-popover>
              <!-- 文件夹 -->
              <span class="tool-item tool-folder" id="toolFolder" @click="onClickFolder" title="本地文件">
                <input type="file" id="upLoad" class="input-file" @change="upLoad" ref="uploadInput" />
              </span>
              <!-- 截图 -->
              <span class="tool-item tool-screenshot" title="截图" @click="captureScreen()"></span>
              <!-- 链接 -->
              <span class="tool-item tool-link" @click="linkDialog" title="链接"></span>
              <!-- 语音 -->
              <span class="tool-item tool-voice" @click="openRecordAudio" title="录音"></span>
            </div>
            <!-- 文本编辑 -->
            <div class="edit-bar">
              <div
                contenteditable="true"
                class="edit-input"
                id="editInput"
                ref="editInput"
                @keyup="onkeyupEditInput($event)"
                @keydown="onkeydownEditInput($event)"
              ></div>
            </div>
            <div class="btn-bar">
              <el-button size="small" @click="openWinCreateInvite">预约邀请</el-button>
              <el-button size="small" @click="sendMessage" :loading="loadSending">发送</el-button>
            </div>
          </div>
        </template>
        <template v-else> 
          <!-- 等待接待 -->
          <div class="chat-edit-wait" v-if="userInfo.custom_service_id == 0">
            <p>接待访客可以进入对话</p>
            <div class="btn-group">
              <el-button size="mini" type="primary" @click="receive(userInfo.id)">接待</el-button>
            </div>
          </div>
          <div class="chat-edit-form" v-else>
            <!-- 工具栏 -->
            <div class="tool-bar">
              <!-- 表情包 -->
              <el-popover placement="top-start" width="440" v-model="visible">
                <emotion @emotion="handleEmotion" :height="200"></emotion>
                <span class="tool-item tool-phiz" slot="reference" title="表情"></span>
              </el-popover>
              <!-- 文件夹 -->
              <span class="tool-item tool-folder" id="toolFolder" @click="onClickFolder" title="本地文件">
                <input type="file" id="upLoad" class="input-file" @change="upLoad" ref="uploadInput" />
              </span>
              <!-- 截图 -->
              <span class="tool-item tool-screenshot" title="截图" @click="captureScreen()"></span>
              <!-- 图片 -->
              <span class="tool-item tool-image" @click="mediaDialog" title="素材"></span>
              <!-- 链接 -->
              <span class="tool-item tool-link" @click="linkDialog" title="链接"></span>
              <!-- 语音 -->
              <span class="tool-item tool-voice" @click="openRecordAudio" title="录音"></span>
            </div>
            <!-- 文本编辑 -->
            <div class="edit-bar">
              <div
                contenteditable="true"
                class="edit-input"
                id="editInput"
                ref="editInput"
                @keyup="onkeyupEditInput($event)"
                @keydown="onkeydownEditInput($event)"
              ></div>
            </div>
            <div class="btn-bar">
              <el-button size="small" @click="openWinCreateInvite">预约邀请</el-button>
              <el-button slot="reference" size="small" @click="sendMessage" :loading="loadSending">发送</el-button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Emotion from '@/components/Emotion/index';
import setSessionRemark from '@/components/session/setSessionRemark';
import wechatLeaveMessage from '@/components/session/message/wechatLeaveMessage';
import wxTemplate from '@/components/wxTemplate';
import { mapGetters, mapActions } from 'vuex'
import { Popover } from 'element-ui';
import { normalize, parser } from '@/utils/emoji';

Vue.use(Popover);

const { ipcRenderer, shell } = require('electron');
const BenzAMRRecorder = require('benz-amr-recorder');
var amr = null; // 音频对象
let initFileDom = null;
// 跳转链接
window.jumpUrl = function (obj) {
  shell.openExternal(obj.href);
  return false;
};
export default {
  props: [
    'userInfo',
    'baseUserInfo',
    'messageList',
    'loadingMessageList',
    'loadSending',
    'loadEnd',
    'unableInvite',
    'showTipSendMSgNull',
    'nowUserId'
  ],
  components: {
    Emotion,
    setSessionRemark,
    wechatLeaveMessage,
    wxTemplate
  },
  data () {
    return {
      visible: false,
      msgInfo: '',
      loadingMoniter: false,
      Chat: null,
      content: '',
      formChat: {
        type: 'text',
        fileUpload: '',
        source_id: '',
        name: '',
        description: '',
        last_msg_id: ''
      },
      link: '',
      contentLink: [],
      playingVoiceId: '', // 当前播放音频的ID
      fd: '', // 文件上传
      winbox: false,
      hasCooperation: true, // 是否设置过协作团队
      imageSrcList: [],
      selectTags: [],
      remarkVisible: false,
      activePlayVideoId: '',
      loadingGetmedia: false
    };
  },
  created () {
    if (this.$route.query.winbox) {
      this.winbox = this.$route.query.winbox;
    }
    this.messageType = 'text';
  },
  mounted () {
    let self = this;
    /**
     * 监听选择素材完成
     * @params {Object} arg 返回参数
     */
    ipcRenderer.on('confirmMedia', (event, arg) => {
      self.messageType = 'material';
      let sourceIds = arg.source_id; // 素材ID集合
      let sourceTypes = arg.type; // 素材ID集合
      if (sourceIds && sourceIds.length === 1) {
        // 单个素材
        self.formChat.type = sourceTypes;
        self.formChat.source_id = sourceIds[0];
        self.sendMessage();
      } else {
        // 多个素材
        self.formChat.type = sourceTypes;
        self.formChat.source_id = sourceIds.join(',');
        self.sendMultiple();
      }
    });
    /**
     * 监听创建链接完成
     * @params {Object} arg 返回参数
     */
    ipcRenderer.on('createLink', (event, arg) => {
      self.messageType = 'link';
      self.formChat.type = arg.type;
      self.$nextTick(() => {
        if (self.$refs.editInput) {
          self.$refs.editInput.innerHTML += `<a href="${arg.link}">${arg.name}</a>`;
        }
      });
    });
    /**
     * 监听截图动作完成
     * @params {String} dataURL 返回base64格式图片地址
     */
    ipcRenderer.on('capture', (event, dataURL) => {
      self.messageType = 'capture';
      self.formChat.type = 'image';
      self.formChat.fileType = 1;
      self.formChat.fileUpload = dataURL;
      self.$nextTick(() => {
        if (self.$refs.editInput) {
          self.$refs.editInput.innerHTML = `<div class="mask" contenteditable="false"><img src="${dataURL}" /></div>`;
        }
      });
    });
    ipcRenderer.on('settingTemplate', (event, arg) => {
      console.log('監聽', arg);
      // self.messageType = 'link'
      // self.formChat.type = arg.type
      // self.$refs.editInput.innerHTML += `<a href="${arg.link}">${arg.name}</a>`
    })
    /**
     *  监听发送快捷回复
     * @params {String} data 回复内容
     */
    self.$ipcOn('sendFastreply', (event, data) => {
      // if (self.userInfo.custom_service_id === 0) {
      //   self.$message({
      //     message: '接待访客可以进入对话',
      //     type: 'error'
      //   });
      //   return
      // }
      self.messageType = 'text'
      self.$nextTick(() => {
        if (self.$refs.editInput) {
          self.$refs.editInput.innerHTML = data
        }
      });
    })
    self.$ipcOn('copyFastreply', (event, data) => {
      self.messageType = 'text'
      self.$nextTick(() => {
        if (self.$refs.editInput) {
          self.$refs.editInput.innerHTML = data
        }
      })
    })
    if (document.getElementById('toolFolder') !== null) {
      initFileDom = document.getElementById('toolFolder').innerHTML
    }
  },
  methods: {
    ...mapActions(['setOssUrl']),
    onkeydownEditInput (e) {
      let event = e || window.e
      let self = this
      switch (event.keyCode) {
        case 8: // 按回车键
          if (self.messageType === 'file' || self.messageType === 'capture') {
            //  选择文件或者截图
            self.$nextTick(() => {
              if (self.$refs.editInput) {
                self.resetFormChat();
              }
            });
          }
          if (self.messageType === 'emoji') {
            //  表情
            self.emotionText = self.emotionText.slice(
              0,
              self.emotionText.length - 1
            );
          }
          break;

        default:
          break;
      }
    },
    onkeyupEditInput (e) {
      let self = this
      if (e.shiftKey && e.keyCode === 13) {
        // shift+enter做换行
        return;
      }
      if (e.keyCode === 13) {
        // enter 发送
        self.$refs.editInput.innerHTML = self.$refs.editInput.innerHTML.replace(
          '<div><br></div>',
          ''
        );
        self.$refs.editInput.innerHTML = self.$refs.editInput.innerHTML.replace(
          /<div><br><\/div>/g,
          '\n'
        );
        self.sendMessage();
      }
      self.fastreplyGroup.forEach((val, index, arr) => {
        val.children.forEach((v, i, array) => {
          if (`/${v.quick_key}` === self.$refs.editInput.innerHTML) {
            console.log(v.quick_key)
            self.$refs.editInput.innerHTML = v.reply
          }
        })
      })
      self.knowledgeGroup.forEach((val, index, arr) => {
        val.children.forEach((v, i, array) => {
          if (`/${v.quick_key}` === self.$refs.editInput.innerHTML) {
            console.log(v.quick_key)
            self.$refs.editInput.innerHTML = v.reply
          }
        })
      })
    },
    /**
     * 新建邀请
     */
    openWinCreateInvite () {
      let o = {
        clientsId: this.userInfo.id,
        clientsName: this.userInfo.name || this.userInfo.nickname,
        // appid
        wxAppid: this.userInfo.wx_appid,
        // 接待id
        receiveId: this.userInfo.last_custom_service_id,
        // 接待名称
        receiveName:
          this.userInfo.last_custom_service.realname ||
          this.userInfo.last_custom_service.nickname,
        lastOperationTime: this.userInfo.last_operation_time
      };
      this.newWindows(`/session/createInvite?data=${JSON.stringify(o)}`, {
        width: 570,
        height: 460
      });
    },
    editnameSet (e) {
      console.log(e);
    },
    hideRemarkVisible () {
      this.remarkVisible = false;
    },
    /**
     * 已有标签
     */
    resetTags () {
      this.selectTags = [];
      if (this.userInfo.chat_tags) {
        this.userInfo.chat_tags.forEach(item => {
          this.selectTags.push(item.id);
        });
      }
    },
    /**
     * 选择表情
     */
    handleEmotion (i) {
      this.messageType = 'text';
      // if (this.emotionText === '') {
      //   this.emotionText = this.$refs.editInput.innerHTML + i
      // } else {
      //   this.emotionText = this.emotionText + i
      // }
      this.$refs.editInput.innerHTML += i;
    },
    /**
     * 设置协作
     */
    async openWinSessionChooseKf () {
      let resUserInfo = await this.$http.post('/user.info', {
        id: this.nowUserId
      })
      this.$emit('setUserInfo', resUserInfo.data)
      this.$nextTick(() => {
        if (!this.isCooperationCustomService) {
          this.$message({
            showClose: true,
            message: '您无权发起协作',
            type: 'error'
          });
          return;
        }
        if (
          this.userInfo.cooperation_custom_service &&
        this.userInfo.cooperation_custom_service.length > 0
        ) {
        // 管理协作团队
          this.newWindows(`/session/cooperation?id=${this.userInfo.id}`, {
            width: 360,
            height: 390
          });
        } else {
          if (this.isMainCustomService) {
          // 主接待客服去创建协作团队
            this.newWindows(`/session/chooseKf?id=${this.userInfo.id}`, {
              width: 400,
              height: 380
            });
          } else {
            this.$message({
              showClose: true,
              message: '您无权发起协作',
              type: 'error'
            });
          }
        }
      })
    },
    /**
     *  发送消息
     */
    sendMessage () {
      this.$nextTick(() => {
        let obj = this.$refs.editInput;
        let data = Object.assign(
          {
            content: obj.innerHTML
          },
          this.formChat
        );
        let params;
        switch (this.messageType) {
          case 'capture':
            // 截图
            params = {
              id: this.userInfo.id,
              type: 'image',
              fileType: 1,
              fileUpload: this.formChat.fileUpload
            };
            break;
          case 'material':
            // 素材
            params = {
              type: this.formChat.type,
              source_id: this.formChat.source_id
            };
            break;
          case 'link':
            // 链接
            params = {
              type: 'text',
              content: data.content
            };
            break;
          case 'file':
            // 文件
            params = {
              contentType: 'multipart/form-data',
              data: this.fd
            };
            break;
          case 'text':
            // 文本
            params = {
              type: 'text',
              content: data.content
            };
            break;
          case 'emoji':
            // 表情
            let $dom = this.$refs.editInput;
            params = {
              type: 'text',
              content: this.emotionText
            };
            break;
        }
        params = Object.assign(
          {
            id: this.userInfo.id
          },
          params
        );
        this.$emit('sendMessage', params);
      });
    },
    /**
     * 发送素材
     */
    sendMultiple () {
      let self = this;
      self.$nextTick(() => {
        let obj = self.$refs.editInput;
        let data = Object.assign(
          {
            content: obj.innerHTML
          },
          self.formChat
        );
        console.log(self.formChat.source_id);
        let params = {
          type: self.formChat.type,
          source_id: self.formChat.source_id
        };
        self.$emit('sendMultiple', params);
      });
    },
    /**
     * 滚动至最新消息
     */
    scrollToBottom () {
      this.$nextTick(() => {
        let listEl = document.querySelector('.chat-bd');
        this.listScrollHeight = listEl.scrollHeight;
        listEl.scrollTop = this.listScrollHeight;
      });
    },
    /**
     * 当前会话操作
     * @params { String } command 操作类型
     */
    async handleCommand (command) {
      console.log(111)
      let resUserInfo = await this.$http.post('/user.info', {
        id: this.nowUserId
      })
      this.$emit('setUserInfo', resUserInfo.data)
      this.$nextTick(() => {
        switch (command) {
          case '0':
            if (
              this.baseUserInfo.is_manage ||
            this.baseUserInfo.id === this.userInfo.custom_service_id
            ) {
            // 转接
              this.newWindows(`/session/transfer?id=${this.userInfo.id}`, {
                width: 700,
                height: 370
              });
            } else {
              this.$message({
                showClose: true,
                message: '您无法转接该客户',
                type: 'error'
              });
            }
            break;
          case '1':
          // 关闭对话
            this.newWindows(
              `/dialog/reason?id=${this.userInfo.id}&type=1&close_type=1`,
              { width: 360, height: 280 }
            );
            break;
          case '2':
          // 退回对话
            this.newWindows(
              `/dialog/reason?id=${this.userInfo.id}&type=1&close_type=2`,
              { width: 360, height: 280 }
            );
            break;
          case '3':
          // 预约
            let o = {
              clientsId: this.userInfo.id,
              clientsName: this.userInfo.name || this.userInfo.nickname,
              // appid
              wxAppid: this.userInfo.wx_appid,
              // 接待id
              receiveId: this.userInfo.last_custom_service_id,
              // 接待名称
              receiveName:
              this.userInfo.last_custom_service.realname ||
              this.userInfo.last_custom_service.nickname,
              lastOperationTime: this.userInfo.last_operation_time
            };
            this.newWindows(`/session/createInvite?data=${JSON.stringify(o)}`, {
              width: 570,
              height: 460
            });
            break;

          default:
            break;
        }
      })
    },
    /**
     * 接待
     * @params { Number } id 用户ID
     */
    receive (id) {
      this.$emit('receive', id);
    },
    /**
     * 跳转至百度地图
     * @params { Object } item 地理位置信息
     */
    jumpMap (item) {
      shell.openExternal(`https://map.qq.com/?type=marker&isopeninfowin=1&markertype=1&pointy=${item.location_x}&pointx=${item.location_y}&addr=${item.label}&name=${item.label}&ref=pcmap
`);
    },
    /**
     * 跳转链接
     */
    jumpLink (url) {
      shell.openExternal(url);
    },
    /**
     * 选择素材
     */
    mediaDialog () {
      this.newWindows(`/dialog/media?u_id=${this.userInfo.id}`, {
        width: 660,
        height: 600
      });
    },
    /**
     * 创建链接
     */
    linkDialog () {
      this.newWindows('session/createLink', { width: 400, height: 200 });
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
     * 打开录制音频面板
     */
    openRecordAudio () {
      this.newWindows('/session/recordAudio?uid=' + this.userInfo.id, {
        width: 260,
        height: 290
      });
    },
    /**
     * 选择文件
     */
    upLoad () {
      let self = this
      let files = this.$refs.uploadInput.files
      let AllUpExt = '.rar|.zip|.doc|.docx|.xls|.xlsx|.pdf|'
      let extName = files[0].name.substring(files[0].name.lastIndexOf('.')).toLowerCase()
      let size = files[0].size
      size = size / (1024 * 1024)

      if (AllUpExt.indexOf(extName + '|') === '-1') {
        this.$message({
          showClose: true,
          message: '文件格式不正确',
          type: 'error'
        })
        return false;
      }
      if (size > 10) { // 10M
        this.$message({
          showClose: true,
          message: '文件过大',
          type: 'error'
        })
        return false
      }
      var objUrl = this.getObjectURL(files[0])
      if (extName === '.png' || extName === '.jpg' || extName === '.gif') {
        // 图片类型
        this.formChat.type = 'image'
        this.$refs.editInput.innerHTML += `<img src='${objUrl}' height=80 />`
      } else if (extName === '.mp4') {
        // 视频类型
        this.formChat.type = 'video'
        this.$refs.editInput.innerHTML += `
                                            <div class="file-box ${extName.slice(1)}" contenteditable="false">
                                              <div class="">${files[0].name}</div>
                                            </div>`
      } else if (extName === '.mp3') {
        // 音频类型
        this.formChat.type = 'voice'
        this.$refs.editInput.innerHTML += `
                                            <div class="file-box ${extName.slice(1)}" contenteditable="false">
                                              <div class="">${files[0].name}</div>
                                            </div>`
      } else {
        // 文档类型
        this.formChat.type = 'doc'
        this.$refs.editInput.innerHTML += `
                                            <div class="file-box ${extName.slice(1)}" contenteditable="false">
                                              <div class="icon-filetype ${extName.slice(1)}"></div>
                                              <div  class="info">
                                                <div>${files[0].name}</div>
                                                <div>${(files[0].size / 1024 / 1024).toFixed(3)} M</div>
                                              </div>
                                            </div>`
      }
      this.formChat.fileUpload = objUrl
      let fd = new FormData()
      fd.append('fileUpload', files[0])
      fd.append('id', self.userInfo.id)
      fd.append('type', self.formChat.type)
      self.fd = fd
      self.messageType = 'file'
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
    resetFile () {
      document.getElementById('toolFolder').innerHTML = initFileDom;
    },
    /**
     * 重置表单
     */
    resetFormChat () {
      this.formChat = {
        type: 'text',
        fileUpload: '',
        source_id: '',
        name: '',
        description: '',
        last_msg_id: ''
      };
      this.emotionText = '';
      this.messageType = 'text';
      this.fd = null;
      this.$nextTick(() => {
        this.$refs.editInput && (this.$refs.editInput.innerHTML = '');
        this.$refs.uploadInput && (this.$refs.uploadInput.value = '');
      });
    },
    onClickFolder () {
      this.$refs.editInput.innerHTML = '';
    },
    /**
     * 播放视频
     * @params { Number } id 用户ID
     * @params { String } uname 用户名
     */
    openVideoPlay (id, uname, sourceOssUrl = '') {
      if (!sourceOssUrl) {
        if (this.loadingGetmedia) return
        this.activePlayVideoId = id
        this.loadingGetmedia = true
        this.$http.post('/weixin.getmedia', {
          id: id
        }).then((res) => {
          this.loadingGetmedia = false
          this.setOssUrl(res.data.oss_url)
          this.newWindows('/session/playVideo?id=' + id + '&uname=' + uname, {
            width: 500,
            height: 405,
            minWidth: 500,
            minHeight: 405,
            resizable: false,
            frame: false
          })
        }).catch(() => {
          this.loadingGetmedia = false
        })
      } else {
        this.setOssUrl(sourceOssUrl)
        this.newWindows('/session/playVideo?id=' + id + '&uname=' + uname, {
          width: 500,
          height: 405,
          minWidth: 500,
          minHeight: 405,
          resizable: false,
          frame: false
        })
      }
    },
    /**
     * 截图
     */
    captureScreen () {
      ipcRenderer.send('capture-screen', {
        winbox: this.winbox
      });
    },
    /**
     * 加载更多消息
     */
    loadMoreMsg () {
      this.$emit('loadMoreMsg')
    }
  },
  watch: {
    userInfo () {
      this.resetFormChat()
      this.resetTags()
    }
  },
  computed: {
    ...mapGetters(['moniterMessage', 'fastreplyGroup', 'knowledgeGroup']),
    isMainCustomService () {
      // 当前客服是否主接待
      return (
        this.baseUserInfo.is_manage ||
        this.baseUserInfo.id === this.userInfo.custom_service_id
      );
    },
    isCooperationCustomService () {
      let cooperationCustomService = this.userInfo.cooperation_custom_service; // 当前客户的协作客服团队
      if (
        this.baseUserInfo.is_manage ||
        this.baseUserInfo.id === this.userInfo.custom_service_id
      ) {
        // 如果是管理员 或者 接待客服
        return true;
      } else {
        // 协作成员
        if (cooperationCustomService && cooperationCustomService.length > 0) {
          let selfCooperation = cooperationCustomService.filter(item => {
            return item.id === this.baseUserInfo.id;
          });
          if (selfCooperation && selfCooperation.length > 0) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }
};
</script>

<style lang="less">
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  // 图文
  .pic-word {
    .item {
      width: 200px;
      cursor: pointer;
      position: relative;
      background-color: #fff;
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
  .load-more-msg {
    color: @color-primary;
    cursor: pointer;
    display: block;
    margin: 0 auto;
    text-align: center;
    font-size: 12px;
    &.end {
      color: @color-text-secondary;
      cursor: none;
    }
  }

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
      flex-shrink: 0;
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
      margin-left: 10px;
      font-size: 12px;
      height: 100%;
      flex-shrink: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      text-align: left;
    }
    &.mp4,
    &.mp3 {
      padding: 15px;
    }
  }

  .audio-bar {
    width: 80px;
    height: 20px;
    border-radius: 20px;
    border: 1px solid @border-color;
    cursor: pointer;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    .iconfont {
      width: 20px;
      height: 20px;
      border-radius: 20px;
      border: 1px solid @border-color;
      font-size: 12px;
      color: #666;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: -1px;
    }
  }

  .chat-hd {
    flex-shrink: 0;
    padding: 0 15px;
    height: 50px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @border-color;
    overflow: hidden;
    .chat-hd-l {
      width: 100%;
      flex-shrink: 1;
      overflow: hidden;
      .title-l {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title-r {
        width: 70px;
        display: flex;
        flex-shrink: 0;
        overflow: hidden;
      }
    }
    .chat-hd-r {
      width: 146px;
      flex-shrink: 0;
      overflow: hidden;
      margin-left: 20px;
    }
    .title {
      font-size: @font-size-bigger;
      display: flex;
      align-items: center;
      .type {
        line-height: 1;
        padding: 2px;
        background-color: @color-primary;
        color: #fff;
        font-size: @font-size-small;
        border-radius: 3px;
        margin-left: 10px;
      }
      .icon-sex {
        background-color: @color-primary;
        color: #fff;
        font-size: 12px;
        padding: 2px;
        line-height: 1;
        margin-left: 10px;
        border-radius: 3px;
      }
    }
    .sub-title {
      color: @color-text-secondary;
      font-size: @font-size-small;
    }
    .op-bar {
      border: 1px solid @border-color;
      border-radius: 3px;
      display: flex;
      .popover-i-op {
        margin: -1px;
      }
      .dropdown-i-op {
        margin: -1px;
      }
      .i-op {
        width: 50px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid @border-color;
        border-right: 0;
        margin: -1px;
        color: @color-primary;
        cursor: pointer;
        .iconfont {
          color: @color-primary;
          width: 50px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
  .chat-bd {
    position: relative;
    height: 100%;
    flex-shrink: 1;
    overflow: hidden;
    overflow-y: auto;
    padding: 20px 15px;
    s .item-time {
      text-align: center;
      color: #aeb8c4;
      margin-top: 25px;
    }
    .item-sysmsg {
      display: flex;
      justify-content: center;
      margin-top: 25px;
      .sysmsg {
        background-color: #e7e9ec;
        color: @color-text-secondary;
        border-radius: 100px;
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
                width: 50px;
                height: 50px;
              }
            }
          }
          &.msg-wxlink {
            width: 250px;
            min-height: 100px;
            display: block;
            cursor: pointer;
            .title {
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            .content {
              position: relative;
              .content-text {
                font-size: 12px;
                color: @color-text-secondary;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                line-clamp: 3;
                -webkit-box-orient: vertical;
                padding-right: 60px;
              }
              .content-icon {
                position: absolute;
                top: 0;
                right: 0;
                width: 50px;
                height: 50px;
                background-color: #f2f2f2;
                display: flex;
                justify-content: center;
                align-items: center;
                .iconfont {
                  color: #606060;
                }
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
            .loading-video {
              color: #fff;
            }
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
          &.msg-map {
            cursor: pointer;
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
        }
      }
    }
  }
  .chat-edit {
    flex-shrink: 0;
    height: 170px;
    overflow: hidden;
    border-top: 1px solid @border-color;
    display: flex;
    flex-direction: column;
    .session-error-alert {
      border-radius: 0;
    }
    &.wait {
      height: 120px;
    }
    .chat-edit-wait {
      padding: 20px;
      height: 100%;
      position: relative;
      p {
        text-align: center;
      }
      .btn-group {
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
    .chat-edit-form {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .tool-bar {
      height: 45px;
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
      .tool-phiz {
        &:after {
          content: "\e617";
        }
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
    }
    .edit-bar {
      height: 100%;
      flex-shrink: 1;
      overflow: hidden;
      & textarea,
      & .edit-input {
        width: 100%;
        height: 100%;
        border: 0;
        padding: 5px 15px;
        font-size: 16px;
        overflow: hidden;
        overflow-y: auto;
      }
      .edit-input {
        position: relative;
        .mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        a {
          text-decoration: underline;
        }
        img {
          max-width: 380px;
          max-height: 80px;
        }
      }
    }
    .btn-bar {
      height: 40px;
      flex-shrink: 0;
      padding: 0 10px;
      overflow: hidden;
      text-align: right;
    }
  }
}
</style>

