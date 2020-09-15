<template>
  <div class="page-invite-send" v-loading="loading">
    <div class="table">
      <div class="content" >
        <el-table
          stripe
          ref="multipleTable"
          :data="tableData"
          highlight-current-row
          tooltip-effect="dark"
          class="fw-table visitor-table"
          size="mini"
          @current-change="userChange"
        >
          <el-table-column label="任务名称" show-overflow-tooltip>
            <template slot-scope="scope">
              <p class="name">{{ scope.row.title }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="开始时间"></el-table-column>
          <el-table-column prop="count" label="公众号数量" width="100">
            <template>
              <p class="name">1</p>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="任务状态" width="100">
            <template slot-scope="scope">
              <p class="name">{{ scope.row.status === 0?'发送中':'发送完成' }}</p>
            </template>
          </el-table-column>
          <el-table-column label="创建人" width="100">
            <template slot-scope="scope">
              <p
                class="name"
              >{{ scope.row.custom_service.realname || scope.row.custom_service.nickname }}</p>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="page">
        <el-pagination
          :current-page="currentPage"
          @current-change="currentChange"
          :page-size="pageSize"
          layout="prev, pager, next,total"
          :total="total"
        ></el-pagination>
      </div>
    </div>
    <div class="info" v-if="Object.keys(nowUserInfo).length>0">
      <div class="other-info">
        <div class="block">
          <p class="title">任务名称</p>
          <div class="content">
            <p class="task">{{nowUserInfo.title}}</p>
          </div>
        </div>
        <div class="block">
          <p class="title">筛选条件</p>
          <div class="content">
            <!-- <span class="label">访客类型: 有效沟通</span>
            <span class="label">访客来源: 默认二维码</span>
            <span class="label">公众号: 老司机聊程序</span>
            <span class="label">联系方式: 电话、微信、QQ</span>-->
            <span>{{nowUserInfo.conditions}}</span>
          </div>
        </div>
        <div class="block">
          <p class="title">消息内容</p>
          <div class="content">
            <mediaType :editAble="false" :clearAble="false" :data="nowUserInfo.content"></mediaType>
          </div>
        </div>
        <div class="block">
          <p class="title">发送时间和状态</p>
          <div class="content">
            {{nowUserInfo.created_at}}
            <template v-if="nowUserInfo.status === 0">发送中</template>
            <template v-if="nowUserInfo.status === 1">发送完成</template>
          </div>
        </div>
      </div>
      <div class="public-account">
        <p class="title">群发公众号</p>
        <div class="content">
          <el-table
            stripe
            :data="Object.values(nowUserInfo.result)"
            tooltip-effect="dark"
            class="fw-table visitor-table border-table"
            size="mini"            
          >
            <el-table-column prop="nick_name" label="公众号" width="120"></el-table-column>
            <el-table-column prop="send_count" label="发送人数"></el-table-column>
            <el-table-column prop="success_count" label="成功人数"></el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mediaType from '@/components/mediaType/index';
export default {
  components: {
    mediaType
  },
  data () {
    return {
      currentPage: 1,
      tableData: [],
      pageSize: 20,
      total: 0,
      nowUserInfo: {},
      loading: false
    };
  },
  created () {
    this.getTaskList();
  },
  methods: {
    /**
     * 当前
     */
    userChange (val) {
      this.nowUserInfo = val;
    },
    currentChange (page) {
      this.currentPage = page;
      this.getTaskList();
    },
    getTaskList (val) {
      if (this.loading) {
        return
      }
      this.loading = true;
      let obj = val || {}
      let params = {
        pagesize: this.pageSize,
        page: this.currentPage,
        ...obj
      };
      this.$http.post('/res.task', params).then(res => {
        this.total = res.data.total;
        if (res.data.data.length > 0) {
          this.tableData = res.data.data;
          this.userChange(this.tableData[0]);
        } else {
          this.tableData = [];
          this.userChange({});
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    }
  }
};
</script>
<style lang="less">
.page-invite-send {
  .el-table.border-table {
    border-top: 1px solid @border-color;
  }
}
</style>

<style lang="less" scoped>
.page-invite-send {
  display: flex;
  height: 100%;
  .table {
    flex: 1 1 auto;
    border-right: 1px solid @border-color;
    min-width: 30%;
    .content {
      height: calc(100% - 50px);
      width: 100%;
    }
    .page {
      height: 50px;
      display: flex;
      align-items: center;
    }
  }

  .info {
    flex: 0 0 300px;
    width: 300px;
    height: 100%;
    overflow: auto;
    .public-account {
      .title {
        font-size: @font-size-base;
        color: #87929f;
        line-height: 1;
        padding: 0 10px;
      }
      .content {
        padding-top: 11px;
      }
    }
    .other-info {
      padding: 16px 10px;
      .block {
        margin-bottom: 27px;
        .title {
          font-size: @font-size-base;
          color: #87929f;
          line-height: 1;
        }
        .content {
          font-size: @font-size-base;
          color: #24272b;
          line-height: 18px;
          padding-top: 11px;
          .label {
            display: inline-block;
            padding: 9px 8px 8px;
            background-color: #f7f9f9;
            margin-bottom: 10px;
            &:last-child {
              margin-bottom: 0;
            }
          }
          .task {
            padding-top: 3px;
            font-weight: bold;
            font-size: @font-size-bigger;
            color: #24272b;
          }
        }
      }
    }
  }
}
</style>