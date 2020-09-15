<template>
  <div class="page-visitor-list">
    <div class="title">
      <div class="title-l">
        <p @click="openWinSetVisitorTag">设置标签</p>
        <p @click="setService" v-if="this.isManage !== 0 ">设置客服</p>
      </div>
      <div class="title-r">
        <el-button size="mini" @click="inviteWindow" v-if="batchInvite && activeInvite">邀请</el-button>
        <slot name="extend"></slot>
      </div>
    </div>
    <div class="content">
      <el-table
        stripe
        :data="tableData"
        highlight-current-row
        tooltip-effect="dark"
        class="visitor-table fw-table"
        size="mini"
        @current-change="changeUser"
        @selection-change="handleSelectionChange"
        ref="visitorTable"
        v-loading="loading"
      >
        <el-table-column type="selection" width="50" v-if="batchInvite && activeInvite"></el-table-column>
        <el-table-column prop="weixin_account_name" label="公众号" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column label="访客名称" width="100" show-overflow-tooltip>
          <template slot-scope="scope">
            <span
              style="text-decoration:underline;cursor: pointer;"
              @click="sessionWindow(scope.row.id)"
            >{{ scope.row.name || scope.row.nickname}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sex" label="性别" width="50">
          <template slot-scope="scope">
            <span v-if="scope.row.sex === 1">男</span>
            <span v-else-if="scope.row.sex === 2">女</span>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="120"></el-table-column>
        <el-table-column prop="wechat" label="微信号" width="100"></el-table-column>
        <el-table-column label="备注" width="120" show-overflow-tooltip>
          <template slot-scope="scope">
            <div class="remark" :title="scope.row.remark">{{scope.row.remark}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="custom_service_nickname" label="所属客服" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="chat_nums" label="会话次数" width="100"></el-table-column>
        <el-table-column prop="subscribe_status_str" label="访客状态" width="120"></el-table-column>
        <el-table-column prop="sh_type" label="访客类型"  width="130"  show-overflow-tooltip></el-table-column>
        <el-table-column prop="tag" label="标签" width="220">
          <template slot-scope="scope">
            <div class="tagName">
              <span
                :title="item.name"
                v-for="item in scope.row.tag_array"
                class="label"
                :key="item.id"
              >{{item.name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="source_name" label="访客来源" width="120"></el-table-column>
        <el-table-column label="地址" width="120" show-overflow-tooltip>
          <template slot-scope="scope">{{scope.row.country}}{{scope.row.province}}{{scope.row.city}}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="首次来访时间" width="150"></el-table-column>
        <el-table-column prop="last_operation_time" label="最后来访时间" width="150"></el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="page">
      <el-pagination
        small
        :current-page="currentPage"
        @current-change="currentChange"
        :page-size="pageSize"
        layout="prev, pager, next,total"
        :total="total"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  props: {
    obj: [Object],
    default: {}
  },
  data () {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      multipleSelection: [],
      currentId: '',
      selectedList: [],
      win: 0,
      ids: [],
      isManage: this.$store.state.user.baseUserInfo.is_manage,
      loading: false,
      wx_appid: ''
    };
  },
  created () {
    this.getList();
    // 监听聊天窗口
    this.$ipcOn('hasCreatedNewSessionWin', (event, val) => {
      this.$store.dispatch('setHasCreatedSessionWin', val);
    });
    this.$ipcOn('refreshUserInfo', (event, val) => {
      this.getList()
    });
  },
  methods: {
    ...mapActions([
      'setNewUser',
      'setVisitorUserList',
      'setHasCreatedSessionWin'
    ]),
    // 设置标签
    openWinSetVisitorTag () {
      if (this.selectedList.length > 0) {
        this.newWindows(`/session/setVisitorTag?ids=${this.ids}`, {
          width: 660,
          height: 600
        });
      } else {
        this.$message.error('请至少选中一个访客');
      }
    },
    // 设置客服
    setService () {
      if (this.wx_appid.length >= 2) {
        this.$message.error('不可同时选择不同公众号下的访客');
        return;
      }
      if (this.isManage === 0) {
        return;
      }
      if (this.selectedList.length > 0) {
        this.newWindows(`/dialog/service?ids=${this.ids}&wx_appid=${this.wx_appid}`, {
          width: 660,
          height: 600
        });
      } else {
        this.$message.error('请至少选中一个访客');
      }
    },
    setCurrent () {
      this.$refs.visitorTable.setCurrentRow(this.tableData[0]);
    },
    /**
     * 选择
     */
    changeUser (currentRow, oldCurrentRow) {
      if (
        currentRow &&
        (!oldCurrentRow || currentRow.id !== oldCurrentRow.id)
      ) {
        this.currentId = currentRow.id;
        this.$emit('changeId', this.currentId);
      }
    },
    /**
     * 获取访客列表
     */
    getList () {
      if (this.loading) {
        return
      }
      this.loading = true;
      let params = {
        ...this.obj,
        page: this.currentPage,
        pagesize: this.pageSize
      };
      this.$http
        .post('/user.get_all_sh_list', params)
        .then(res => {
          if (res.data.list.length > 0) {
            this.tableData = res.data.list;
            this.total = res.data.list_count;
            this.$emit('changeId', this.tableData[0].id);
            this.setCurrent();
          } else {
            this.tableData = [];
            this.total = 0;
            this.$emit('changeId', '');
          }
          this.loading = false;
        })
        .catch(err => {
          console.log(err, 'log内容');
          this.loading = false;
        });
    },
    /**
     * 分页
     */
    currentChange (page) {
      this.currentPage = page;
      this.getList();
    },
    /**
     * 表格多选
     */
    handleSelectionChange (val) {
      this.setVisitorUserList(val);
      this.selectedList = val;
      this.ids = [];
      let wxAppid = []
      for (let item of this.selectedList) {
        this.ids.push(item.id)
        if (!wxAppid.includes(item.wx_appid)) {
          wxAppid.push(item.wx_appid)
        }
      }
      this.wx_appid = wxAppid
      this.ids = this.ids.join(',')
    },
    /**
     * 邀请 至少选中一个
     */
    inviteWindow () {
      if (this.selectedList.length > 0) {
        this.newWindows('/dialog/invite', { width: 660, height: 600 });
      } else {
        this.$message.error('请至少选中一个访客');
      }
    },
    // 新窗口会话
    sessionWindow (id) {
      if (this.hasCreatedSessionWin) {
        this.$store.dispatch('setNewUser', id);
      } else {
        this.newWindows('/session/new?id=' + id, {
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
  watch: {
    obj () {
      this.currentPage = 1;
      this.getList();
    }
  },
  computed: {
    ...mapGetters({
      hasCreatedSessionWin: 'hasCreatedSessionWin',
      baseUserInfo: 'baseUserInfo'
    }),
    // 批量邀请
    batchInvite () {
      return this.baseUserInfo.position.power.service.includes('batch_invite');
    },
    // 邀请
    activeInvite () {
      return this.baseUserInfo.position.power.service.includes('active_invite');
    }
  }
};
</script>
<style lang="less" scoped>
.page-visitor-list {
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
  }
  .title {
    padding: 10px 17px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #ebeef5;
    .title-l {
      color: #24272b;
      font-size: @font-size-base;
      p {
        display: inline-block;
        margin-right: 25px;
        cursor: pointer;
        &.disabled{
          cursor: not-allowed;
        }
      }
    }
    .title-r {
      display: flex;
      align-items: center;
    }
    .item-op {
      margin-right: 25px;
      cursor: pointer;
      display: inline-block;
    }
  }
  .content {
    height: calc(100% - 90px);
    width: 100%;
  }
  .label {
    display: inline-block;
    background-color: #f7f9f9;
    color: #87929f;
    font-size: 14px;
    line-height: 25px;
    padding: 0 7px;
    margin-right: 5px;
  }
  .remark,
  .tagName {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>