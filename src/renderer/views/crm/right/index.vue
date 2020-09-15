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
      </p>
    </div>
    <!-- 图文信息 -->
    <div class="user-base-info">
        <user :user="userData"></user>
    </div>
    <!-- 用户信息 -->
    <div class="info-block" v-show="nowBar == 0">
        <info :user="userData"></info>
    </div>
    <!-- 历史聊天记录 -->
    <div class="history-block" v-show="nowBar == 1">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
      <!-- <history></history> -->
        <chatRecord :userId="id"></chatRecord>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import info from '@/components/userInfo/inc/info';
import user from '@/components/userInfo/inc/user';
// import history from '@/views/crm/inc/history';
import chatRecord from '@/components/chatRecord';
export default {
  components: {
    info,
    user,
    chatRecord
    // history
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
      userData: {}
    };
  },
  created () {
    this.getUser()
  },
  methods: {
    toggleBar (index) {
      this.$emit('toggleWidth', index);
      this.nowBar = index;
    },
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
    width: 300px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .history-block {
    height: calc(100% - 148px);
    width: 300px;
    overflow-x: hidden;
    overflow-y: auto;
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