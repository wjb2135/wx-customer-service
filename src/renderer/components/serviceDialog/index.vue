<template>
  <div class="service-dialog">
    <Dialog title="客服选择">
      <div class="content">
        <div class="search">
          <search-bar placeholder="搜索" @setKeyWord="setKeyWord"></search-bar>
        </div>
        <div class="table">
          <el-table
            :data="list"
            size="mini"
            highlight-current-row
            class="visitor-table fw-table"
            @current-change="currentChange"
          >
            >
            <el-table-column label="名称" prop="realname" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column label="部门" prop="department_name"></el-table-column>
            <el-table-column label="职务" prop="position_name" show-overflow-tooltip width="150"></el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scope">
                <span v-if="scope.row.online_status == 0">未登录</span>
                <span v-if="scope.row.online_status == 1">在线</span>
                <span v-if="scope.row.online_status == 2">离开</span>
                <span v-if="scope.row.online_status == 3">忙碌</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="choose">
          <span>共{{totall}}人</span>
        </div>
        <div class="right">
          <el-button type="primary" @click="submit" size="mini">确 定</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import SearchBar from '@/components/searchBar';
import Dialog from '@/components/Dialog';
export default {
  components: {
    Dialog,
    SearchBar
  },
  data () {
    return {
      list: [],
      initList: [],
      search: '',
      currentRow: [],
      totall: 0,
      id: '',
      ids: '',
      wx_appid: ''
    };
  },
  created () {
    this.id = this.$route.query.id || '';
    this.ids = this.$route.query.ids || '';
    this.type = this.$route.query.type || '';
    this.wx_appid = this.$route.query.wx_appid || '';
    this.getList();
  },
  methods: {
    /**
     * 客服列表
     */
    async getList () {
      this.$http
        .post('/cs.get_list', {
          wx_appid: this.wx_appid
        })
        .then(res => {
          this.list = res.data;
          this.initList = res.data;
          this.totall = res.data.length;
        })
        .catch(err => {
          console.log(err, 'err');
        });
    },
    /**
     * 确定
     */
    submit () {
      if (this.ids) {
        this.multipleSetService()
        return;
      }
      if (this.type === 'invite') {
        this.$ipcSend('inviteService', {...this.currentRow, winbox: this.$route.query.win})
        this.$Win.closeWin();
      } else {
        this.setService()
      }
    },
    /**
     * 设置客服
     */
    setService () {
      let params = {
        id: this.id,
        custom_service_id: this.currentRow.id
      };
      this.$http
        .post('/user.set_custom_service', params)
        .then(res => {
          this.$ipcSend('refreshUserInfo');
          this.$Win.closeWin();
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 批量设置客服
     */
    multipleSetService () {
      let params = {
        ids: this.ids,
        custom_service_id: this.currentRow.id
      };
      this.$http
        .post('/user.multiple_set_custom_service', params)
        .then(res => {
          this.$ipcSend('refreshUserInfo');
          this.$Win.closeWin();
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 选择客服
     */
    currentChange (currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    },
    /**
     *  查找客服
     */
    setKeyWord (val) {
      this.search = val;
      if (!this.search) {
        this.list = this.initList;
      } else {
        this.list = this.initList.filter(item => {
          let flag = false;
          if (item.realname.indexOf(this.search) >= 0) {
            flag = true;
          }
          return flag;
        });
      }
    }
  }
};
</script>
<style lang="less">
.service-dialog {
  .dialog__wrapper {
    height: 100%;
    .dialog {
      height: 100%;
      .dialog__body {
        height: calc(100% - 40px);
        padding: 0;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.service-dialog {
  height: 100%;
  .content {
    height: 100%;
    overflow: hidden;
  }
  .search {
    padding: 15px;
  }
  .table {
    height: calc(100% - 61px);
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>