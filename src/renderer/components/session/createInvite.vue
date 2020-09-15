<template>
  <div class="service-dialog">
    <Dialog :title="'预约邀请'+ (name ? '-'+name: '')">
      <div class="content">
        <div class="left">
          <ul class="templateUl">
            <li
              v-for="item in templateList"
              :key="item.id"
              @click="changeActive(item)"
              :class="templateId === item.id? 'active': ''"
            >
              <!-- <span class="time">{{item.real_time}}</span> -->
              <span class="title">{{item.title}}</span>
            </li>
          </ul>
        </div>
        <div class="right">
          <div class="input-box">
            <span class="title">邀请主题</span>
            <el-input v-model="title" size="mini" placeholder="邀请主题" maxlength="12"></el-input>
          </div>
          <div class="input-box">
            <span class="title">邀请时间</span>
            <el-date-picker
              size="mini"
              v-model="time"
              align="right"
              type="datetime"
              placeholder="邀请时间"
              @change="checkTime('edit')"
              value-format="yyyy-MM-dd HH:mm:ss"
            ></el-date-picker>
          </div>
          <div class="input-box chat-edit-box">
            <!-- 用户id 文本内容 返回的数据 窗口 -->
            <chatEdit
              name="邀请内容"
              :id="clientsId"
              :content="templateContent"
              @radioMedia="radioMedia"
              :showType="showType"
            ></chatEdit>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div>
          <span>接待客服：</span>
          <span
            class="choose"
            @click="showReceive"
            :class="isManage !== 0? 'manage': ''"
          >{{receive.realname || receive.nickname || '暂无'}}</span>
        </div>
        <div class="right">
          <el-button type="primary" size="mini" @click="save">确 定</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog';
import chatEdit from '@/components/chatEdit';
const { ipcRenderer } = require('electron');
export default {
  components: {
    Dialog,
    chatEdit
  },
  data () {
    return {
      clientsId: '',
      name: '',
      title: '',
      time: '',
      templateId: '',
      templateList: [],
      mediaInfo: {},
      templateContent: '',
      receive: {},
      isManage: '',
      template_id: '',
      inviteId: '',
      // 最后操作时间
      lastOperationTime: '',
      showType: [],
      loading: false,
      overtime: false
    };
  },
  async created () {
    let data = JSON.parse(this.$route.query.data);
    this.clientsId = data.clientsId;
    this.name = data.clientsName;
    this.wx_appid = data.wxAppid;
    this.receive.id = data.receiveId;
    this.receive.realname = data.receiveName;
    this.lastOperationTime = data.lastOperationTime || '';
    this.isManage = this.$store.state.user.baseUserInfo.is_manage;
    // 默认比当前时间多一小时
    this.time = new Date(new Date().getTime() + 60 * 60 * 1000);
    // 格式化时间
    this.time = this.$utilscore.formatTime(this.time, 'YYYY-MM-DD hh:mm:ss');
    // 接待客服
    this.$ipcOn('inviteService', (event, val) => {
      this.receive = val;
    });
    this.checkTime('list');
    await this.getTemplate();
    if (data.inviteId) {
      for (let item of this.templateList) {
        if (item.template_id === data.templateId) {
          this.changeActive(item);
          this.title = data.title;
          this.time = data.realTime;
          this.inviteId = data.inviteId;
          return;
        }
      }
    }
  },
  methods: {
    /**
     * 检查邀请时间是否已过
     */
    checkInivteTime () {
      // 邀请时间
      let inviteMilliSecond = new Date(this.time).getTime();
      let nowMilliSecond = new Date().getTime();
      let towDayMilliSecond = 24 * 60 * 60 * 1000 * 2;
      let lastMilliSecond = new Date(this.lastOperationTime).getTime();
      let flag = true;
      if (nowMilliSecond - inviteMilliSecond >= 0) {
        this.$message({
          message: '邀请时间已过，请重新选择',
          type: 'error'
        });
        flag = false;
      } else if (inviteMilliSecond - lastMilliSecond >= towDayMilliSecond) {
        this.$message({
          message: '邀请的访客超过48小时未沟通，请重新选择',
          type: 'error'
        });
        flag = false;
      }
      return flag;
    },
    /**
     * 检查是否超过48小时
     * type list 左边列表 edit 编辑框
     */
    checkTime (type) {
      // 默认超时
      if (!this.lastOperationTime) {
        this.showType = [];
        this.overtime = true;
        return;
      }
      let towDayMilliSecond = 24 * 60 * 60 * 1000 * 2;
      // 邀请时间
      let inviteMilliSecond = '';
      if (type === 'edit') {
        inviteMilliSecond = new Date(this.time).getTime();
      } else {
        inviteMilliSecond = new Date().getTime();
      }
      // 最后操作时间
      let lastMilliSecond = new Date(this.lastOperationTime).getTime();
      // 可邀请对象为最后操作时间不超过48小时
      if (
        inviteMilliSecond - lastMilliSecond <= towDayMilliSecond &&
        inviteMilliSecond - lastMilliSecond > 0
      ) {
        this.showType = ['face', 'folder', 'screen', 'media', 'link', 'voice'];
        this.overtime = false;
      } else {
        this.overtime = true;
        this.showType = [];
      }
    },
    /**
     * 输入框里返回的数据
     */
    radioMedia (val) {
      this.mediaInfo = val;
    },
    /**
     * 选择接待客服
     */
    showReceive () {
      if (this.isManage !== 0) {
        this.newWindows('/dialog/service?type=invite&win=' + this.$route.query.winbox, {
          width: 600,
          height: 500
        });
      }
    },
    /**
     * 保存
     */
    save () {
      if (!this.title) {
        this.$dialog.showMessageBox({
          type: 'info',
          message: '请输入邀请主题'
        });
        return;
      }
      if (this.loading || !this.checkInivteTime()) {
        return;
      }
      this.loading = true;
      let params = {
        clients_id: this.clientsId,
        title: this.title,
        time_type: 0,
        realtime: this.time,
        appid: this.wx_appid,
        receive_custom_service_id: this.receive.id || '',
        template_id: this.template_id || '',
        id: this.inviteId || ''
      };
      // 文件上传
      if (this.mediaInfo.contentType === 'multipart/form-data') {
        // 追加内容
        for (let key of Object.keys(params)) {
          if (params[key]) {
            this.mediaInfo.data.append(key, params[key]);
          }
        }
        this.$http
          .post('/res.save', this.mediaInfo.data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(res => {
            this.loading = false;
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.$ipcSend('refreshUserInfo');
            this.$ipcSend('refreshInviteList');
            this.$Win.closeWin();
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        // 其他
        params.type = this.mediaInfo.type;
        params.content = this.mediaInfo.content || '';
        params.source_id =
          this.mediaInfo.source_id && this.mediaInfo.source_id[0];
        params.fileType = this.mediaInfo.fileType || '';
        params.fileUpload = this.mediaInfo.fileUpload || '';
        if (this.mediaInfo.type !== 'text' && this.mediaInfo.type !== 'wxTemplate') {
          delete params.content
          params.source_id = this.mediaInfo.content.source_id;
        }
        this.$http
          .post('/res.save', params)
          .then(res => {
            this.loading = false;
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.$ipcSend('refreshInviteList');
            this.$Win.closeWin();
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    /**
     * 切换模板
     */
    changeActive (val) {
      this.templateId = val.id;
      this.title = val.title;
      if (val.time_type === 1) {
        let t = new Date(new Date().getTime() + val.time * 3600 * 1000);
        this.time = this.$utilscore.formatTime(t, 'YYYY-MM-DD hh:mm:ss')
      } else {
        this.time = val.real_time;
      }
      // 微信模板
      if (val.weixin_template) {
        this.template_id = val.template_id;
        this.templateContent = { ...val, type: 'wxTemplate' };
        this.mediaInfo = {
          type: 'wxTemplate',
          content: JSON.stringify(val.content)
        };
      } else if (val.content.type === 'text') {
        // 普通模板
        this.template_id = '';
        this.mediaInfo.type = 'text';
        this.templateContent = val.content;
        this.mediaInfo.content = val.content.content;
      } else {
        this.template_id = '';
        this.mediaInfo.type = val.content.type;
        this.templateContent = val.content;
        let content = {...val.content}
        delete content.content
        this.mediaInfo.content = {...content, ...val.content.content};
      }
    },
    /**
     * 获取模板列表
     */
    getTemplate () {
      return this.$http
        .post('/res.template', {
          pagesize: 0,
          appid: this.wx_appid
        })
        .then(res => {
          // 筛选微信模板
          // if (this.overtime && res.data.length > 0) {
          //   this.templateList = res.data.filter(item => {
          //     if (item.weixin_template) {
          //       return item;
          //     }
          //   });
          // } else {
          //   this.templateList = res.data;
          // }
          if (res.data.length > 0) {
            this.templateList = res.data;
          } else {
            this.templateList = [];
          }
        });
    }
  },
  watch: {
    time () {
      this.checkTime('edit');
    }
  }
};
</script>
<style lang="less">
.service-dialog {
  .el-progress__text{
    color: #fff;
  }
  .dialog__wrapper {
    height: 100%;
    .dialog {
      height: 100%;
      .dialog__body {
        height: calc(100% - 88px);
        padding: 0;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.service-dialog {
  height: 100%;
  position: relative;
  .content {
    height: 100%;
    display: flex;
    .left {
      flex: 1 1 35%;
      height: 100%;
      border-right: 1px solid @border-color;
      .templateUl {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        li {
          height: 40px;
          line-height: 40px;
          cursor: pointer;
          padding: 0 10px;
          border-bottom: 1px solid @border-color;
          overflow:hidden;
          text-overflow:ellipsis;
          -o-text-overflow:ellipsis;
          -webkit-text-overflow:ellipsis;
          -moz-text-overflow:ellipsis;
          white-space:nowrap;
          &.active {
            background-color: @color-table-active;
          }
          .time {
            flex: 1 0 100px;
          }
          .title {
            flex: 1 1 auto;
          }
        }
      }
    }
    .right {
      flex: 1 1 65%;
      height: 100%;
      padding: 10px;
      .input-box {
        margin-bottom: 10px;
        .title {
          display: block;
          margin-bottom: 5px;
        }
        .el-date-editor--date {
          width: 100%;
        }
      }
      .chat-edit-box {
        height: calc(100% - 126px);
      }
    }
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .choose {
      &.manage {
        color: @color-primary;
        cursor: pointer;
      }
    }
  }
}
</style>
