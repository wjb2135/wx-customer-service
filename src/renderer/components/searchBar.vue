<template>
  <!-- 搜索条 -->
  <div class="search-bar">
    <input type="text" class="input-search" :placeholder="placeholder" v-model="keyWord" v-on:input="setKeyWord" @keydown.enter="keydownEnter">
    <i class="icon iconfont" @click="keydownEnter">&#xe616;</i>
  </div>
</template>

<script>
export default {
  props: ['placeholder'],
  data () {
    return {
      keyWord: '' // 搜索关键字
    }
  },
  methods: {
    /**
     * 更新父组件搜索关键字
     */
    setKeyWord () {
      this.$emit('setKeyWord', this.keyWord);
    },
    keydownEnter () {
      this.$emit('keydownEnter', this.keyWord);
    }
  }
}
</script>


<style lang="less" scoped>
  .search-bar {
    position: relative;
    .input-search {
      background-color: #f7f9f9;
      border-radius: 100px;
      border: 0;
      width: 100%;
      height: 33px;
      padding: 0 15px;
      &::input-placeholder {
        color: #000;
      }
    }
    .iconfont {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      color: #aeb8c4;
    }
  }
</style>

