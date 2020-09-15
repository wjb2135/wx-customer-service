<template>
  <div class="page-monitor-data">
    <div class="header">
      <div class="tabs">
        <i class="iconfont">&#xe6d4;</i>
        <ul>
          <li :class="pageType == 'public'?'active':''" @click="changePage('public')">公众号统计</li>
          <li :class="pageType == 'service'?'active':''" @click="changePage('service')">客服统计</li>
        </ul>
      </div>
      <div class="refresh">
        <ul>
          <li :class="time == 2?'active':''" @click="changeTime(2)">2s刷新</li>
          <li :class="time == 10?'active':''" @click="changeTime(10)">10s刷新</li>
          <li :class="time == 30?'active':''" @click="changeTime(30)">30s刷新</li>
          <li :class="time == 0?'active':''" @click="changeTime(0)">手动刷新</li>
        </ul>
      </div>
    </div>
    <div class="content">
      <div class="data-header">
        <div class="head">
          <p>{{showTitle}}</p>
        </div>
        <div class="body">
          <template v-if="pageType == 'public'">
            <div class="item">
              <p class="title">今日关注人数</p>
              <p class="number">{{publicInfo.follow_official_account}}</p>
            </div>
            <div class="item">
              <p class="title">今日取关人数</p>
              <p class="number">{{publicInfo.unfollow_official_account}}</p>
            </div>
            <div class="item">
              <p class="title">今日来访人数</p>
              <p class="number">{{publicInfo.visit_number}}</p>
            </div>
            <div class="item">
              <p class="title">今日总访问人数</p>
              <p class="number">{{publicInfo.sum_number}}</p>
            </div>
            <div class="item">
              <p class="title">今日转换人数</p>
              <p class="number">{{publicInfo.conversion_number}}</p>
            </div>
          </template>
          <template v-if="pageType == 'service'">
            <div class="item">
              <p class="title">今日会话数</p>
              <p class="number">{{serviceInfo.sum_session}}</p>
            </div>
            <div class="item">
              <p class="title">今日有效会话数</p>
              <p class="number">{{serviceInfo.effect_session}}</p>
            </div>
            <div class="item">
              <p class="title">今日留电话数</p>
              <p class="number">{{serviceInfo.leave_mobile}}</p>
            </div>
            <div class="item">
              <p class="title">今日主动邀请数</p>
              <p class="number">{{serviceInfo.Invitation_number}}</p>
            </div>
            <div class="item">
              <p class="title">今日错失会话数</p>
              <p class="number">{{serviceInfo.missed_session_count}}</p>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="data-content">
      <div class="head">
        <ul class="tabs">
          <li @click="changeShowType(1)" :class="showType == 1?'active':''">走势图</li>
          <li @click="changeShowType(2)" :class="showType == 2?'active':''">列表图</li>
        </ul>
        <div class="right">
          <el-button type="primary" size="mini" @click="exportEvent" :disabled="isExportEvent">导出</el-button>
          <searchBar :placeholder="nowPlaceholder" @keydownEnter="keydownEnter"></searchBar>
        </div>
      </div>
      <div class="body">
        <Public @isData="isData" ref="public" :name="nick_name" :showType="showType" v-if="pageType == 'public'"></Public>
        <Service @isData="isData" ref="service" :name="custom_service_name" :showType="showType" v-if="pageType == 'service'"></Service>
      </div>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar';
import Public from './public';
import Service from './service';
export default {
  components: {
    searchBar,
    Public,
    Service
  },
  data () {
    return {
      pageType: 'public',
      time: 2,
      publicTitle: '今日所有公众号访问人数的重要数据',
      serviceTitle: '今日所有客服的重要数据',
      showTitle: '',
      publicInfo: {},
      serviceInfo: {},
      publicPlaceholder: '请输入公众号名称',
      servicePlaceholder: '请输入客服名称',
      nowPlaceholder: '',
      showType: 1,
      timer: null,
      // 客服名称
      custom_service_name: '',
      // 公众号名称
      nick_name: '',
      isExportEvent: true
    };
  },
  created () {
    this.timer && clearTimeout(this.timer);
    // 初始化公众号的数据
    this.showTitle = this.publicTitle;
    this.nowPlaceholder = this.publicPlaceholder;
    this.getOfficial();
    this.changeTime(this.time);
  },
  destroyed () {
    clearTimeout(this.timer);
  },
  methods: {
    isData (flag) {
      this.isExportEvent = flag;
    },
    /**
     * 搜索
     */
    keydownEnter (val) {
      if (this.pageType === 'service') {
        this.custom_service_name = val
        this.$refs.service.allInit()
      } else {
        this.nick_name = val
        this.$refs.public.allInit()
      }
    },
    /**
     * 导出
     */
    exportEvent () {
      if (this.pageType === 'public') {
        this.officialCsv();
      } else {
        this.serviceCsv();
      }
    },
    createLink (val, name) {
      let csv = '\uFEFF' + val
      var blob = new Blob([csv], {
        type:
          'text/csv,charset=UTF-8'
      });
      // .csv,charset=ANSI,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel
      const url = window.URL.createObjectURL(blob);
      var filename = name + '.csv';
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /**
     * 客服列表表格导出
     */
    serviceCsv () {
      let params = {
        custom_service_name: this.custom_service_name
      }
      this.$http.post('/custom_service_statistics_export_csv', params).then(res => {
        this.createLink(res, '客服数据统计')
      });
    },
    /**
     * 公众号表格导出
     */
    officialCsv () {
      this.$http.post('/official_account_export_csv').then(res => {
        this.createLink(res, '公众号数据统计')
      });
    },
    /**
     * 走势图、列表图
     */
    changeShowType (type) {
      this.showType = type;
    },
    /**
     * 公众号统计、客服统计
     */
    changePage (type) {
      if (type === 'public') {
        this.getOfficial();
        this.showTitle = this.publicTitle;
        this.nowPlaceholder = this.publicPlaceholder;
      } else {
        this.getService();
        this.showTitle = this.serviceTitle;
        this.nowPlaceholder = this.servicePlaceholder;
      }
      this.pageType = type;
      clearTimeout(this.timer);
      this.changeTime(this.time);
    },
    /**
     * 获取公众号统计数据
     */
    getOfficial () {
      return this.$http.get('/official_account_statistics').then(res => {
        this.publicInfo = res.data;
      });
    },
    /**
     * 获取客服统计数据
     */
    getService () {
      return this.$http.get('/custom_service_statistics').then(res => {
        this.serviceInfo = res.data;
      });
    },
    /**
     * 轮询
     */
    timerEvent () {
      this.timer = setTimeout(async () => {
        if (this.pageType === 'public') {
          await this.getOfficial();
        } else if (this.pageType === 'service') {
          await this.getService();
        }
        if (this.time > 0) {
          this.timerEvent();
        }
      }, this.time * 1000);
    },
    /**
     * 改变轮询时间
     */
    changeTime (s) {
      clearTimeout(this.timer);
      this.time = s;
      this.timerEvent();
    }
  }
};
</script>

<style lang="less" scoped>
.page-monitor-data {
  height: 100%;
  .data-content {
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 3px 16px 0;
    background-color: @color-white;
    border-radius: @border-radius-base;
    min-height: calc(100% - 218px);
    .head {
      display: flex;
      justify-content: space-between;
      height: 50px;
      border-bottom: 1px solid @border-color;
      align-items: center;
      .tabs {
        li {
          display: inline-block;
          font-size: @font-size-base;
          color: #464c54;
          border-bottom: 2px solid transparent;
          height: 50px;
          line-height: 50px;
          margin-right: 25px;
          cursor: pointer;
          &.active {
            border-bottom-color: @color-primary;
          }
        }
      }
      .right {
        display: flex;
        button {
          margin-right: 16px;
          width: 80px;
        }
      }
    }
    .body {
      height: calc(100% - 73px);
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
  .content {
    padding: 3px 16px 0;
    background-color: @color-white;
    border-radius: @border-radius-base;
    .data-header {
      .head {
        border-bottom: 1px solid @border-color;
        p {
          line-height: 44px;
          font-size: @font-size-base;
          color: #464c54;
        }
      }
      .body {
        display: flex;
        align-items: center;
        padding: 30px 0;
        .item {
          flex: 1 0 20%;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 50px;
          border-right: 1px solid @border-color;
          &:last-child {
            border-right: none;
          }
          .title {
            font-size: @font-size-bigger;
            color: #464c54;
            line-height: 1;
          }
          .number {
            line-height: 1;
            font-size: 20px;
            color: @color-primary;
          }
        }
      }
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 13px;
    .tabs,
    .refresh {
      height: 17px;
      line-height: 1;
      i {
        color: @color-primary;
      }
      ul {
        display: inline-block;
        li {
          display: inline-block;
          padding: 0 12px;
          border-right: 1px solid #ccc;
          color: #464c54;
          font-size: @font-size-big;
          cursor: pointer;
          &.active {
            color: @color-primary;
            font-weight: bold;
          }
          &:last-child {
            padding-right: 0;
            border-right: none;
          }
        }
      }
    }
  }
}
</style>