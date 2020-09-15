<template>
  <!-- 右侧操作面板（聊天窗） -->
  <div class="chat-right-menu">
    <div class="menu-tab">
      <span
        class="item-tab"
        title="快捷回复"
        :class="{ 'active': activeMenuType === 'shortcut' }"
        @click="chooseMenuType('shortcut')"
      >
        <i class="icon iconfont">&#xe69f;</i>
      </span>
      <span
        class="item-tab"
        title="访客信息"
        :class="{ 'active': activeMenuType === 'uInfo' }"
        @click="chooseMenuType('uInfo')"
      >
        <i class="icon iconfont">&#xe69b;</i>
      </span>
      <span
        class="item-tab"
        title="预约邀请"
        :class="{ 'active': activeMenuType === 'invite' }"
        @click="chooseMenuType('invite')"
      >
        <i class="icon iconfont">&#xe694;</i>
      </span>
    </div>
    <div class="menu-main">
      <!-- 快捷回复 -->
      <section class="shortcut-box" v-show="activeMenuType == 'shortcut'">
        <div class="forward-search">
          <search-bar placeholder="搜索快捷短语" v-on:setKeyWord="setKeyWord"></search-bar>
        </div>
        <!-- 搜索结果 -->
        <div class="search-result" v-show="searchKey">
          <div class="list-search" v-if="fastreplyGroupSearchResult && fastreplyGroupSearchResult.length > 0">
            <div class="item-search" v-for="(item, index) in fastreplyGroupSearchResult" :key="index">
              <div class="title">{{item.name}}</div>
              <div class="content">{{item.reply}}</div>
              <div class="btn-group">
                <el-button size="mini" type="primary" round class="btn-send" @click="sendFastreply(item.reply)">发送</el-button>
              </div>
            </div>
          </div>
          <div class="null-data" v-else>暂时搜索不到相关数据</div>
        </div>
        <el-tabs v-model="activeName" @tab-click="handleClick" class="set-shortcut-tab" v-show="!searchKey">
          <el-tab-pane label="快捷短语" name="first">
            <span class="btn-edit-group" @click="openfastreplyGroupEdit">编辑</span>
            <el-tree class="tree-shortcut" :data="fastreplyGroup" :props="defaultProps">
              <template slot-scope="{ node, data }">
                <div class="label-shortcut" v-if="data.label">
                  <span class="label" @click="log(data)">{{data.label}}</span>
                </div>
                <!-- 对话列表 -->
                <div
                  class="text-shortcut"
                  :class="{ 'active':  activeShortcutId == data.id} " 
                  v-else
                  @click="selectShortcut(data.id)"
                >
                  <span class="text">{{data.name}}</span>
                  <span class="btn-group">
                    <i class="send" @click="sendFastreply(data.reply)">发送</i>
                    <i class="copy" @click="copyFastreply(data.reply)">复制</i>
                  </span>
                </div>
              </template>
            </el-tree>
          </el-tab-pane>
          <el-tab-pane label="知识库" name="second">
            <span class="btn-edit-group" @click="openKnowledgeGroupEdit" v-if="baseUserInfo.is_manage == 1">编辑</span>
            <el-tree class="tree-shortcut" :data="knowledgeGroup" :props="defaultProps">
              <template slot-scope="{ node, data }">
                <div class="label-shortcut" v-if="data.label">
                  <span class="label" @click="log(data)">{{data.label}}</span>
                </div>
                <!-- 对话列表 -->
                <div
                  class="text-shortcut"
                  :class="{ 'active':  activeShortcutId == data.id} " 
                  v-else
                  @click="selectShortcut(data.id)"
                >
                  <span class="text">{{data.name}}</span>
                  <span class="btn-group">
                    <i class="send" @click="sendFastreply(data.reply)">发送</i>
                    <i class="copy" @click="copyFastreply(data.reply)">复制</i>
                  </span>
                </div>
              </template>
            </el-tree>
          </el-tab-pane>
        </el-tabs>
      </section>
      <!-- 访客信息 -->
      <section class="uinfo-box" v-show="activeMenuType == 'uInfo'">
        <el-popover
          placement="left-start"
          width="250"
          trigger="click">
          <div class="popover-uinfo">
            <div class="uinfo-name">
              <div class="name">{{user.nickname}}</div>
              <i class="icon iconfont icon-sex" :class="{'red': user.sex == 2}">
                <template v-if="user.sex == 1">&#xe6db;</template>
                <template v-else-if="user.sex == 2">&#xe6dc;</template>
                <template v-else>未知</template>
              </i>
            </div>
            <div class="uinfo-time">
              <div>最近来访时间: {{user.last_visit_time}}</div>
              <div>最后说话时间: {{user.last_message_send}}</div>
              <div>首次关注时间: {{user.created_at}}</div>
            </div>
            <div class="uinfo-total">
              <div class="item-total">
                <label>来访次数</label>
                <span class="num">{{user.visit_count}}</span>
                <span class="status">有效：{{user.effective_visit_count}}</span>
              </div>
              <div class="item-total">
                <label>邀请次数</label>
                <span class="num">{{user.all_inviter_count}}</span>
                <span class="status">有效：{{user.all_effective_inviter_count}}</span>
              </div>
              <div class="item-total">
                <label>访客说话</label>
                <span class="num">{{user.all_message_num}}</span>
              </div>
              <div class="item-total">
                <label>客服说话</label>
                <span class="num">{{user.all_reply_num}}</span>
              </div>
            </div>
            <div class="uinfo-after">
              <span>访客来源：{{user.source_name}}</span>
            </div>
          </div>
          <div class="uinfo-title" slot="reference">
            <div class="avatar">
              <img :src="user && user.avatar" alt />
            </div>
            <div class="name">
              <span>{{user.nickname}}</span>
            </div>
            <div class="info">
              <span>{{user.weixin_account_name}}</span>
              <span>{{user.source_name}}</span>
              <span>{{user.country}}{{user.province}}{{user.city}}</span>
            </div>
          </div>
        </el-popover>
        <!-- 右侧用户信息备注 -->
        <div class="uinfo-form">
          <user-input :user="user"></user-input>
        </div>
      </section>
      <!-- 预约邀请 -->
      <section class="invite-box" v-show="activeMenuType == 'invite'">
        <el-button type="primary" size="mini" @click="openWinCreateInvite" v-if="activeInvite">新建邀请</el-button>
        <!-- 邀请消息列表 -->
        <invite :id="user.id"></invite>
      </section>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar'
import invite from '@/components/userInfo/inc/invite'
import userInput from '@/components/userInfo/inc/input'
import copy from 'copy-to-clipboard'
import { mapActions, mapGetters } from 'vuex';
export default {
  props: {
    user: [Object],
    messageList: '',
    inviteList: '',
    default: {}
  },
  components: {
    searchBar,
    invite,
    userInput
  },
  data () {
    return {
      searchKey: '',
      activeNames: '',
      dialogVisible: false,
      activeMenuType: 'uInfo',
      activeName: 'first',
      activeShortcutId: '',
      fastreplyGroup: [],
      knowledgeGroup: [],
      dataCommon: [
        {
          label: '常用语',
          children: [
            {
              id: 1,
              txt: '你好啊~~欢迎光临本店...'
            },
            {
              id: 2,
              txt: '感谢您的光临，欢迎下次再来...'
            },
            {
              id: 3,
              txt: '亲，请稍等'
            },
            {
              id: 4,
              txt: '亲，订单价格已经改好，可以付款啦'
            }
          ]
        }
      ],
      dataKnowledge: [
        {
          label: '知识库',
          children: [
            {
              id: 1,
              txt: '你好啊~~欢迎光临本店...'
            },
            {
              id: 2,
              txt: '感谢您的光临，欢迎下次再来...'
            },
            {
              id: 3,
              txt: '亲，请稍等'
            },
            {
              id: 4,
              txt: '亲，订单价格已经改好，可以付款啦'
            }
          ]
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      form: {
        name: '',
        tel: '',
        wechat: '',
        age: '',
        remark: ''
      }
    };
  },
  created () {
    this.fastreplyGroupRead()
    this.knowledgeGroupRead()
    this.$ipcOn('refreshGroup', () => {
      this.fastreplyGroupRead()
      this.knowledgeGroupRead()
    })
  },
  methods: {
    ...mapActions(['setFastreplyGroup', 'setKnowledgeGroup']),
    selectShortcut (i) {
      this.activeShortcutId = i;
    },
    setKeyWord (val) {
      this.searchKey = val
    },
    handleClick () {},
    log () {},
    chooseMenuType (i) {
      this.activeMenuType = i;
    },
    /**
     * 获取快捷短语
     */
    fastreplyGroupRead () {
      this.$http.post(`${this._APIROOT}/cs.fastreply_group_read`, {
        type: 0
      }).then((res) => {
        let data = res.data
        this.fastreplyGroup = data
        this.setFastreplyGroup(data)
      })
    },
    /**
     * 获取知识库
     */
    knowledgeGroupRead () {
      this.$http.post(`${this._APIROOT}/cs.fastreply_group_read`, {
        type: 1
      }).then((res) => {
        let data = res.data
        this.knowledgeGroup = data
        this.setKnowledgeGroup(data)
      }).catch(() => {

      });
    },
    /**
     * 编辑知识库
     */
    openKnowledgeGroupEdit () {
      this.newWindows('/session/editQuickReply?type=1', { width: 640, height: 490 });
    },
    /**
     * 编辑快捷回复
     */
    openfastreplyGroupEdit () {
      this.newWindows('/session/editQuickReply?type=0', { width: 640, height: 490 });
    },
    /**
     * 分组编辑
     */
    openPopGroup () {
      this.newWindows('/session/setWeChatGroup', { width: 250, height: 360 });
    },
    /**
     * 所属客服
     */
    openWinSessionChooseKf () {
      this.newWindows('/session/chooseKf', { width: 400, height: 500 });
    },
    /**
     * 设置访客标签
     */
    openWinSetVisitorTag () {
      this.newWindows('/session/setVisitorTag', { width: 600, height: 400 });
    },
    /**
     * 新建邀请
     */
    openWinCreateInvite () {
      let o = {
        clientsId: this.user.id,
        clientsName: this.user.name || this.user.nickname,
        // appid
        wxAppid: this.user.wx_appid,
        // 接待id
        receiveId: this.user.last_custom_service_id,
        // 接待名称
        receiveName:
          this.user.last_custom_service.realname ||
          this.user.last_custom_service.nickname,
        lastOperationTime: this.user.last_operation_time
      };
      this.newWindows(`/session/createInvite?data=${JSON.stringify(o)}`, {
        width: 570,
        height: 460
      });
    },
    handleChange () {},
    /**
     * 发送快捷回复
     */
    sendFastreply (reply) {
      this.$ipcSend('sendFastreply', reply)
    },
    /**
     * 复制快捷回复
     */
    copyFastreply (reply) {
      copy(reply)
      this.$message.success('复制成功');
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo']),
    // 邀请
    activeInvite () {
      return this.baseUserInfo.position.power.service.includes('active_invite');
    },
    fastreplyGroupSearchResult () {
      let self = this;
      let arrByZM = [];
      // 遍历组装数组、实时搜索
      if (self.fastreplyGroup && self.fastreplyGroup.length > 0) {
        for (let i = 0; i < self.fastreplyGroup.length; i++) {
          // 判断输入框中的值是否可以匹配到数据，如果匹配成功
          for (let index = 0; index < self.fastreplyGroup[i].children.length; index++) {
            const element = self.fastreplyGroup[i].children[index];
            if (self.searchKey && (self.fastreplyGroup[i].children[index].name.search(
              self.searchKey.toUpperCase()
            ) !== -1 || self.fastreplyGroup[i].children[index].reply.search(
              self.searchKey.toUpperCase()
            ) !== -1)
            ) {
              arrByZM.push(self.fastreplyGroup[i].children[index]); // 向空数组中添加数据
            }
          }
        }
      }
      if (self.knowledgeGroup && self.knowledgeGroup.length > 0) {
        for (let i = 0; i < self.knowledgeGroup.length; i++) {
          // 判断输入框中的值是否可以匹配到数据，如果匹配成功
          for (let index = 0; index < self.knowledgeGroup[i].children.length; index++) {
            const element = self.knowledgeGroup[i].children[index];
            if (self.searchKey && (self.knowledgeGroup[i].children[index].name.search(
              self.searchKey.toUpperCase()
            ) !== -1 || self.knowledgeGroup[i].children[index].reply.search(
              self.searchKey.toUpperCase()
            ) !== -1)
            ) {
              arrByZM.push(self.knowledgeGroup[i].children[index]); // 向空数组中添加数据
            }
          }
        }
      }
      return arrByZM;
    }
  }
};
</script>


<style lang="less">
.popover-uinfo {
  font-size: 12px;
  color: @color-text-primary;
  .uinfo-name {
    padding-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
    .name {
      margin-bottom: 5px;
    }
    .icon-sex {
      background-color: @color-primary;
      color: #fff;
      font-size: 12px;
      padding: 2px;
      line-height: 1;
      border-radius: 3px;
      font-weight: 400;
      &.red {
        background-color: @color-red;
      }
    }
  }
  .uinfo-time {
    border-top: 1px solid @border-color;
    padding: 5px 0;
    div {
      line-height: 2;
    }
  }
  .uinfo-total {
    border-top: 1px solid @border-color;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding: 5px 0;
    .item-total {
      width: 50%;
      text-align: center;
      margin: 5px 0;
      label {
        display: block;
      }
      .num {
        display: block;
        font-size: 14px;
        color: @color-primary;
        font-weight: 700;
      }
      .status {
        color: @color-text-regular;
      }
    }
  }
  .uinfo-after {
    border-top: 1px solid @border-color;
    padding-top: 5px;
    color: @color-text-secondary;
  }
}
.chat-right-menu {
  padding-top: 50px;
  .input-box {
    .service, .group {
      font-size: 12px;
    }
  }
  .search-result {
    font-size: 12px;
    .null-data {
      color: @color-text-secondary;
      text-align: center;
    }
    .list-search {
      padding: 0 15px;
      .item-search {
        padding: 10px 0;
        border-bottom: 1px solid @border-color;
        .btn-group {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .title {
          overflow:hidden; 
          text-overflow:ellipsis;
          display:-webkit-box; 
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2;
          margin-bottom: 5px;
        }
        .content {
          overflow:hidden; 
          text-overflow:ellipsis;
          display:-webkit-box; 
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2; 
        }
      }
    }
  }
  .forward-search {
    padding: 15px;
  }
  .el-icon-caret-right:before {
    content: "\e68b";
    font-family: "iconfont";
    color: #87929f;
    margin-left: 5px;
  }
  .el-tree-node__expand-icon.is-leaf {
    &:before {
      content: none;
    }
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: #fff;
  }
  .el-tree-node__children .el-tree-node__content {
    padding-left: 0 !important;
    margin-top: 3px;
  }
  .collapse-invite {
    border: 0;
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
    }
  }
  .tree-shortcut {
    .el-tree-node__content:visited {
      background-color: #F5F7FA !important;
    }
    .el-tree-node__content:hover {
      background-color: transparent;
    }
    .label-shortcut {
      position: relative;
      width: 100%;
      font-size: 14px;
      .edit {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
        z-index: 9999;
        color: @color-primary;
      }
    }
    .el-tree-node__children {
      .label-shortcut {
        padding-left: 17px;
      }
    }
    .text-shortcut {
      display: flex;
      width: 100%;
      height: 26px;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      margin-top: 3px;
      padding-left: 30px;
      margin-right: 15px;
      .text {
        width: 100%;
        flex-shrink: 1;
        overflow: hidden;
        line-height: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: @color-text-secondary;
      }
      .btn-group {
        margin-left: 10px;
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        height: 100%;
        display: none;
        i {
          height: 26px;
          line-height: 26px;
          color: #fff;
          display: block;
          justify-content: center;
          align-items: center;
          font-size: 12px;
          padding: 0 5px;
          &.send {
            background-color: @color-primary;
          }
          &.copy {
            background-color: #8ba7c4;
          }
        }
      }
      &.active {
        background-color: @color-primary-light-9;
        .btn-group {
          display: flex;
        }
      }
    }
  }
  .menu-tab {
    position: fixed;
    top: 40px;
    width: 100%;
    padding: 0 15px;
    height: 50px;
    background-color: #fff;
    display: flex;
    align-items: center;
    border-bottom: 1px solid @border-color;
    z-index: 99;
    .item-tab {
      width: 34px;
      height: 30px;
      border-radius: 4px;
      margin-right: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #d2d6dd;
      cursor: pointer;
      &.active {
        background-color: @color-primary;
        color: #fff;
      }
    }
  }
  .set-shortcut-tab {
    position: relative;
    .btn-group {
      display: flex;
      justify-content: flex-end;
      color: @color-primary;;
    }
    .el-tabs__header {
      padding: 0 20px;
      &::after {
        content: "";
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 1px;
        background-color: @border-color;
      }
    }
    .el-tabs__nav-wrap::after {
      display: none;
    }
    .btn-edit-group {
      position: absolute;
      top: 3px;
      right: 15px;
      z-index: 999;
      color: @color-primary;
      cursor: pointer;
      font-size: 12px;
    }
  }
  .uinfo-box {
    padding: 15px;
    .uinfo-title {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding-bottom: 15px;
      cursor: pointer;
      .avatar {
        width: 140px;
        height: 140px;
        img {
          width: 100%;
          height: 100%;
          border-radius: 100px;
        }
      }
      .name {
        font-size: @font-size-large;
        line-height: 1;
        margin-top: 15px;
      }
      .info {
        color: @color-text-secondary;
        margin-top: 10px;
        span {
          display: block;
          line-height: 1.8;
        }
      }
    }
    .uinfo-form {
      border-top: 1px solid @border-color;
      .el-form-item--mini.el-form-item,
      .el-form-item--small.el-form-item {
        margin-bottom: 10px;
      }
      .attr {
        display: flex;
        justify-content: space-between;
        .item-attr {
          // display: block;
          font-size: @font-size-small;
          a {
            color: @color-primary;
            cursor: pointer;
          }
        }
      }
    }
    .uinfo-tag {
      border-top: 1px solid @border-color;
      padding: 20px 5px;
      .tag-hd {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .iconfont {
          color: #d1d6dd;
          cursor: pointer;
        }
      }
      .tag-bd {
        margin-left: -2.5px;
        display: flex;
        flex-wrap: wrap;
        .item-tag {
          background-color: #f7f9f9;
          color: @color-text-secondary;
          padding: 5px;
          line-height: 1;
          margin: 2.5px;
        }
      }
    }
  }
  .invite-box {
    padding: 15px;
  }
}
</style>
