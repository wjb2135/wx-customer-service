<template>
  <div class="user-base-info">
    <!-- 头像 -->
    <div class="portrait" :style="'background-image:url('+user.avatar+')'"></div>
    <div class="right-info">
      <!-- 昵称 -->
      <div class="user-name" :title="user.nickname">{{user.nickname}}</div>
      <div class="sex-status">
        <!-- 性别 -->
        <span class="sex" :class="user.sex !== 1? 'red':''" v-if="user.sex">
          <i class="iconfont" v-if="user.sex == 1">&#xe6db;</i>
          <i class="iconfont" v-if="user.sex == 2">&#xe6dc;</i>
        </span>
        <!-- 状态 -->
        <span class="status">{{user.user_status}}</span>
      </div>
      <div class="account">
        <!-- 公众号 -->
        <span>{{user.weixin_account_name}}</span>
        <el-button size="mini" type="primary" @click="sessionWindow">发起会话</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  props: {
    user: [Object],
    default: {}
  },
  created () {
    this.$ipcOn('hasCreatedNewSessionWin', (event, val) => {
      console.log(val, 'hasCreatedNewSessionWin');
      this.$store.dispatch('setHasCreatedSessionWin', val)
    });
  },
  methods: {
    ...mapActions(['setNewUser', 'setHasCreatedSessionWin']),
    // 会话
    sessionWindow () {
      if (this.hasCreatedSessionWin) {
        this.$store.dispatch('setNewUser', this.user.id);
      } else {
        this.newWindows('/session/new?id=' + this.user.id, {
          width: 900,
          height: 700,
          minWidth: 900,
          minHeight: 700,
          markSessionWin: true,
          modal: false
        });
      }
    }
  },
  computed: {
    ...mapGetters({
      'hasCreatedSessionWin': 'hasCreatedSessionWin'
    })
  }
};
</script>

<style lang="less" scoped>
.user-base-info {
  height: 98px;
  background: linear-gradient(90deg, #0e88ed, #38aff9);
  display: flex;
  padding: 15px 10px 15px 15px;
  align-items: center;
  .right-info {
    padding-left: 15px;
    color: @color-white;
    font-size: @font-size-bigger;
    flex: 1 0 auto;
    .user-name {
      margin-bottom: 3px;
      display: inline-block;
      width: 191px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      height: 22px;
      line-height: 22px;
    }
    .sex-status {
      font-size: @font-size-small;
      display: flex;
      align-items: center;
      .sex {
        width: 15px;
        height: 15px;
        border-radius: 3px;
        background-color: @color-primary;
        margin-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        &.red{
          background-color: @color-red;
        }
        i {
          font-size: @font-size-small;
          line-height: 1;
          display: block;
        }
      }
      .status {
        background-color: #fd9096;
        border-radius: 3px;
        height: 15px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 2px;
      }
    }
    .account {
      font-size: @font-size-base;
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        flex: 0 0123px;
        display: inline-block;
        width: 123px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .el-button--primary {
        background-color: @color-primary;
        padding: 7px 6px;
      }
    }
  }
  .portrait {
    flex: 0 0 69px;
    background-image: url("../../../assets/images/portrait.jpg");
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 100%;
    background-size: 100% auto;
    width: 69px;
    height: 69px;
  }
}
</style>