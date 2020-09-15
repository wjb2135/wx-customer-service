<template>
  <div class="page-invite-index">
    <div class="invite-title">
      <el-radio-group size="mini" v-model="tabs" @change="changeTabs">
        <el-radio-button label="批量邀请"></el-radio-button>
        <el-radio-button label="预约邀请"></el-radio-button>
      </el-radio-group>
    </div>
    <div class="invite-content">
      <batch v-if="tabs == '批量邀请'"></batch>
      <appoint v-if="tabs == '预约邀请'"></appoint>
    </div>
  </div>
</template>
<script>
import appoint from './appoint';
import batch from './batch';
export default {
  components: {
    appoint,
    batch
  },
  data () {
    return {
      tabs: '批量邀请'
    };
  },
  created () {},
  methods: {
    changeTabs () {
      console.log(this.tabs);
    }
  }
};
</script>
<style lang="less">
.page-invite-index {
  .el-radio-button__inner {
    padding: 9px 15px !important;
  }
}
</style>

<style lang="less" scoped>
.page-invite-index {
  background-color: @color-white;
  height: 100%;

  .invite-title {
    padding: 8px 10px;
    border-bottom: 1px solid @border-color;
  }
  .invite-content {
    height: calc(100% - 49px);
  }
}
</style>