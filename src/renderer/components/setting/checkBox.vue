<template>
  <div class="check-box-wrap">
    <div class="title">{{title}}：</div>
    <el-checkbox-group v-model="checkList1" @change="change" class="right-wrap">
      <div v-for="(item, index) in list" :key="index"><el-checkbox :label="item" :disabled="item === value"></el-checkbox></div>
    </el-checkbox-group>
  </div>
</template>

<script>
export default {
  data () {
    return {
      checkList1: this.checkList
    }
  },
  props: {
    list: {
      type: Array,
      default: []
    },
    checkList: {
      type: Array,
      default: []
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  watch: {
    checkList (val) {
      this.checkList1 = val
    }
  },
  methods: {
    /**
     * 传值出去
     */
    change (val) {
      this.$emit('changeBox', val)
    }
  }
}
</script>

<style lang="less" scoped>
  .check-box-wrap {
    margin: 28px 30px;
    display: flex;
    align-items: flex-start;
    .title {
      width: 90px;
    }
    .right-wrap {
      > div {
        margin-bottom: 15px;
      }
    }
  }
</style>