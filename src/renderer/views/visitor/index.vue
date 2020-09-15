<template>
  <div class="page-invite-index">
    <div class="label-index">
      <Label @search="search"></Label>
    </div>
    <div class="main-content">
      <Main @changeId="changeId" :obj="obj">
        <template #extend v-if="userId !== ''">
          <div class="extend-box" @click="extendEvent">
            <i class="iconfont extend" v-show="extend">&#xe6ab;</i>
            <i class="iconfont extend" v-show="!extend">&#xe6a0;</i>
          </div>
        </template>
      </Main>
    </div>
    <div class="customer" v-if="userId !== ''" v-show="extend">
      <user-info :id="userId"></user-info>
    </div>
  </div>
</template>

<script>
import Label from './left';
import Main from './main';
import userInfo from '@/components/userInfo';
export default {
  components: {
    Label,
    Main,
    userInfo
  },
  data () {
    return {
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
    search (obj) {
      this.obj = obj;
    },
    /**
     * 改变id
     */
    changeId (id) {
      this.userId = id;
    }
  }
};
</script>

<style lang="less" scoped>
.page-invite-index {
  height: 100%;
  display: flex;
  width: 100%;
  overflow: hidden;
  .extend-box{
    margin-right: -17px;
    display: inline-block;
    cursor: pointer;
    width: 50px;
    height: 28px;
    line-height: 29px;
    text-align: center;
  }
  .label-index {
    flex: 0 0 250px;
    min-height: 100%;
    background-color: @background-color-base;
    overflow: hidden;
    border-right: 1px solid @border-color;
  }
  .main-content {
    min-height: 100%;
    min-width: 30%;
    flex: 1 1 auto;
    background-color: @background-color-base;
  }
  .customer {
    min-height: 100%;
    flex: 0 0 300px;
    background-color: @background-color-base;
  }
}
</style>