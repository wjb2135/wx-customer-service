<template>
  <div class="btn-wrap">
    <el-button type="primary" size="mini" @click="btnClick(0)">{{title1}}</el-button>
    <el-button type="danger" size="mini" @click="btnClick(1)">{{title2}}</el-button>
  </div>
</template>

<script>
export default {
  props: {
    title1: {
      type: String,
      default: ''
    },
    title2: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
    }
  },
  methods: {
    /**
     * 点击按钮
     */
    btnClick (i) {
      this.$emit('btnClick', i)
    }
  }
}
</script>

<style lang="less" scoped>
  .btn-wrap {
    padding: 10px 16px;
    border-bottom: 1px solid @border-color;
  }
</style>