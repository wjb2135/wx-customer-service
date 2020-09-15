<template>
  <div>
    <!-- 自己发的 -->
    <div class="item-chat item-chat-r" v-if="(showType === 'service' || showType === 'all') && (message.custom_service_id === baseUserInfo.id)">
      <div class="info">
        <div class="msg" v-html="message.action_value.content"></div>
      </div>
      <div class="avatar">
        <img :src="message.custom_service_avatar" alt="">
      </div>
    </div>
    <!-- 其他客服 -->
    <div class="item-chat item-chat-l" v-else-if="(showType === 'service' || showType === 'all') && (message.custom_service_id > 0 && message.custom_service_id !=  baseUserInfo.id)">
      <div class="avatar">
        <img :src="message.custom_service_avatar" alt="">
      </div>
      <div class="info">
        <div class="name">{{message.custom_service_nickname}}</div>
        <div class="msg" v-html="message.action_value.content"></div>
      </div>
    </div>
    <!-- 公众号客户 -->
    <div class="item-chat item-chat-l" v-else-if="message.custom_service_id <= 0 && (showType === 'customer' || showType === 'all')">
      <div class="avatar">
        <img :src="message.clients_avatar" alt="">
      </div>
      <div class="info">
        <div class="name">{{message.clients_nickname}}</div>
        <div class="msg" v-html="message.action_value.content"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: Object,
      default: () => {
        return {}
      }
    },
    baseUserInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showType: {
      type: String,
      default: 'all' // customer service all
    }
  }
}
</script>

<style lang="less">
.item-chat {
  margin-top: 25px;
  display: flex;
  .avatar {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      border-radius: 100%;
    }
  }
  .info {
    margin-left: 15px;
    .name {
      line-height: 1;
      color: @color-text-secondary;
      margin-top: 3px;
    }
    .msg {
      line-height: 1.5;
      padding: 15px;
      margin-top: 10px;
      max-width: 400px;
      border-radius: 5px;
      border-top-left-radius: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      word-break: break-all;
      &.msg-link {
        display: flex;
        cursor: pointer;
        .msg-link-l {
          min-width: 120px;
          margin-right: 20px;
        }
        .msg-link-r {
          img {
            display: block;
          }
        }
      }
      &.msg-voice {
        width: 150px;
        height: 50px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 1;
        cursor: pointer;
        font-size: 16px;
        .icon-voice {
          width: 14px;
          height: 20px;
          display: block;
          &.icon-voice-self {
            background: url('../../../assets/images/session/icon-voice-self.png') no-repeat;
          }
          &.icon-voice-other {
            background: url('../../../assets/images/session/icon-voice-other.png') no-repeat;
          }
        }
        
        &.playing {
          .icon-voice-self {
            background: url('../../../assets/images/session/icon-voice-self.gif') no-repeat;
          }
          .icon-voice-other {
            background: url('../../../assets/images/session/icon-voice-other.gif') no-repeat;
          }
        }
      }
      &.msg-video {
        background-repeat: no-repeat;
        background-size: cover;
        width: 150px;
        height: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .btn-play {
          width: 40px;
          height: 40px;
          border-radius: 40px;
          border: 1px solid #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          &:after {
            content: '\e60f';
            font-family: 'iconfont';
            color: #fff;
            font-size: 20px;
            line-height: 1;
            display: block;
          }
        }
      }
    }
  }
  &.item-chat-l {
    justify-content: flex-start;
    .info {
      margin-left: 15px;
    }
    .msg {
      background-color: #f7f9f9;
      border-top-left-radius: 0;
    }
    .msg-link {
      .msg-link-l {
        margin: 0;
        margin-left: 20px;
      }
    }
  }
  &.item-chat-r {
    justify-content: flex-end;
    .name {
      text-align: right;
    }
    .info {
      margin-right: 15px;
    }
    .msg {
      background-color: #f1f8ff;
      border-top-right-radius: 0;
      margin-top: 3px;
    }
  }
}
</style>