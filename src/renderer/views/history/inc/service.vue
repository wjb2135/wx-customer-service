<template>
  <div class="history-table">
    <el-table
      stripe
      ref="multipleTable"
      :data="tableData"
      highlight-current-row
      tooltip-effect="dark"
      class="fw-table visitor-table"
      size="mini"
    >
      <el-table-column prop="custom_service_name" label="客服名称" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="session_count" label="会话数"></el-table-column>
      <el-table-column prop="clients_count" label="访客数"></el-table-column>
      <el-table-column prop="first_count" label="首次访问"></el-table-column>
      <el-table-column prop="unfollow_count" label="取关数"></el-table-column>
      <el-table-column prop="leave_mobile_count" label="留电话数"></el-table-column>
      <el-table-column prop="visit_invite_count" label="访客发起"></el-table-column>
      <el-table-column prop="clients_service_invite_count" label="客服发起"></el-table-column>
      <el-table-column prop="effect_session_count" label="有效会话"></el-table-column>
      <el-table-column prop="missed_session_count" label="错失会话"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => {
        return [];
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
    this.tableData = this.data;
  },
  methods: {
  },
  watch: {
    data () {
      this.tableData = this.data;
    }
  }
};
</script>

<style lang="less" scoped>
.history-table {
  height: 100%;
}
</style>