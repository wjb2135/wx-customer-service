<template>
  <div class="page-history-list">
    <div class="title">
      <div class="left">
        <!-- 视图 -->
        <div class="view-select">
          <el-select v-model="nowView" size="mini" placeholder="请选择" @change="selectView">
            <el-option-group>
              <el-option
                v-for="item in viewArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-option-group>
          </el-select>
        </div>
        <!-- 对话  -->
        <div class="history-select">
          <el-select
            size="mini"
            v-model="nowDate"
            @visible-change="select"
            placeholder="标签搜索"
            ref="labelSelect"
          >
            <el-option-group
              v-for="group in dateOptions"
              :key="group.label"
              :label="group.options == undefined? '':group.label"
            >
              <template v-if="group.options == undefined">
                <el-option :key="group.value" :label="group.label" :value="group.value"></el-option>
              </template>
              <template v-else>
                <el-option
                  v-for="item in group.options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </template>
            </el-option-group>
          </el-select>
        </div>
      </div>
      <div class="right">
        <el-button size="mini" type="primary" :disabled="total<=0" @click="exportEvent">导出</el-button>
        <div v-show="nowView === '2' || nowView === '3'">
          <slot name="extend"></slot>
        </div>
      </div>
    </div>
    <div class="content" v-loading="loading">
      <!-- 公众号 -->
      <official v-if="nowView === '1'" :data="tableData"></official>
      <!-- 访客 -->
      <visitor v-if="nowView === '2'" @changeId="changeId" :data="tableData"></visitor>
      <!-- 会话 -->
      <session v-if="nowView === '3'" @changeId="changeId" :data="tableData"></session>
      <!-- 日 -->
      <day v-if="nowView === '4'" :data="tableData"></day>
      <!-- 小时 -->
      <incTime v-if="nowView === '5'" :data="tableData"></incTime>
      <!-- 来源 -->
      <incSource v-if="nowView === '6'" :data="tableData"></incSource>
      <!-- 客服 -->
      <service v-if="nowView === '7'" :data="tableData"></service>
    </div>
    <!-- 分页 -->
    <div class="page">
      <template v-if="nowView === '2' || nowView === '3'">
        <el-pagination
          :current-page="currentPage"
          @current-change="currentChange"
          :page-size="pageSize"
          layout="prev, pager, next,total"
          :total="total"
        ></el-pagination>
      </template>
      <div class="info" v-else>
        <span>会话数: {{ statistics.session_count }} </span>
        <span>访客数: {{ statistics.clients_count }} </span>
        <span>首次来访数: {{ statistics.first_count }} </span>
        <span v-if="nowView !== '7'">取消关注数: {{ statistics.unfollow_count }} </span>
        <span v-if="nowView === '7'">有效会话数: {{ statistics.effect_session_count }} </span>
        <span>电话数: {{ statistics.leave_mobile_count }} </span>
      </div>
    </div>
  </div>
</template>

<script>
import visitor from '../inc/visitor';
import official from '../inc/official';
import session from '../inc/session';
import day from '../inc/day';
import incTime from '../inc/time';
import incSource from '../inc/source';
import service from '../inc/service';
export default {
  components: {
    visitor,
    official,
    session,
    day,
    incTime,
    incSource,
    service
  },
  data () {
    return {
      // 统计数据
      statistics: {
        session_count: 0,
        clients_count: 0,
        first_count: 0,
        unfollow_count: 0,
        leave_mobile_count: 0,
        effect_session_count: 0
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      currentId: 0,
      nowDate: '',
      nowView: '2',
      viewArr: [
        // 视图选择
        {
          value: '1',
          label: '公众号视图'
        },
        {
          value: '2',
          label: '访客视图'
        },
        {
          value: '3',
          label: '会话视图'
        },
        {
          value: '4',
          label: '日访问量视图'
        },
        {
          value: '5',
          label: '小时访问量视图'
        },
        {
          value: '6',
          label: '访客来源视图'
        },
        {
          value: '7',
          label: '客服视图'
        }
      ],
      dateOptions: [
        // 日期选择
        {
          value: '自定义',
          label: '自定义'
        },
        {
          label: '默认收藏',
          options: [
            {
              value: '1',
              label: '今天-全部对话'
            },
            {
              value: '2',
              label: '今天-有效对话'
            },
            {
              value: '3',
              label: '今天-留言对话'
            },
            {
              value: '4',
              label: '昨天-全部对话'
            },
            {
              value: '5',
              label: '昨天-有效对话'
            },
            {
              value: '6',
              label: '昨天-留言对话'
            },
            {
              value: '7',
              label: '前天-全部对话'
            },
            {
              value: '8',
              label: '前天-有效对话'
            },
            {
              value: '9',
              label: '前天-留言对话'
            }
          ]
        },
        {
          label: '我的收藏',
          options: []
        }
      ],
      beginTime: '',
      endTime: '',
      // 标签搜索
      tagSearchflag: false,
      // 默认的标签搜索
      defaultFlag: false,
      // 会话类型 0 全部、1 有限 2 留言
      sessionType: 0,
      url: 'user.get_sh_history_list',
      exportUrl: 'user.sh_export_csv',
      exportName: '访客视图',
      loading: false,
      dialogParams: {}
    };
  },
  created () {
    let obj = this.getTime();
    this.beginTime = obj.beginTime;
    this.endTime = obj.endTime;
    this.nowDate = '1';
    this.getHistoryList();
    this.getSearchList();
    this.$ipcOn('refreshVisitorList', (event, val) => {
      if (val.id) {
        this.tagSearchflag = true;
        this.defaultFlag = false;
        this.nowDate = val.id;
      } else {
        this.tagSearchflag = false;
        this.nowDate = '自定义';
      }
      this.getHistoryList(val);
    });
    this.$ipcOn('refreshSearchList', (event, val) => {
      this.getSearchList();
    });
  },
  methods: {
    createLink (val, name) {
      let csv = '\uFEFF' + val
      var blob = new Blob([csv], {
        type:
          'text/plain;charset=utf-8'
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
     * 导出
     */
    exportEvent () {
      if (this.loading) return
      let params = {
        pagesize: this.pageSize,
        page: this.currentPage,
        begin_time: this.beginTime,
        end_time: this.endTime
      };
      if (this.tagSearchflag) {
        // 标签搜索-去掉默认时间
        if (!this.defaultFlag) {
          'begin_time' in params && delete params.begin_time;
          'end_time' in params && delete params.end_time;
          Object.assign(params, { id: this.nowDate });
        } else {
          // 会话类型
          Object.assign(params, { session_type: this.sessionType, sex: -1 });
        }
      } else {
        // 自定义搜索的参数
        Object.assign(params, this.dialogParams);
      }
      this.$http.post(this.exportUrl, params).then(res => {
        this.createLink(res, this.exportName)
      })
    },
    /**
     * 获取我的收藏标签列表
     */
    getSearchList () {
      this.dateOptions[2].options = [];
      this.$http
        .get('/user.search_list')
        .then(res => {
          res.data.search_list.forEach(item => {
            this.dateOptions[2].options.push({
              value: item.id,
              label: item.name
            });
          });
        })
        .catch(() => {});
    },
    /**
     * @number 天数
     * 1 昨天
     * 2 前天
     * 默认当天时间
     */
    getTime (number = '') {
      let someDayTime = 0;
      let date = new Date();
      let day = `${date.getFullYear()}-${date.getMonth() +
        1}-${date.getDate()}`;
      let dayTime = new Date(day).getTime();
      let beginTime = 0;
      let endTime = 0;
      let oneDayTime = 24 * 60 * 60 * 1000;
      if (number === '') {
        beginTime = this.formatTime(dayTime);
        endTime = this.formatTime(dayTime + oneDayTime - 1000);
      } else {
        someDayTime = 24 * 60 * 60 * 1000 * number;
        beginTime = this.formatTime(dayTime - someDayTime);
        endTime = this.formatTime(dayTime - someDayTime + oneDayTime - 1000);
      }
      let obj = {
        beginTime,
        endTime
      };
      return obj;
    },
    /**
     * 时间格式转换
     */
    formatTime (time) {
      return this.$utilscore.formatTime(time, 'YYYY-MM-DD hh:mm:ss');
    },
    /**
     * 选择
     */
    changeUser (currentRow, oldCurrentRow) {
      if (!oldCurrentRow || currentRow.id !== oldCurrentRow.id) {
        this.currentId = currentRow.id;
        this.$emit('changeId', this.currentId);
      }
    },
    changeId (id) {
      this.$emit('changeId', id);
    },
    /**
     * 获取历史列表
     */
    getHistoryList (val = {}) {
      if (this.loading) return
      this.dialogParams = val
      this.loading = true;
      let params = {
        pagesize: this.pageSize,
        page: this.currentPage,
        begin_time: this.beginTime,
        end_time: this.endTime
      };
      if (this.tagSearchflag) {
        // 标签搜索-去掉默认时间
        if (!this.defaultFlag) {
          'begin_time' in params && delete params.begin_time;
          'end_time' in params && delete params.end_time;
          Object.assign(params, { id: this.nowDate });
        } else {
          // 会话类型
          Object.assign(params, { session_type: this.sessionType, sex: -1 });
        }
      } else {
        // 自定义搜索的参数
        Object.assign(params, val);
      }
      this.total = 0;
      this.$http
        .post(this.url, params)
        .then(res => {
          this.loading = false;
          if (this.nowView === '2' || this.nowView === '3') {
            if (res.data.list_count > 0) {
              console.log(res.data.list, 'list');
              this.tableData = res.data.list;
              this.$emit('changeId', this.tableData[0].id);
            } else {
              this.tableData = [];
            }
            this.total = res.data.list_count;
          } else {
            this.tableData = res.data;
            this.statistics = {
              session_count: 0,
              clients_count: 0,
              first_count: 0,
              unfollow_count: 0,
              leave_mobile_count: 0,
              effect_session_count: 0
            }
            res.data.forEach((item) => {
              this.statistics.session_count += item.session_count
              this.statistics.clients_count += item.clients_count
              this.statistics.first_count += item.first_count
              this.statistics.unfollow_count += item.unfollow_count
              this.statistics.leave_mobile_count += item.leave_mobile_count
              this.statistics.effect_session_count += item.effect_session_count
            })
            this.total = res.data.length;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    /**
     * 自定义弹窗
     */
    setWindow () {
      this.newWindows('/dialog/filter', { width: 780, height: 480 });
    },
    /**
     * 改变视图
     */
    selectView () {
      switch (this.nowView) {
        case '1':
          this.url = 'user.weixin_account_view';
          this.exportUrl = 'user.weixin_account_export_csv';
          this.exportName = '公众号视图'
          break;
        case '2':
          this.url = 'user.get_sh_history_list';
          this.exportUrl = 'user.sh_export_csv';
          this.exportName = '访客视图'
          break;
        case '3':
          this.url = 'user.get_sh_history_list';
          this.exportUrl = 'user.session_export_csv';
          this.exportName = '会话视图'
          break;
        case '4':
          this.url = 'user.day_access_view ';
          this.exportUrl = 'user.day_access_export_csv';
          this.exportName = '日访问量视图'
          break;
        case '5':
          this.url = 'user.time_access_view';
          this.exportUrl = 'user.time_access_export_csv';
          this.exportName = '小时访问量视图'
          break;
        case '6':
          this.url = 'user.source_view';
          this.exportUrl = 'user.source_export_csv';
          this.exportName = '来源视图'
          break;
        case '7':
          this.url = 'user.custom_service_view';
          this.exportUrl = 'user.custom_service_export_csv';
          this.exportName = '客服视图'
          break;
      }
      this.$emit('changeId', '');
      this.currentPage = 1;
      this.tableData = [];
      this.getHistoryList();
    },
    select (flag) {
      if (flag) {
        return;
      }
      this.tagSearchflag = true;
      this.$emit('changeId', '');
      this.currentPage = 1;
      this.tableData = [];
      if (this.nowDate === '自定义') {
        this.$refs.labelSelect.blur();
        this.setWindow();
      } else if (typeof this.nowDate === 'string') {
        this.defaultFlag = true;
        let day = parseInt(this.nowDate);
        day = day <= 3 ? '' : day <= 6 ? 1 : 2;
        switch (this.nowDate) {
          case '1':
          case '4':
          case '7':
            this.sessionType = 0;
            break;
          case '2':
          case '5':
          case '8':
            this.sessionType = 1;
            break;
          case '3':
          case '6':
          case '9':
            this.sessionType = 2;
            break;
        }
        let obj = this.getTime(day);
        this.beginTime = obj.beginTime;
        this.endTime = obj.endTime;
        this.getHistoryList();
      } else {
        this.defaultFlag = false;
        this.getHistoryList();
      }
    },
    /**
     * 分页
     */
    currentChange (page) {
      this.currentPage = page;
      this.getHistoryList();
    }
  }
};
</script>
<style lang="less" scoped>
.page-history-list {
  height: 100%;
  width: 100%;
  border-right: 1px solid @border-color;
  .page {
    height: 40px;
    .el-pagination {
      display: flex;
      align-items: center;
      height: 100%;
    }
    .info{
      padding: 0 10px;
      display: flex;
      align-items: center;
      height: 100%;
      line-height: 1;
      span{
        margin-right: 10px;
      }
    }
  }
  .visitor-table {
    font-size: @font-size-base;
    .name {
      color: @color-primary;
    }
    .public {
      color: #24272b;
      line-height: 20px;
    }
    .service {
      color: #87929f;
      line-height: 20px;
    }
  }

  .title {
    padding: 10px 17px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebeef5;
    .right {
      display: flex;
      align-items: center;
    }
    .left {
      display: flex;
      color: #24272b;
      font-size: @font-size-base;
      .view-select {
        width: 135px;
        margin-right: 10px;
      }
      .history-select {
        width: 168px;
      }
      p {
        margin-right: 25px;
        cursor: pointer;
      }
    }
  }
  .content {
    height: calc(100% - 90px);
    width: 100%;
  }
}
</style>