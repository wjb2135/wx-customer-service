<template>
  <Dialog title="会话转接">
    <div class="session-transfer">
      <el-row :gutter="20">
        <el-col :span="14">
          <div class="transfer-l">
            <div class="search">
              <span>请选择您要转接的客服</span>
              <el-input
                placeholder="搜索客服名称，部门"
                suffix-icon="el-icon-search"
                size="mini"
                class="input-search"
                v-model="searchKey">
              </el-input>
            </div>
            <div class="table">
              <el-table
                ref="singleTable"
                :data="newCsList"
                highlight-current-row
                @current-change="handleCurrentChange"
                size="mini"
                height="250"
                style="width: 100%">
                <el-table-column
                  property="nickname"
                  show-overflow-tooltip
                  label="名称">
                </el-table-column>
                <el-table-column
                  property="department_name"
                  width="60px"
                  label="部门">
                </el-table-column>
                <el-table-column
                  property="position_name"
                  width="80px"
                  label="职责">
                </el-table-column>
                <el-table-column
                  property="clients_count"
                  label="访客数">
                </el-table-column>
                <el-table-column
                  property="c"
                  width="60px"
                  label="状态">
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
        </el-col>
        <el-col :span="10">
          <div class="transfer-r">
            <div class="item-form">
              <label for="">请选择您要转接的原因</label>
              <el-select v-model="reason" placeholder="请选择转接原因" size="mini">
                <el-option
                  v-for="item in reasonSettingList"
                  :key="item.id"
                  :label="item.title"
                  :value="item.memo">
                </el-option>
              </el-select>
              <el-input
                type="textarea"
                :rows="2"
                placeholder="请输入转接原因"
                maxlength="100"
                show-word-limit
                v-model="form.msg">
              </el-input>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="form-footer">
        <!-- <span class="tip">*还可以选择6个转接对象</span> -->
        <div class="btn-group">
          <el-button type="primary" size="mini" @click="transfer" :loading="loadingTransfer">确定</el-button>
          <el-button size="mini" @click="cancel">取消</el-button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      currentRow: null,
      csList: [], // 客服列表
      reasonSettingList: [], // 转接理由
      reason: '', // 默认转接原因
      searchKey: '',
      form: {
        id: this.$route.query.id, // 客户ID
        transfer_id: '', // 客服ID
        msg: '' // 转接原因
      },
      loadingTransfer: false
    }
  },
  created () {
    this.getCsList()
    this.getReasonSettingList()
  },
  methods: {
    async getCsList () {
      let res = await this.$http.post('/user.info', {
        id: this.form.id
      })
      this.$http.post('/cs.get_list', {
        wx_appid: res.data.wx_appid
      }).then((res) => {
        this.csList = res.data
      }).catch((err) => {
        console.log(err)
      })
    },
    /**
     * 转接理由
     */
    async getReasonSettingList () {
      let res = await this.$http.post('/reason_setting_list', {
        type: 1,
        close_type: 3
      });
      this.reasonSettingList = res.data
    },
    /**
     * 转接客户
     */
    transfer () {
      this.loadingTransfer = true
      this.$http.post('/user.transfer', this.form).then((res) => {
        this.loadingTransfer = false
        this.$ipcSend('closeUserChat')
        this.$ipcSend('refreshLeftData')
        this.$Win.closeWin()
      }).catch(() => {
        this.loadingTransfer = false
      });
    },
    handleCurrentChange (val) {
      this.form.transfer_id = val.id
    },
    /**
     * 取消
     */
    cancel () {
      this.$Win.closeWin();
    }
  },
  watch: {
    reason () {
      if (this.reason) {
        this.form.msg = this.reason
      }
    }
  },
  computed: {
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
            ) !== -1 ||
            self.csList[i].department_name.search(
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

<style lang="less">
  .session-transfer {
    .search {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      .input-search {
        width: 200px;
      }
    }
    .el-table {
      font-size: 12px;
      tr {
        cursor: pointer;
      }
    }
    .transfer-r {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .item-form {
        label {
          margin-bottom: 10px;
          display: block;
        }
        .el-select {
          margin-bottom: 10px;
          width: 100%;
        }
      }
    }
    .form-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 12px;
      text-align: right;
      .tip {
        color: @color-primary;
      }
    }
  }
</style>