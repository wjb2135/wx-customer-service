<template>
  <div class="components-user-info-input">
    <!-- 可填 -->
    <div class="input-info">
      <div class="input-box">
        <div class="title">姓名</div>
        <div class="content">
          <el-input size="mini" v-model="other_name" @blur="saveName" :disabled="operateVisitor"></el-input>
        </div>
      </div>
      <div class="input-box">
        <div class="title">电话</div>
        <div class="content">
          <el-input size="mini" v-model="mobile" @blur="savePhone" :disabled="operateVisitor"></el-input>
        </div>
      </div>
      <div class="input-box">
        <div class="title">微信</div>
        <div class="content">
          <el-input size="mini" v-model="wechat" @blur="saveWechat" :disabled="operateVisitor"></el-input>
        </div>
      </div>
      <div class="input-box">
        <div class="title">年龄</div>
        <div class="content">
          <el-input size="mini" v-model="age" @blur="saveAge" :disabled="operateVisitor"></el-input>
        </div>
      </div>
      <div class="input-box">
        <div class="title">备注</div>
        <div class="content">
          <el-input type="textarea" size="mini" v-model="remark" resize="none" @blur="saveRemark" :disabled="operateVisitor"></el-input>
        </div>
      </div>
      <div class="input-box">
        <div class="service" :class="isManage !== 0? 'manage': ''">
          所属客服:
          <span @click="openWinSessionChooseKf">{{ firstCustomService || '暂无' }}</span>
        </div>
        <div class="group" :class="operateVisitor ? 'disabled':''">
          微信分组:
          <span @click="openPopGroup">{{ weixinGroupName || '未分组'}}</span>
        </div>
      </div>
    </div>
    <!-- 访客标签 -->
    <div class="visitor-label">
      <div class="title">
        <span class="visitor">
          访客标签
          <i v-if="tags.length>0">({{tags.length}})</i>
        </span>
        <span class="icon" @click="openWinSetVisitorTag" :class="operateVisitor ? 'disabled':''">
          <i class="iconfont">&#xe6b4;</i>
        </span>
      </div>
    </div>
    <!-- 标签内容 -->
    <div class="visitor-label-content">
      <div class="label" v-for="item in tags" :key="item.id">{{item.name}}</div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'
export default {
  props: {
    user: [Object],
    default: {}
  },
  data () {
    let selectTags = []
    let firstCustomService = ''
    let text = '暂无'
    let service = this.user.first_custom_service
    if (this.user.tags && this.user.tags.length > 0) {
      this.user.tags.forEach(item => {
        selectTags.push(item.id)
      })
    }
    if (service) {
      text =
          service.is_view_nickname === 1 ? service.nickname : service.realname
    }
    firstCustomService = text
    return {
      other_name: this.user.other_name,
      remark: this.user.remark,
      mobile: this.user.mobile,
      wechat: this.user.wechat,
      age: this.user.age,
      id: this.user.id,
      isManage: this.$store.state.user.baseUserInfo.is_manage,
      weixinGroupName: this.user.weixin_group_name,
      weixinGroupId: this.user.weixin_group,
      firstCustomService: firstCustomService,
      tags: (this.user.tags && [...this.user.tags]) || '',
      selectTags: selectTags,
      wx_appid: ''
    };
  },
  computed: {
    ...mapGetters(['baseUserInfo']),
    // 操作好友访客
    operateFriendVisitor () {
      return !this.baseUserInfo.position.power.service.includes('operate_friend_visitor');
    },
    // 操作公共访客
    operatePublicVisitor () {
      return !this.baseUserInfo.position.power.service.includes('operate_public_visitor');
    },
    operateVisitor () {
      let name = this.$route.name
      console.log(this.$route.name, 'this.$route.name', this.baseUserInfo.position.power.service);
      // 好友访客
      if (name === 'friend' || name === 'sessionIndex' || name === 'history') {
        return this.operateFriendVisitor
      } else {
        return this.operatePublicVisitor
      }
    }
  },
  watch: {
    user () {
      this.other_name = this.user.other_name;
      this.remark = this.user.remark;
      this.mobile = this.user.mobile;
      this.wechat = this.user.wechat;
      this.age = this.user.age;
      this.id = this.user.id;
      this.isManage = this.$store.state.user.baseUserInfo.is_manage;
      this.weixinGroupName = this.user.weixin_group_name;
      this.weixinGroupId = this.user.weixin_group;
      this.wx_appid = this.user.wx_appid
      this.tags = [...this.user.tags]
      this.resetTags()
      this.setCustomService()
    }
  },
  methods: {
    resetTags () {
      this.selectTags = [];
      this.tags.forEach(item => {
        this.selectTags.push(item.id)
      })
    },
    setCustomService () {
      let text = '暂无客服';
      let service = this.user.first_custom_service;
      if (service) {
        text =
          service.is_view_nickname === 1 ? service.nickname : service.realname;
      }
      this.firstCustomService = text;
    },
    /**
     * 所属客服
     */
    openWinSessionChooseKf () {
      if (this.isManage !== 0) {
        if (!this.id) {
          this.$dialog.showErrorBox('提示', '访客ID不存在')
          return
        }
        this.newWindows('/dialog/service?id=' + this.id + '&wx_appid=' + this.wx_appid, {
          width: 360,
          height: 380
        });
      }
    },
    /**
     * 分组编辑
     */
    openPopGroup () {
      // 不可操作
      if (this.operateVisitor) {
        return;
      }
      if (!this.id) {
        this.$dialog.showErrorBox('提示', '访客ID不存在')
        return
      }
      this.newWindows(`/session/setWeChatGroup?id=${this.id}&group=${this.weixinGroupId}`, {
        width: 250,
        height: 360
      });
    },
    /**
     * 设置访客标签
     */
    openWinSetVisitorTag () {
      // 不可操作
      if (this.operateVisitor) {
        return;
      }
      if (!this.id) {
        this.$dialog.showErrorBox('提示', '访客ID不存在')
        return
      }
      this.newWindows(`/session/setVisitorTag?id=${this.id}&selectTags=` + JSON.stringify(this.selectTags), {
        width: 600,
        height: 400
      })
    },
    /**
     * 设置别名
     */
    saveName () {
      let params = {
        id: this.id,
        other_name: this.other_name
      };
      this.$http
        .post('/user.set_other_name', params)
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 设置电话
     */
    savePhone () {
      if (!this.mobile) {
        return;
      }
      if (!(/^1[3456789]\d{9}$/.test(this.mobile))) {
        this.$dialog.showErrorBox('提示', '手机号格式错误')
        return;
      }
      let params = {
        id: this.id,
        mobile: this.mobile
      };
      this.$http
        .post('/user.set_mobile', params)
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 设置微信
     */
    saveWechat () {
      let params = {
        id: this.id,
        wechat: this.wechat
      };
      this.$http
        .post('/user.set_wechat', params)
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 设置年龄
     */
    saveAge () {
      if (!this.age || this.age <= 0) {
        this.$dialog.showErrorBox('提示', '请输入正确的年龄')
        return;
      }
      let params = {
        id: this.id,
        age: this.age
      };
      this.$http
        .post('/user.set_age', params)
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 备注
     */
    saveRemark () {
      if (!this.remark) {
        return;
      }
      let params = {
        id: this.id,
        remark: this.remark
      };
      this.$http
        .post('/user.set_remark', params)
        .then(res => {})
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.components-user-info-input {
  .input-info {
    padding: 20px 3px;
    border-bottom: 1px solid @border-color;
    .input-box {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      justify-content: space-between;
      &:last-child {
        margin-bottom: 0;
      }
      .title {
        letter-spacing: 4px;
        flex: 0 0 36px;
        margin-right: 18px;
        white-space: nowrap;
      }
      .content {
        flex: 1 1 auto;
        .el-input,
        .el-textarea {
          width: 100%;
        }
      }
      .service {
        padding-top: 2px;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 0 50%;
        &.manage {
          span {
            color: @color-primary;
            cursor: pointer;
          }
        }
      }
      .group {
        padding-top: 2px;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1 0 50%;
        span {
          color: @color-primary;
          cursor: pointer;
        }
        &.disabled{
          span{
            color: #24272b;
            cursor: text;
          }
        }
      }
    }
  }
  .visitor-label-content {
    padding: 0 3px;
    .label {
      display: inline-block;
      background-color: #f7f9f9;
      color: #87929f;
      font-size: @font-size-base;
      height: 25px;
      line-height: 25px;
      padding: 0 7px;
      margin-bottom: 4px;
      margin-right: 5px;
    }
  }
  .visitor-label {
    padding: 0 3px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 18px;
      padding-bottom: 12px;
      line-height: 1;
      .visitor {
        color: #24272b;
        font-size: @font-size-base;
        i {
          font-style: normal;
        }
      }
      .icon {
        color: #d1d6dd;
        font-size: @font-size-base;
        cursor: pointer;
        &.disabled{
          cursor: default;
        }
      }
    }
  }
}
</style>