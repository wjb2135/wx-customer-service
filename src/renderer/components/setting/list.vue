<template>
  <div class="list">
    <p 
      :class="activeClass === index ? 'active' : ''"
      v-for="(item, index) in data" 
      :key="index"
      @click="listClick(index, item.id)">
        <span v-if="item.title">{{item.title}}</span>
        <span v-if="item.name">{{item.name}}</span>
      </p>
    <div class="btn-wrap">
      <el-button type="primary" size="mini" :disabled="prevDisabled" @click="moveClick('prev')">向上移动</el-button>
      <el-button type="info" size="mini" :disabled="nextDisabled" @click="moveClick('next')">向下移动</el-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: []
    },
    prevDisabled: {
      type: Boolean,
      default: true
    },
    nextDisabled: {
      type: Boolean,
      default: false
    },
    activeClass: 0
  },
  data () {
    return {
    }
  },
  methods: {
    /**
     * 列表点击
     */
    listClick (index, id) {
      let params = {
        index: index,
        id: id,
        activeClass: index
      }
      this.$emit('listClick', params)
    },
    /**
     * 按钮点击
     */
    moveClick (type) {
      this.$emit('moveClick', type)
    }
  }
}
</script>

<style lang="less" scoped>
    .list {
      position: relative;
      width: 250px;
      border-right: 1px solid @border-color;
      p {
        font-size: @font-size-bigger;
        height: 35px;
        line-height: 35px;
        padding: 0 16px;
        cursor: pointer;
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        &:hover {
          background: #f7f9f9;
        }
        &.active {
          background: @color-table-hover
        }
      }
      .btn-wrap {
        display: flex;
        justify-content: center;
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 10px 16px;
        button {
          flex: 1;
        }
      }
    }
</style>