<template>
  <!-- 对话消息列表 -->
  <div class="session-msg-prompt" :class="{'active': activeChatUserId == data.id}" @click="selectChatUser">
    <div class="avatar">
      <el-badge is-dot class="item" :hidden="!data.message_list">
        <img :src="data.avatar" alt="">
      </el-badge>
    </div>
    <div class="info">
      <div class="u-name">
        <div class="u-name-inner">
          <span class="type" :class="[{'type-visit': data.user_status == '来访' || data.user_status == '有效'}, {'type-back': data.user_status == '退回'}, {'type-first': data.user_status == '首次'}, {'type-message': data.user_status == '留言'}]" v-if="data.user_status">{{data.user_status}}</span>
          <span class="name">{{ data.nickname }}</span>
        </div>
      </div>
      <div class="u-msg"><template v-if="data.message_count">[{{data.message_count}}条] </template>{{ msgContent }}</div>
    </div>
    <div class="after" :class="{'flex-start': data.label_type != 0}">
      <!-- 等待接待 -->
      <template v-if="canReceive">
        <el-button size="mini" type="primary" @click="receive(data.id)">接待</el-button>
      </template>
      <template v-else>
        <span class="time">{{ data.last_send_time_str }}</span>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  props: ['data', 'activeChatUserId', 'userInfo'],
  methods: {
    /**
     * 选择对话列表
     */
    selectChatUser () {
      this.$emit('selectChatUser', this.data);
    },
    /**
     * 接待
     */
    receive (id) {
      this.$emit('receive', id)
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo']),
    /**
     * 未读消息内容
     */
    msgContent () {
      if (this.data.last_client && (this.data.last_client.action_id === 'wechat_click_menu' && this.data.last_client.action_id === 'wechat_unsubscribe' && this.data.last_client.action_id === 'wechat_subscribe')) { // 点击微信公众号菜单
        return ''
      } else {
        if (this.data.last_client && this.data.last_client.action_id === 'wechat_leave_template_message') {
          return '[向微信客户发送模板]'
        } else {
          if (this.data.last_client.action_id === 'wechat_leave_message') {
            if (this.data.last_client && this.data.last_client.action_value) {
              return this.data.last_client.action_value.content.replace(/<br>/g, '')
            } else {
              return ''
            }
          } else {
            if (this.data.last_client && this.data.last_client.action_value) {
              return this.data.last_client.action_value.content
            } else {
              return ''
            }
          }
        }
      }
    },
    canReceive () {
      // 当组类型是等待接待，并且客服有主动接待的权限
      return this.data.group_type === '等待接待' && this.baseUserInfo.position.power.service.indexOf('active_reception') !== -1
    }
  }
}
</script>


<style lang="less" scoped>
  .session-msg-prompt {
    position: relative;
    display: flex;
    overflow: hidden;
    width: 100%;
    padding: 10px 15px 10px 20px;
    cursor: pointer;
    .el-button--mini {
      padding: 5px 10px;
    }
    .avatar {
      margin-right: 15px;
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      img {
        width: 100%;
        height: 100%;
        border-radius: 34px;
      }
    }
    .info {
      width: 100%;
      flex-shrink: 1;
      overflow: hidden;
      .u-name {
        font-size: 16px;
        color: #24272b;
        display: flex;
        justify-content: space-between;
        .name {
          width: 85px;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .u-name-inner {
          display: flex;
          align-items: center;
          .type {
            margin-right: 5px;
            &.type-visit {
              background-color: #8be24b;
            }
            &.type-back {
              background-color: #fa5556;
            }
            &.type-first {
              background-color: #fc8a00;
            }
            &.type-message {
              background-color: #db3532;
            }
          }
        }
        .type {
          background-color: @color-red;
          color: #fff;
          border-radius: 3px;
          padding: 0 3px;
          font-size: @font-size-small;
          width: 30px;
          height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          line-height: 1;
        }
        .time {
          color: @color-text-secondary;
        }
      }
      .u-msg {
        color: @color-text-secondary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .after {
      position: absolute;
      top: 10px;
      right: 10px;
      &.flex-start {
        align-items: flex-start;
      }
    }
    &.active {
      position: relative;
      background-color: #f1f8ff;
      &:after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 100px;
        background-color: @color-primary;
      }
    }
  }
</style>

