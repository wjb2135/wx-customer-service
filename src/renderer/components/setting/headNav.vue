<template>
  <div class="nav">
    <ul>
      <li 
        v-for="(item, index) in list" 
        :key="index"
        :class="activeClass == item.index ? 'active' : ''"
        @click="pageChange(item.path, item.name, item.index)">
        <i v-show="item.index == 0" class="iconfont">&#xe695;</i>
        <i v-show="item.index == 1" class="iconfont">&#xe699;</i>
        <i v-show="item.index == 2" class="iconfont">&#xe69c;</i>
        <i v-show="item.index == 3" class="iconfont">&#xe691;</i>
        {{item.title}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeClass: 0
    }
  },
  props: {
    list: {
      type: Object,
      default: {}
    }
  },
  mounted () {
  },
  methods: {
    /**
     * 传值出去
     */
    pageChange (path, name, index) {
      this.activeClass = index
      let params = {
        path: path,
        name: name
      }
      this.$emit('pageChange', params)
    }
  }
}
</script>

<style lang="less" scoped>
  .nav {
    display: flex;
    background: #f7f9f9;
    align-items: center;
    font-size: @font-size-bigger;
    border-bottom: 1px solid @border-color;
    ul {
      display: flex;
      flex-direction: row;
      li {
        flex: 1;
        width: 135px;
        height: 58px;
        line-height: 58px;
        text-align: center;
        transition: .3s;
        cursor: pointer;
        &.active, &:hover {
          color: #2483f3;
          a, .iconfont {
            color: #2483f3;
          }
        }
        .iconfont {
          margin-right: 8px;
          font-size: 20px;
          color: #d1d6dd;
        }
        a {
          color: #24272b;
        }
      }
    }
  }
</style>