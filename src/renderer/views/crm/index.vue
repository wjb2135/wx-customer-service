<template>
  <div class="page-crm-index">
    <div class="left">
      <Left @selectList="selectList"></Left>
    </div>
    <div class="main">
      <Main @changeId="changeId" :obj="obj">
        <template #extend v-if="userId !== ''">
          <div class="extend-box" @click="extendEvent">
            <i class="iconfont extend" v-show="extend">&#xe6ab;</i>
            <i class="iconfont extend" v-show="!extend">&#xe6a0;</i>
          </div>
        </template>
      </Main>
    </div>
    <!-- :class="userStatus ==0? '':'history'" -->
    <div class="right" v-if="userId !== ''" v-show="extend">
      <Right @toggleWidth="toggleWidth" :id="userId"></Right>
    </div>
  </div>
</template>

<script>
import Left from './left';
import Main from './main';
import Right from './right';
export default {
  components: {
    Left,
    Main,
    Right
  },
  data () {
    return {
      userStatus: 0,
      userId: '',
      obj: {
        sex: -1
      },
      extend: true
    };
  },
  created () {},
  methods: {
    // 展开或者关闭右边窗口
    extendEvent () {
      if (this.userId) {
        this.extend = !this.extend;
      }
    },
    /**
     * 搜索条件
     */
    selectList (obj) {
      this.obj = obj;
    },
    /**
     * 改变id
     */
    changeId (id) {
      this.userId = id;
    },
    toggleWidth (val) {
      this.userStatus = val;
    }
  }
};
</script>

<style lang="less" scoped>
.page-crm-index {
  height: 100%;
  display: flex;
  .extend-box {
    margin-right: -17px;
    display: inline-block;
    cursor: pointer;
    width: 50px;
    height: 28px;
    line-height: 29px;
    text-align: center;
  }
  .left {
    flex: 0 0 250px;
    width: 250px;
    min-height: 100%;
    background-color: @background-color-base;
    border-right: 1px solid @border-color;
  }
  .main {
    min-height: 100%;
    min-width: 30%;
    flex: 1 1 auto;
    background-color: @background-color-base;
  }
  .right {
    min-height: 100%;
    flex: 0 0 300px;
    width: 300px;
    background-color: @background-color-base;
    &.history {
      flex: 0 0 600px;
      width: 600px;
    }
  }
}
</style>