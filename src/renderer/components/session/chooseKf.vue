<template>
  <!-- 客服选择 -->
  <Dialog title="客服选择">
    <div class="session-choose-kf">
      <div class="search-bar">
        <el-input
          placeholder=""
          suffix-icon="el-icon-search"
          class="input-search"
          size="mini"
          v-model="searchKey">
        </el-input>
      </div>
      <el-table
        ref="multipleTable"
        :data="newCsList"
        tooltip-effect="dark"
        style="width: 100%"
        size="mini"
        class="table-cslist"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column
          label="名称"
          width="100"
          show-overflow-tooltip
          prop="nickname">
        </el-table-column>
        <el-table-column
          label="部门"
          width="60"
          prop="department_name">
        </el-table-column>
        <el-table-column
          label="职位"
          width="100"
          show-overflow-tooltip
          prop="position_name">
        </el-table-column>
        <el-table-column
          label="状态"
          prop="online_status"
          width="60">
          <template slot-scope="scope">
            <span v-if="scope.row.online_status == 0">未登录</span>
            <span v-if="scope.row.online_status == 1">在线</span>
            <span v-if="scope.row.online_status == 2">离开</span>
            <span v-if="scope.row.online_status == 3">忙碌</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer__choosekf">
      <span>已选择{{selectedKf.length}}人，共{{csList.length}}人</span>
      <div class="btn-group">
        <el-button size="mini" @click="cancel">取 消</el-button>
        <el-button size="mini" type="primary" @click="doCooperation">确 定</el-button>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data () {
    return {
      searchKey: '',
      selectedKf: [],
      csList: [],
      id: this.$route.query.id
    }
  },
  async created () {
    let res = await this.$http.post('/user.info', {
      id: this.id
    })
    this.getCsList(res.data.wx_appid)
  },
  methods: {
    ...mapActions(['setNewAddCooperationCustomService', 'setCooperationCustomService']),
    handleSelectionChange (val) {
      this.selectedKf = val;
    },
    /**
     * 客服列表
     */
    async getCsList (wxAppid) {
      let self = this
      let res = await this.$http.post('/cs.get_list', {
        wx_appid: wxAppid
      });
      let csListArr = res.data
      if (self.$route.query.type !== 'add') {
        self.setCooperationCustomService('')
      }
      if (this.cooperationCustomService && this.cooperationCustomService.length > 0) {
        // 排除已经在协作团队里的客服
        this.cooperationCustomService.forEach((v, i, array) => {
          csListArr.forEach((val, index, arr) => {
            if (v.id === val.id) {
              csListArr.splice(index, 1)
            }
          })
        })
      }
      self.csList = csListArr
    },
    /**
     * 设置协作
     */
    doCooperation () {
      let self = this
      let ids = self.selectedKf.map((value, index, arr) => {
        return value.id
      })
      if (self.$route.query.type === 'add') {
        // 添加协作成员（已存在协作团队）
        if (ids && ids.length > 0) {
          self.setNewAddCooperationCustomService(self.selectedKf)
        }
        self.$Win.closeWin()
      } else {
        ids = ids.join(',')
        // 创建协作团队
        self.$http.post('/user.cooperation', {
          id: self.id,
          ids: ids
        }).then(() => {
          self.$Win.closeWin()
          self.$ipcSend('refreshUserInfo')
          self.$ipcSend('refreshCooperationCustomService')
        })
      }
    },
    cancel () {
      this.$Win.closeWin()
    }
  },
  computed: {
    ...mapGetters(['cooperationCustomService']),
    newCsList () {
      let self = this;
      let arrByZM = [];
      // 遍历组装数组、实时搜索
      if (self.csList && self.csList.length > 0) {
        for (let i = 0; i < self.csList.length; i++) {
          // 判断输入框中的值是否可以匹配到数据，如果匹配成功
          if (
            self.csList[i].nickname.search(
              self.searchKey.toUpperCase()
            ) !== -1
          ) {
            arrByZM.push(self.csList[i]); // 向空数组中添加数据
          }
        }
        return arrByZM;
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .session-choose-kf {
    position: relative;
  }
  .table-cslist {
    margin-top: 38px;
  }
  .dialog-footer__choosekf {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size:12px;
  }
  .search-bar {
    position: fixed;
    top: 40px;
    left: 0;
    z-index: 999;
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    padding: 15px 0;
    .input-search {
      width: 90%;
    }
  }
</style>


