<template>
  <div class="page-monitor-index">
    <div class="monitor-header">
      <el-radio-group size="mini" v-model="tabs">
        <el-radio-button label="实时数据"></el-radio-button>
        <el-radio-button label="实时对话"></el-radio-button>
      </el-radio-group>
      <div class="info">
        <p class="item">
          <span class="count">{{statistics.waiting_reception}}</span>
          <span class="name">等待接收</span>
        </p>
        <p class="item">
          <span class="count">{{statistics.no_reception}}</span>
          <span class="name">未应答</span>
        </p>
        <p class="item">
          <span class="count primary">{{statistics.start_reception}}</span>
          <span class="name">正在接收</span>
        </p>
        <p class="item">
          <span class="count primary">{{statistics.online_clients}}</span>
          <span class="name">在线访客</span>
        </p>
        <p class="item">
          <span class="count primary">{{statistics.sum_clients}}</span>
          <span class="name">总访客数</span>
        </p>
      </div>
    </div>
    <div class="content">
      <Data v-if="tabs == '实时数据'"></Data>
      <Session v-if="tabs == '实时对话'"></Session>
    </div>
  </div>
</template>

<script>
import Data from './data';
import Session from './session';
export default {
  components: {
    Data,
    Session
  },
  data () {
    return {
      tabs: '实时数据',
      statistics: {}
    };
  },
  created () {
    this.getRealtimeStatistics()
  },
  methods: {
    getRealtimeStatistics () {
      this.$http.get('/realtime_statistics').then((res) => {
        this.statistics = res.data
      })
    }
  }
};
</script>
<style lang="less">
.page-monitor-index {
  .el-radio-button__inner {
    padding: 9px 15px !important;
  }
}
</style>
<style lang="less" scoped>
.page-monitor-index {
  padding: 30px;
  background-color: #f1f3f5;
  height: 100%;
  .content{
    height: calc(100% - 88px);
  }
  .monitor-header {
    display: flex;
    padding: 13px 10px 10px;
    background-color: @color-white;
    border-radius: @border-radius-base;
    justify-content: space-between;
    margin-bottom: 30px;
    .info {
      .item {
        display: inline-block;
        width: 60px;
        margin-right: 40px;
        text-align: left;
        &:last-child {
          margin-right: 0;
        }
        .count {
          display: block;
          font-size: 20px;
          color: #fa5b75;
          line-height: 14px;
          height: 14px;
          margin-bottom: 8px;
          &.primary {
            color: @color-primary;
          }
        }
        .name {
          display: block;
          color: #87929f;
          font-size: @font-size-small;
          line-height: 1;
        }
      }
    }
  }
}
</style>