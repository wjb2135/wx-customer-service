<template>
  <div class="menu">
    <div class="item logo">
      <a @click="jumpLink(sysConfig.platform_url)">
        <img src="../../assets/images/app/logo.png" />
      </a>
    </div>
    <div class="item">
      <router-link to="/home" title="首页" class="home" :class="{'active': active == 'home'}"></router-link>
    </div>
    <div class="item">
      <el-badge is-dot :hidden="!hasNewClient">
        <router-link to="/session" class="session" :class="{'active': active == 'session'}" title="会话"></router-link>
      </el-badge>
    </div>
    <div class="item" v-show="historyRecord">
      <router-link to="/history" class="history" :class="{'active': active == 'history'}" title="历史记录"></router-link>
    </div>
    <div class="item" v-show="viewFriendVisitor">
      <router-link to="/friend" class="friend" :class="{'active': active == 'friend'}" title="好友对话"></router-link>
    </div>
    <div class="item" v-show="inviteManage && viewPublicVisitor">
      <router-link to="/visitor" class="visitor" :class="{'active': active == 'visitor'}" title="访客管理"></router-link>
    </div>
    <div class="item" v-show="viewPublicVisitor">
      <router-link to="/crm" class="crm" :class="{'active': active == 'crm'}" title="CRM"></router-link>
    </div>
    <div class="item">
      <router-link to="/invite" class="invite" :class="{'active': active == 'invite'}" title="邀请管理"></router-link>
    </div>
    <div class="item"  v-show="useMonitoringFunction">
      <router-link to="/monitor" class="monitor" :class="{'active': active == 'monitor'}" title="会话监控"></router-link>
    </div>
    <div class="item setting" title="设置">
      <a @click="newWindows('/setting/personal', {frame: false})" class="setting" :class="{'active': active == 'setting'}"></a>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
const { shell } = require('electron')
export default {
  props: {
    active: String
  },
  methods: {
    /**
     * 跳转链接
     */
    jumpLink (url) {
      shell.openExternal(url)
    }
  },
  computed: {
    ...mapGetters(['hasNewClient', 'sysConfig', 'baseUserInfo']),
    // 访客管理
    inviteManage () {
      return this.baseUserInfo.position.power.service.includes('invite_manage');
    },
    // 历史记录
    historyRecord () {
      return this.baseUserInfo.position.power.service.includes('history_record');
    },
    // 查看好友访客
    viewFriendVisitor () {
      return this.baseUserInfo.position.power.service.includes('view_friend_visitor');
    },
    // 查看公共访客
    viewPublicVisitor () {
      return this.baseUserInfo.position.power.service.includes('view_public_visitor');
    },
    // 监控功能
    useMonitoringFunction () {
      return this.baseUserInfo.position.power.service.includes('use_monitoring_function');
    }
  }
}
</script>

<style lang="less">
.menu {
  width: 100%;
  height: 1000%;
  .item {
    width: 60px;
    height: 62px;
    display: flex;
    justify-items: center;
    align-items: center;
    .iconfont {
      color: #99acc1;
      font-size: 30px;
    }
    .el-badge {
      margin: 0 auto;
    }
    a {
      display: flex;
      justify-content: center;
      align-items: center;
      // width: 100%;
      // height: 100%;
      margin: 0 auto;
      &:after {
        content: '';
        font-family: 'iconfont';
        font-size: 30px;
        color: #99acc1;
      }
      &.home {
        &:after {
          content: '\e6bc';
        }
      }
      &.session {
        &:after {
          content: '\e6bd';
        }
      }
      &.history {
        &:after {
          content: '\e6b5';
        }
      }
      &.friend {
        &:after {
          content: '\e6af';
        }
      }
      &.visitor {
        &:after {
          content: '\e6c0';
        }
      }
      &.crm {
        &:after {
          content: '\e6b0';
        }
      }
      &.invite {
        &:after {
          content: '\e6be';
        }
      }
      &.monitor {
        &:after {
          content: '\e6ba';
        }
      }
      &.setting {
        &:after {
          content: '\e6b7';
        }
      }
      &.active {
        &:after {
          color: @color-primary;
        }
        &.home {
          &:after {
            content: '\e6bf';
          }
        }
        &.session {
          &:after {
            content: '\e6b6';
          }
        }
        &.history {
          &:after {
            content: '\e6b3';
          }
        }
        &.friend {
          &:after {
            content: '\e6ad';
          }
        }
        &.visitor {
          &:after {
            content: '\e6b2';
          }
        }
        &.crm {
          &:after {
            content: '\e6b1';
          }
        }
        &.invite {
          &:after {
            content: '\e6bb';
          }
        }
        &.monitor {
          &:after {
            content: '\e6b8';
          }
        }
        &.setting {
          &:after {
            content: '\e6b7';
          }
        }
      }
    }
    &.setting {
      position: absolute;
      bottom: 0;
      left: 0;
    }
    &.logo {
      width: 100%;
      height: 60px;
      margin: 5px 0;
      a {
        width: 45px;
        margin: 0 auto;
        cursor: pointer;
        img {
          width: 100%;
        }
      }
    }
  }
}
</style>