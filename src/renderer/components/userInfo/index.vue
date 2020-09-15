<template>
  <div class="page-user-info-right">
    <!-- 操作栏 -->
    <div class="action-bar">
      <p class="left">
        <span :class="nowBar == 0 ?'active': '' " @click="toggleBar(0)">
          <i class="iconfont">&#xe69b;</i>
        </span>
        <span :class="nowBar == 1 ?'active': '' " @click="toggleBar(1)">
          <i class="iconfont">&#xe693;</i>
        </span>
        <span :class="nowBar == 2 ?'active': '' " @click="toggleBar(2)">
          <i class="iconfont">&#xe694;</i>
        </span>
      </p>
    </div>
    <!-- 图文信息 -->
    <user :user="userData"></user>
    <!-- 用户信息 -->
    <div class="info-block" v-show="nowBar == 0">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
        <info :user="userData"></info>
      </el-scrollbar>
    </div>
    <!-- 历史聊天记录 -->
    <div class="info-block" v-if="nowBar == 1">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
        <chatRecord :userId="id"></chatRecord>
      </el-scrollbar>
    </div>
    <!-- 历史邀请记录 -->
    <div class="info-block" v-if="nowBar == 2">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
        <div class="invite-box">
          <!-- 新建邀请按钮 -->
          <el-button type="primary" size="mini" @click="openWinCreateInvite" v-if="activeInvite">新建邀请</el-button>
          <!-- 邀请消息列表 -->
          <invite :id="id" :name="name" :lastOperationTime='lastOperationTime'></invite>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import chatRecord from '@/components/chatRecord';
import invite from './inc/invite';
import info from './inc/info';
import user from './inc/user';
import { mapGetters } from 'vuex'
export default {
  components: {
    chatRecord,
    invite,
    info,
    user
  },
  props: {
    // 访客id
    id: {
      type: [String, Number],
      default: ''
    }
  },
  data () {
    return {
      nowBar: 0,
      name: '',
      lastOperationTime: '',
      userData: {}
    };
  },
  created () {
    this.getUser();
    this.$ipcOn('refreshUserInfo', (event, val) => {
      this.getUser();
    });
  },
  methods: {
    /**
     * 获取用户信息
     */
    getUser () {
      let params = {
        id: this.id
      };
      this.$http
        .post('/user.info', params)
        .then(res => {
          this.userData = res.data;
          // 访客名称
          this.name = this.userData.name || this.userData.nickname;
          this.lastOperationTime = this.userData.last_operation_time
        })
        .catch(err => {
          console.log(err);
        });
    },
    toggleBar (index) {
      this.nowBar = index;
    },
    /**
     * 新建邀请
     */
    openWinCreateInvite () {
      let o = {
        clientsId: this.id,
        clientsName: this.name,
        // appid
        wxAppid: this.userData.wx_appid,
        // 接待id
        receiveId: this.userData.last_custom_service_id,
        // 接待名称
        receiveName:
          this.userData.last_custom_service.realname ||
          this.userData.last_custom_service.nickname,
        lastOperationTime: this.userData.last_operation_time
      };
      this.newWindows(
        `/session/createInvite?data=${JSON.stringify(o)}`,
        { width: 570, height: 460 }
      );
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo']),
    // 邀请
    activeInvite () {
      return this.baseUserInfo.position.power.service.includes('active_invite');
    }
  },
  watch: {
    id () {
      this.getUser();
    }
  }
};
</script>

<style lang="less" scoped>
.page-user-info-right {
  background-color: @background-color-base;
  height: 100%;
  .info-block {
    height: calc(100% - 148px);
    overflow-x: hidden;
    overflow-y: auto;
    width: 300px;
  }
  .invite-box {
    padding: 15px;
  }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px 10px 18px;
    height: 50px;
    border-bottom: 1px solid @border-color;
    span {
      cursor: pointer;
      display: inline-block;
      color: #d1d6dd;
      font-size: @font-size-bigger;
      width: 34px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border-radius: 3px;
      &.active {
        color: @color-white;
        background-color: @color-primary;
      }
    }
    .left {
      span {
        margin-right: 12px;
      }
    }
    .right {
      span {
        width: auto;
        color: #87929f;
      }
    }
  }
}
</style>