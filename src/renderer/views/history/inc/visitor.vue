<template>
  <div class="history-table">
    <el-table
      stripe
      ref="multipleTable"
      :data="tableData"
      highlight-current-row
      tooltip-effect="dark"
      class="fw-table visitor-table"
      @current-change="changeUser"
      size="mini"
    >
      <el-table-column prop="wx_appid_name" label="公众号名称" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="nickname" label="访客名称" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="long_time" label="持续时间" width="150"></el-table-column>
      <el-table-column prop="times" label="来访次数"></el-table-column>
      <el-table-column prop="message_num" label="访客次数"></el-table-column>
      <el-table-column prop="reply_message" label="客服次数"></el-table-column>
      <el-table-column prop="telephone" label="电话号码" width="150"></el-table-column>
      <el-table-column prop="position" label="位置" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="custom_name" label="接待客服列表" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="begin_time" label="开始时间" width="150"></el-table-column>
      <el-table-column prop="end_time" label="结束时间" width="150"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      tableData: [],
      currentId: ''
    };
  },
  created () {
    this.tableData = this.data
  },
  methods: {
    /**
     * 选择
     */
    changeUser (currentRow, oldCurrentRow) {
      if (!oldCurrentRow || currentRow.id !== oldCurrentRow.id) {
        this.currentId = currentRow.id;
        this.$emit('changeId', this.currentId);
      }
    }
  },
  watch: {
    data () {
      this.tableData = this.data
    }
  }
};
</script>

<style lang="less" scoped>
.history-table{
  height: 100%;
}
</style>