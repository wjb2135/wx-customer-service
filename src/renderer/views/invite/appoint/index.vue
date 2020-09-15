<template>
  <div class="page-invite-appoint">
    <div class="appoint-title">
      <div class="filter">
        <!-- 状态 -->
        <div class="block">
          <el-select size="mini" v-model="status" placeholder="请选择">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <!-- 时间 -->
        <div class="block">
          <el-select size="mini" v-model="date" placeholder="请选择" @change="changeDate">
            <el-option
              v-for="item in dateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <!-- 自定义时间 -->
        <div class="block date-block" v-show="dateShow">
          <el-date-picker size="mini" v-model="beginTime" type="datetime" placeholder="开始日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </div>
        <div class="block date-block" v-show="dateShow">
          <el-date-picker size="mini" v-model="endTime" type="datetime" placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss"></el-date-picker>
        </div>
      </div>
      <div class="search">
        <div class="search-block">
          <searchBar placeholder="搜索主题" @setKeyWord="setKeyWord" @keydownEnter="keydownEnter"></searchBar>
        </div>
        <div class="block btn-block">
          <el-button type="primary" size="mini" @click="search">搜索</el-button>
        </div>
      </div>
    </div>
    <div class="appoint-content">
      <div class="table-main">
        <div class="table-box">
          <el-table
            stripe
            :data="tableData"
            highlight-current-row
            tooltip-effect="dark"
            class="fw-table visitor-table"
            size="mini"
            @current-change="userChange"
            v-loading="loading"
          >
            <el-table-column label="被邀请人" show-overflow-tooltip width="100">
              <template slot-scope="scope">
                <p
                  class="name"
                >{{ scope.row.clients && (scope.row.clients.nickname || scope.row.clients.other_name) }}</p>
              </template>
            </el-table-column>
            <el-table-column label="邀请客服" show-overflow-tooltip width="80">
              <template slot-scope="scope">
                <p
                  class="name"
                >{{ scope.row.custom_service && (scope.row.custom_service.realname || scope.row.custom_service.nickname) }}</p>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="邀请主题" width="200" show-overflow-tooltip></el-table-column>
            <el-table-column prop="created_at" label="邀请时间" width="180"></el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                <p class="name" v-if="scope.row.result === 0">邀请中</p>
                <p class="name" v-if="scope.row.result === 1">邀请成功</p>
                <p class="name" v-if="scope.row.result === 2">邀请失败</p>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="table-page">
          <el-pagination
            :current-page="page"
            @current-change="currentChange"
            :page-size="pageSize"
            layout="prev, pager, next,total"
            :total="total"
          ></el-pagination>
        </div>
      </div>
      <div class="table-info" v-if="Object.keys(nowUserInfo).length>0">
        <div class="info-content">
          <div class="block">
            <p class="title">被邀请人</p>
            <div
              class="content"
            >{{ nowUserInfo.clients.nickname || nowUserInfo.clients.other_name }}</div>
          </div>
          <div class="block">
            <p class="title">邀请客服</p>
            <div
              class="content"
            >{{ nowUserInfo.custom_service.realname || nowUserInfo.custom_service.nickname }}</div>
          </div>
          <div class="block">
            <p class="title">邀请主题</p>
            <div class="content">{{ nowUserInfo.title}}</div>
          </div>
          <div class="block">
            <p class="title">内容</p>
            <div class="content elements">
              <mediaType :editAble="false" :clearAble="false" :data="formChat"></mediaType>
            </div>
          </div>
          <div class="block">
            <p class="title">发送时间</p>
            <div class="content">{{ nowUserInfo.send_time}}</div>
          </div>
          <div class="block">
            <p class="title">创建时间</p>
            <div class="content">{{ nowUserInfo.created_at}}</div>
          </div>
          <div class="block">
            <p class="title">状态</p>
            <div class="content">
              <p class="name" v-if="nowUserInfo.result === 0">邀请中</p>
              <p class="name" v-if="nowUserInfo.result === 1">邀请成功</p>
              <p class="name" v-if="nowUserInfo.result === 2">邀请失败</p>
            </div>
          </div>
        </div>
        <div class="footer-btn">
          <el-button size="mini" type="danger" @click="del">删除邀请</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar.vue';
import mediaType from '@/components/mediaType/index';
export default {
  components: {
    searchBar,
    mediaType
  },
  data () {
    return {
      tableData: [],
      statusOptions: [
        {
          value: '-1',
          label: '全部'
        },
        {
          value: '0',
          label: '邀请中'
        },
        {
          value: '1',
          label: '成功'
        },
        {
          value: '2',
          label: '失败'
        }
      ],
      dateOptions: [
        {
          value: '全部',
          label: '全部'
        },
        {
          value: '自定义',
          label: '自定义'
        },
        {
          value: '今天',
          label: '今天'
        },
        {
          value: '昨天',
          label: '昨天'
        },
        {
          value: '前天',
          label: '前天'
        }
      ],
      // 日期
      date: '全部',
      // 状态
      status: '-1',
      // 主题
      theme: '',
      // 开始日期
      beginTime: '',
      // 结束日期
      endTime: '',
      pageSize: 20,
      page: 1,
      total: 0,
      nowUserInfo: {},
      loading: false,
      delLoading: false,
      // 显示日期选择器
      dateShow: false,
      formChat: {}
    };
  },
  created () {
    this.getList();
  },
  methods: {
    changeDate () {
      if (this.date === '自定义') {
        this.dateShow = true;
        return;
      } else if (this.date === '全部') {
        this.beginTime = ''
        this.endTime = ''
        this.dateShow = false;
        return;
      } else {
        this.dateShow = false;
      }
      let num = 0
      switch (this.date) {
        case '自定义':
          num = 0;
          break;
        case '今天':
          num = 1;
          break;
        case '昨天':
          num = 2;
          break;
        case '前天':
          num = 3;
          break;
      }
      let date = this.getTime(num)
      this.beginTime = date.beginTime
      this.endTime = date.endTime
    },
    /**
     * @number 天数
     * 1 昨天
     * 2 前天
     * 默认当天时间
     */
    getTime (number = '') {
      let someDayTime = 0;
      let date = new Date()
      let day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      let dayTime = new Date(day).getTime();
      let beginTime = 0
      let endTime = 0
      let oneDayTime = 24 * 60 * 60 * 1000
      if (number === '') {
        beginTime = this.formatTime(dayTime)
        endTime = this.formatTime(dayTime + oneDayTime - 1000)
      } else {
        someDayTime = 24 * 60 * 60 * 1000 * number
        beginTime = this.formatTime(dayTime - someDayTime)
        endTime = this.formatTime(dayTime - someDayTime + oneDayTime - 1000)
      }
      let obj = {
        beginTime,
        endTime
      }
      return obj;
    },
    /**
     * 时间格式转换
     */
    formatTime (time) {
      return this.$utilscore.formatTime(time, 'YYYY-MM-DD hh:mm:ss')
    },
    del () {
      if (this.delLoading && !this.nowUserInfo.id) {
        return;
      }
      this.delLoading = true;
      let params = {
        id: this.nowUserInfo.id
      };
      this.$http
        .post('/res.delete', params)
        .then(res => {
          this.$message.success('删除成功');
          this.delLoading = false;
          this.search();
        })
        .catch(() => {
          this.delLoading = false;
        });
    },
    /**
     * 搜索
     */
    search () {
      this.page = 1;
      this.getList();
    },
    /**
     * 当前
     */
    userChange (val) {
      if (val === null) return
      this.nowUserInfo = val;
      if (this.nowUserInfo.weixin_template) {
        this.formChat.type = 'wxTemplate';
        this.formChat.content = this.nowUserInfo;
      } else {
        this.formChat = this.nowUserInfo.content;
      }
    },
    currentChange (page) {
      this.page = page;
      this.getList();
    },
    keydownEnter (val) {
      this.theme = val;
      this.search()
    },
    setKeyWord (val) {
      this.theme = val;
    },
    getList () {
      if (this.loading) {
        return;
      }
      this.loading = true;
      let params = {
        title: this.theme,
        begin_time: this.beginTime,
        end_time: this.endTime,
        status: this.status,
        pagesize: this.pageSize,
        page: this.page
      };
      this.$http
        .post('/res.index', params)
        .then(res => {
          if (res.data.data.length > 0) {
            this.tableData = res.data.data;
            this.total = res.data.total;
            this.userChange(this.tableData[0]);
          } else {
            this.tableData = []
            this.total = 0;
            this.userChange({});
          }
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    }
  }
};
</script>
<style lang="less">
.date-block {
  .el-date-editor.el-input {
    .el-input__inner {
      padding-right: 0 !important;
    }
  }
}
</style>
<style lang="less" scoped>
.page-invite-appoint {
  height: 100%;
  .appoint-title {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @border-color;
    padding: 0 0 0 10px;
    .filter {
      flex: 1 0 auto;
      .block {
        display: inline-block;
        width: 118px;
        margin-right: 10px;
        &.date-block {
          width: 155px;
          .el-date-editor.el-input {
            width: 100%;
            .el-input__inner {
              padding-right: 0 !important;
            }
          }
        }
        &.btn-block {
          margin-right: 0;
          width: auto;
          float: right;
        }
      }
    }
    .search {
      flex: 0 1 300px;
      width: 300px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      .search-block {
        width: 210px;
      }
    }
  }
  .appoint-content {
    display: flex;
    height: calc(100% - 50px);
    .table-main {
      border-right: 1px solid @border-color;
      width: calc(100vw - 360px);
      .table-box {
        height: calc(100% - 50px);
        width: 100%;
      }
      .table-page {
        display: flex;
        align-items: center;
        height: 50px;
      }
    }
    .table-info {
      height: 100%;
      width: 300px;
      .footer-btn {
        display: flex;
        align-items: center;
        height: 50px;
        padding: 0 10px;
      }
      .info-content {
        height: calc(100% - 50px);
        overflow-x: hidden;
        overflow-y: auto;
        padding: 10px;
        .block {
          margin-bottom: 30px;
          .title {
            font-size: @font-size-base;
            color: #87929f;
            line-height: 1;
            margin-bottom: 8px;
          }
          .content {
            line-height: 22px;
            font-size: @font-size-bigger;
            color: #24272b;
            &.elements {
              font-size: @font-size-base;
            }
          }
        }
      }
    }
  }
}
</style>