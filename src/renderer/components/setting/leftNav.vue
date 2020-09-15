<template>
  <div class="container">
    <ul>
      <li 
        v-for="(item, index) in list.text" 
        :key="index" 
        :class="activeClass == index ? 'active' : ''"
        @click="change(index, list.path)">
        <a>{{item}}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: {
    list: {
      type: Object,
      default: {}
    },
    activeClass: {
      type: [String, Number],
      default: 0
    },
    win: {
      type: [String, Number],
      default: 0
    },
    winbox: {
      type: [String, Number],
      default: 0
    }
  },
  mounted () {
  },
  methods: {
    change (index, path) {
      let params = {
        activeClass: index,
        path: path
      }
      this.$emit('activeChange', params)
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    width: 164px;
    height: 520px;
    border-right: 1px solid @border-color;
    ul {
      li {
        height: 40px;
        line-height: 40px;
        border-left: 2px solid transparent;
        &.active {
          background: @color-table-hover;
          border-left: 2px solid #2483f3;
        }
        &:hover {
          background: #f7f9f9;
        }
        a {
          padding-left: 30px;
          display: block;
          color: @color-text-primary;
          cursor: pointer;
        }
      }
    }
  }
</style>