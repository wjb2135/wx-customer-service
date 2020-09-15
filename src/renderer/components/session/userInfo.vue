<template>
  <div class="childwin-user-info">
    <main-head title='个人资料'></main-head>
    <div class="info-hd">
      <div class="u-l-avatar">
        <img :src="userInfo.avatar">
      </div>
      <div class="u-r-info">
        <div class="name">{{userInfo.realname}}</div>
        <div class="fraction">{{userInfo.last_online_time}}</div>
        <div class="total">
          <span>{{userInfo.online_time}}</span>
          <span class="btn-setpwd" @click="openSetPwd">修改密码</span>
        </div>
      </div>
    </div>
    <div class="info-bd">
      <div class="tab-title">
        <div class="item-tab" :class="{'active': activeName == 'material'}" @click="change('material')">资料</div>
        <div class="item-tab" :class="{'active': activeName == 'company'}" @click="change('company')">公司</div>
      </div>
      <div class="tab-main">
        <div class="main main-material" v-show="activeName == 'material'">
          <div class="list-group">
            <p>昵称：{{userInfo.nickname}}</p>
            <p>账号：{{userInfo.account}}</p>
          </div>
          <div class="list-group">
            <p>电话：{{userInfo.mobile}}</p>
            <p>公司：{{company.name}}</p>
          </div>
          <div class="list-group">
            <p>部门：{{department.name}}</p>
            <p>职位：{{position.name}}</p>
            <p>权限：
              <span v-if="userInfo.is_manage">管理员</span>
              <span v-else>普通客服</span>
            </p>
          </div>
          <div class="list-group">
            <p>分配会话：
              <span v-if="!userInfo.is_distribution">未</span>分配
            </p>
            <p>禁止对外显示客服名称和头像</p>
            <p class="c-blue">最大接待访客数：{{userInfo.max_num}}</p>
            <p class="c-blue">客服等级：{{userInfo.level}}级客服</p>
            <p>服务时间：{{userInfo.service_begin_time}} - {{userInfo.service_end_time}}</p>
          </div>
        </div>
        <div class="main-company" v-show="activeName == 'company'">
          <div class="list-group">
            <p>公司名称：{{company.name}}</p>
          </div>
          <div class="list-group">
            <p>授权开始时间：{{userInfo.group_create_time}}</p>
            <p>授权结束时间：{{userInfo.group_expire}}</p>
            <p>剩余时间：234天</p>
            <p>授权坐席：{{userInfo.max_custom_service_seat}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mainHead from '@/components/windows/mainHead';
export default {
  components: {
    mainHead
  },
  data () {
    return {
      activeName: 'material',
      userInfo: {},
      company: {},
      department: {},
      position: {}
    }
  },
  computed: {
    loginTime () {
      console.log(this.$store.state)
      return this.$store.state.user.baseUserInfo.login_time
    }
  },
  created () {
    this.getCsInfo()
  },
  methods: {
    change (i) {
      this.activeName = i;
    },
    /**
     * 获取登录用户信息
     */
    getCsInfo () {
      this.$http.post('/cs.info').then((res) => {
        this.userInfo = res.data
        this.company = res.data.company
        this.department = res.data.department
        this.position = res.data.position
      });
    },
    /**
     * 修改密码
     */
    openSetPwd () {
      this.newWindows('/setPwd', {width: 440, height: 300});
    }
  }
}
</script>


<style lang="less" scoped>
  .childwin-user-info {
    .info-hd {
      display: flex;
      align-items: center;
      padding: 15px;
      background: @color-primary;
      display: flex;
      color: #fff;
      .u-l-avatar {
        width: 70px;
        height: 70px;
        margin-right: 10px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
          border-radius: 100px;
        }
      }
      .u-r-info {
        width: 100%;
        flex-shrink: 1;
        .fraction {
          margin-top: 2px;
        }
        .total {
          margin-top: 2px;
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .btn-setpwd {
          cursor: pointer;
          text-decoration: underline;
        }
      }
    }
    .info-bd {
      margin-top: 2px;
      font-size: 12px;
      .tab-title {
        display: flex;
        align-items: center;
        .item-tab {
          padding: 6px 22px;
          height: 100%;
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          &.active {
            border-bottom: 2px solid @color-primary;
          }
        }
      }
      .tab-main {
        padding: 15px;
        .list-group {
          margin-top: 10px;
          &:first-child {
            margin-top: 0;
          }
        }
        p {
          line-height: 1.8;
          &.c-blue {
            color: @color-primary;
          }
        }
      }
    }
  }
</style>
