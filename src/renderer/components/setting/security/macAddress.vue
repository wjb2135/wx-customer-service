<template>
  <div class="macAddress-page">
    <div class="header">
      <div><el-checkbox v-model="checked" @change="handleChange">启用Mac地址限制</el-checkbox></div>
      <div class="title">登陆过系统的机器列表：</div>
    </div>
    <el-table
      height="380"
      v-loading="loading"
      class="table"
      :data="tableData"
      stripe>
      <el-table-column
        prop="address"
        label="Mac地址"
        width="260">
      </el-table-column>
      <el-table-column
        prop="machine_name"
        label="机器名称"
        width="320">
      </el-table-column>
      <el-table-column
        label="状态"
        width="100">
        <template slot-scope="scope">
          <div v-if="scope.row.is_effect" class="status" @click="handleEdit(scope.$index, scope.row)">启用</div>
          <div v-else class="status disabled" @click="handleEdit(scope.$index, scope.row)">禁用</div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    checkedProps: {
      type: Boolean,
      default: false
    },
    tableData: {
      type: Array,
      default: []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      index: 0,
      checked: false,
      activeClass: 0,
      macAddress: ''
    }
  },
  created () {
  },
  watch: {
    checkedProps: {
      handler () {
        this.checked = this.checkedProps
      },
      deeep: true
    }
  },
  methods: {
    /**
     * 启动/禁用 MAC限制
     */
    handleChange (e) {
      let status = e ? 1 : 0
      this.$http.post('/setUserSetting', {
        setting_type: 'MAC_address_limitation_setting',
        has_mac_limitation: status
      }).then(() => {
      }).catch(() => {
        this.checked = !e
      })
    },
    handleEdit (index, row) {
      this.$http.post('/mac_addresss_status', {
        id: row.id
      }).then(() => {
        this.tableData[index].is_effect = row.is_effect ? 0 : 1
      }).catch(() => {
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .header {
    padding: 28px 30px 0;
    .title {
      margin: 18px 0 3px;
    }
  }
  .table {
    width: 100%;
    .status {
      cursor: pointer;
      color: @color-red;
      &.disabled {
        color: @color-primary;
      }
    }
  }
</style>

<style lang="less">
  .macAddress-page {
    table {
      th, td {
        padding: 5px 20px;
      }
    }
    .el-table--striped .el-table__body tr.el-table__row--striped td {
      background: #f1f8ff;
    }
  }
</style>
