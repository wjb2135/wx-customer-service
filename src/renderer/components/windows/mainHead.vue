<template>
  <div class="header drag">
    <span>{{title}}</span>
    <i class="iconfont no-drag" @click="closeWindow">&#xe69a;</i>
  </div>
</template>

<script>

export default {
  name: 'mainHead',
  props: ['title'],
  methods: {
    closeWindow () {
      this.$ipcSend('closeChildrenWin');
      this.$Win.closeWin()
    }
  }
}
</script>

<style lang="less" scoped>
  .header {
    height: 40px;
    line-height: 40px;
    background: #2483f3;
    color: #fff;
    padding: 0 20px;
    .iconfont {
      position: absolute;
      right: 20px;
      cursor: pointer;
    }
  }
</style>
