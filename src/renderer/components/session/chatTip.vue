<template>
  <div class="chat-tip">
    <img src="@/assets/images/app/logo.png" class="chat-tip-logo">
    <div class="chat-tip-info">
      <div class="tip-title">使用小技巧</div>
      <div class="tip-info">轮询分配适合访客量不大的营销型企业</div>  
    </div>
  </div>
</template>

<style lang="less" scoped>
  .chat-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .chat-tip-logo {
      margin-bottom: 30px;
      width: 60px;
    }
    .chat-tip-info {
      position: relative;
      .tip-title {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: @color-primary;
        color: #fff;
        height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        display: flex;
        width: max-content;
        border-radius: 40px;
      }
      .tip-info {
        border-radius: 10px;
        background-color: #f7f7f7;
        width: 300px;
        padding: 30px 20px;
        min-height: 100px;
        padding-top: 50px;
        color: @color-text-secondary;
      }
    }
  }
</style>