<template>
  <div class="page-invite-batch">
    <!-- 导航 -->
    <div class="tabs-content">
      <div class="tabs">
        <p :class="active == 1 ?'active': ''" @click="changeTabs(1)" v-if="batchInvite && activeInvite">新建任务</p>
        <p :class="active == 2 ?'active': ''" @click="changeTabs(2)">发送任务列表</p>
      </div>
      <div class="search" v-show="active == 2">
        <searchBar placeholder="任务名称" @setKeyWord="setKeyWord"  @keydownEnter="keydownEnter"></searchBar>
      </div>
    </div>
    <!-- 内容 -->
    <div class="content">
      <Create v-if="active == 1 "></Create>
      <Send ref="send" v-if="active == 2 "></Send>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar.vue';
import Create from './inc/create';
import Send from './inc/send';
import { mapGetters } from 'vuex'
export default {
  components: {
    searchBar,
    Create,
    Send
  },
  data () {
    return {
      active: 1
    };
  },
  created () {
    if (!this.batchInvite || !this.activeInvite) {
      this.active = 2
    }
  },
  methods: {
    keydownEnter (val) {
      this.$refs.send.getTaskList({title: val})
    },
    changeTabs (val) {
      this.active = val;
    },
    setKeyWord () {}
  },
  computed: {
    ...mapGetters({
      baseUserInfo: 'baseUserInfo'
    }),
    // 批量邀请
    batchInvite () {
      return this.baseUserInfo.position.power.service.includes('batch_invite');
    },
    // 邀请
    activeInvite () {
      return this.baseUserInfo.position.power.service.includes('active_invite');
    }
  }
};
</script>
<style lang="less" scoped>
.page-invite-batch {
  height: 100%;
  .tabs-content {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @border-color;
    padding: 0 10px;
    .tabs {
      p {
        height: 48px;
        display: inline-block;
        line-height: 50px;
        border-bottom: 2px solid transparent;
        margin-right: 25px;
        cursor: pointer;
        &.active {
          border-bottom-color: @color-primary;
        }
      }
    }
  }
  .content{
    height: calc(100% - 50px);
  }
}
</style>