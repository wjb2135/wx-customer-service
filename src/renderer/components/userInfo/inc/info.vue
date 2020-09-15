<template>
  <div class="page-user-info">
    <div class="user-other-info">
      <!-- 展示 -->
      <div class="word-info">
        <div class="title">访客资料</div>
        <div class="info-box">
          <div class="title">访客来源:</div>
          <div class="content">{{user.source_name}}</div>
        </div>
        <div class="info-box">
          <div class="title">地理位置:</div>
          <div class="content">{{user.country}}{{user.province}}{{user.city}}</div>
        </div>
        <div class="info-box">
          <div class="title">会话次数:</div>
          <div class="content">{{user.chat_nums}}次</div>
        </div>
        <div class="info-box time">
          <div class="title">最后来访时间:</div>
          <div class="content">{{user.last_operation_time}}</div>
        </div>
        <div class="info-box time">
          <div class="title">最后会话时间:</div>
          <div class="content">{{user.last_send_time}}</div>
        </div>
        <div class="info-box time">
          <div class="title">首次关注时间:</div>
          <div class="content">{{user.created_at}}</div>
        </div>
      </div>
      <!-- 右侧用户信息备注  -->
      <user-input :user="user"></user-input>
    </div>
  </div>
</template>

<script>
import userInput from '@/components/userInfo/inc/input';
export default {
  components: {
    userInput
  },
  props: {
    user: {
      type: [Object],
      default: {}
    }
  },
  data () {
    return {
    };
  }
};
</script>

<style lang="less" scoped>
.page-user-info {
  height: 100%;
  padding: 0 15px;
  .word-info {
    padding: 20px 3px;
    border-bottom: 1px solid @border-color;
    & > .title {
      color: #24272b;
      font-size: @font-size-base;
      margin-bottom: 15px;
      line-height: 1;
    }
    .info-box {
      display: flex;
      line-height: 18px;
      margin-bottom: 10px;
      width: 100%;
      overflow: hidden;
      &:last-child {
        margin-bottom: 0;
      }
      .title {
        flex: 0 0 60px;
        color: #87929f;
        margin-right: 11px;
      }
      .content {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        flex: 0 0 182px;
      }
      &.time {
        .title {
          flex: 0 0 89px;
        }
        .content {
          flex: 0 0 142px;
        }
      }
    }
  }
}
</style>