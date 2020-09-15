<template>
  <div class="childwin-user-info">
    <main-head></main-head>
    <div class="info-hd">
      <div class="u-l-avatar">
        <img src="@assets/images/default-kf.jpg" alt="">
      </div>
      <div class="u-r-info">
        <div class="name">吴亦凡</div>
        <div class="fraction">45分</div>
        <div class="total">
          <span>2小时2分</span>
          <span @click="openSetPwd">修改密码</span>
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
            <p>昵称：客服二号</p>
            <p>账号：kf002@fxs.com</p>
          </div>
          <div class="list-group">
            <p>电话：15000000000</p>
            <p>公司：福州学识信息科技有限公司</p>
          </div>
          <div class="list-group">
            <p>部门：客服部</p>
            <p>职位：客服</p>
            <p>权限：普通客服</p>
          </div>
          <div class="list-group">
            <p>分配会话：分配</p>
            <p>禁止对外显示客服名称和头像</p>
            <p class="c-blue">最大接待访客数：10</p>
            <p class="c-blue">客服等级：1级客服</p>
            <p>服务时间：00:00 - 23:59</p>
          </div>
        </div>
        <div class="main-company" v-show="activeName == 'company'">
          <div class="list-group">
            <p>公司名称：福州学识信息科技有限公司</p>
          </div>
          <div class="list-group">
            <p>授权开始时间：2019年6月18号</p>
            <p>授权结束时间：2020年6月18号</p>
            <p>剩余时间：234天</p>
            <p>授权坐席：3</p>
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
      activeName: 'material'
    }
  },
  methods: {
    change (i) {
      this.activeName = i;
    },
    /**
     * 修改密码
     */
    openSetPwd () {
      this.newWindows('/setPwd', {width: 360, height: 400});
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
      padding-top: 0;
      background-color: @color-primary;
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
      }
    }
    .info-bd {
      margin-top: 2px;
      font-size: 12px;
      .tab-title {
        display: flex;
        background-color: @color-primary-light-3;
        color: #fff;
        height: 24px;
        align-items: center;
        .item-tab {
          padding: 0 10px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &.active {
            background-color: @color-primary;
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
