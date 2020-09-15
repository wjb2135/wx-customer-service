<template>
  <div class="page-monitor-session">
    <div class="session-header">
      <div class="left">
        <el-checkbox v-model="hiddenSession">隐藏实时对话</el-checkbox>
        <el-checkbox v-model="closeSession">关闭实时对话</el-checkbox>
      </div>
      <div class="right visitor-select">
        <el-select
          v-model="labelSelect"
          filterable
          @visible-change="select"
          placeholder="标签搜索"
          ref="labelSelect"
        >
          <el-option-group
            v-for="group in options"
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
    <div class="session-body">
      <div class="left" v-show="!hiddenSession">
        <div class="header">
          <div class="left">
            <el-radio-group v-model="showType">
              <el-radio label="customer">只看访客</el-radio>
              <el-radio label="service">只看客服</el-radio>
              <el-radio label="all">查看全部</el-radio>
            </el-radio-group>
          </div>
          <div class="right">
            <el-button type="primary" size="mini" @click="clearRecord">清空</el-button>
          </div>
        </div>
        <div class="body">
          <chatRecord ref="chatRecord" :userId="id" :showType="showType" :realTime="closeSession"></chatRecord>
        </div>
      </div>
      <div class="right">
        <el-table
          :data="tableData"
          style="width: 100%"
          class="fw-table visitor-table"
          @current-change="currentChange"
          size="mini"
          stripe
          highlight-current-row
          tooltip-effect="dark"
        >
          <el-table-column label="会话序号" type="index" width="80"></el-table-column>
          <el-table-column prop="nickname" label="访客名称" width="180" show-overflow-tooltip></el-table-column>
          <el-table-column prop="wx_appid_name" label="公众号" width="180"></el-table-column>
          <el-table-column prop="position" label="地区" width="180"></el-table-column>
          <el-table-column prop="begin_time" label="开始时间" width="180"></el-table-column>
          <el-table-column prop="message_num" label="对话数量" width="90"></el-table-column>
          <el-table-column prop="times" label="来访次数" width="90"></el-table-column>
          <el-table-column prop="clients_status" label="访客状态" width="180"></el-table-column>
          <el-table-column prop="unanswered_time" label="未应答时间" width="180"></el-table-column>
          <el-table-column prop="average_response_time" label="平均响应时间" width="180"></el-table-column>
          <el-table-column prop="custom_name" label="接待客服" width="180"></el-table-column>
          <el-table-column prop="convert" label="会话" width="180"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import chatRecord from '@/components/chatRecord';
import searchBar from '@/components/searchBar';
export default {
  components: {
    chatRecord,
    searchBar
  },
  data () {
    return {
      hiddenSession: false,
      closeSession: false,
      onlyVisitor: false,
      onlyService: false,
      showAll: false,
      tableData: [],
      id: '',
      showType: 'all', // customer service all
      labelSelect: '',
      options: [
        {
          value: '自定义',
          label: '自定义'
        },
        {
          label: '我的收藏',
          options: []
        }
      ]
    };
  },
  created () {
    this.getShHistoryList()
    // 重新获取表格列表
    this.$ipcOn('refreshMonitorList', (event, val) => {
      this.getShHistoryList(val)
    })
    this.getSearchList()
    // 重新获取收藏夹列表
    this.$ipcOn('refreshMonitorSearchList', (event, val) => {
      this.getSearchList()
    })
  },
  methods: {
    /**
     * 标签的选中
     */
    select (flag) {
      if (flag) { return }
      if (this.labelSelect === '自定义') {
        this.$refs.labelSelect.blur();
        this.filterDialog();
      } else {
        let obj = {
          id: this.labelSelect
        };
        this.getShHistoryList(obj)
      }
    },
    /**
     * 清空聊天记录
     */
    clearRecord () {
      this.$refs.chatRecord.clearRecord()
    },
    /**
     * 改变当前聊天用户id
     */
    currentChange (currentRow) {
      this.id = currentRow.id
    },
    /**
     * 条件过滤弹窗
     */
    filterDialog () {
      this.newWindows('/monitor/filter', {width: 660, height: 540});
    },
    /**
     * 获取我的收藏标签列表
     */
    getSearchList () {
      this.options[1].options = [];
      this.$http
        .post('/user.search_list', {is_realtime: 1})
        .then(res => {
          res.data.search_list.forEach(item => {
            this.options[1].options.push({
              value: item.id,
              label: item.name
            });
          });
        })
        .catch(() => {
        });
    },
    /**
     * 获取表格列表
     */
    getShHistoryList (val = {}) {
      let params = {
        pagesize: 0
      }
      if (Object.keys(val).length > 0) {
        params = {...val, ...params}
      }
      this.$http.post('/user.get_sh_history_list', params).then((res) => {
        this.tableData = res.data.list || []
        this.id = this.tableData[0].id
      }).catch(() => {})
    }
  }
};
</script>

<style lang="less" scoped>
.page-monitor-session {
  background-color: @color-white;
  padding: 0 16px;
  border-radius: @border-radius-base;
  height: 100%;
  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    border-bottom: 1px solid @border-color;
    .right {
      display: flex;
      align-items: center;
      i {
        cursor: pointer;
        font-size: @font-size-large;
        color: #aeb8c4;
        margin-left: 17px;
      }
    }
  }
  .session-body {
    display: flex;
    height: calc(100% - 50px);
    & > .left {
      flex: 1 0 50%;
      height: 100%;
      border-right: 1px solid @border-color;
      width: 50%;
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 38px;
        border-bottom: 1px solid @border-color;
        padding-right: 16px;
        .left {
        }
        .right {
        }
      }
      .body {
        height: calc(100% - 38px);
      }
    }
    & > .right {
      flex: 1 0 50%;
      height: 100%;
      width: 50%;
    }
  }
}
</style>