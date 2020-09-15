<template>
  <div class="time-setting-wrap">
    <div class="list">
      <div class="title">主动关闭:</div>
      <div class="right-wrap">访客超过
        <el-input-number
          class="input-number" 
          v-model="num" 
          @change="handleChange" 
          :min="1"
          :type="type"
          size="mini"></el-input-number>分钟未说话，客服可以主动关闭会话
        <div class="tips">*仅适用于无主动关闭会话权限的客服</div>
      </div>
    </div>
    <div class="list">
      <div class="title">自动关闭:</div>
      <div class="right-wrap">客服和访客超过
        <el-input-number
          class="input-number" 
          v-model="num" 
          @change="handleChange" 
          :min="1"
          :type="type"
          size="mini"></el-input-number>分钟未说话，则视为关闭会话
        <div class="tips">*设置的关闭时间必须大于主动关闭时间</div>
      </div>
    </div>
    <div class="list">
      <div class="title">自动退回:</div>
      <div class="right-wrap">
        <div>访客超过
          <el-input-number
            class="input-number" 
            v-model="num" 
            @change="handleChange" 
            :min="1"
            :type="type"
            size="mini"></el-input-number>条消息未回复
        </div>
        <div class="m-b">客服超过
          <el-input-number
            class="input-number" 
            v-model="num" 
            @change="handleChange" 
            :min="1"
            :type="type"
            size="mini"></el-input-number>分钟未回复
          <div class="tips">*客服超过20条消息未回复并且超过20分钟则会话被自动退回</div>
        </div>
          <el-button type="primary">关闭自动退回</el-button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      num: 0,
      type: 0
    }
  },
  methods: {
    handleChange (val) { // 时间设置
      let params = {
        value: val,
        type: this.type
      }
      console.log(params)
    }
  }
}
</script>

<style lang="less" scoped>
  .time-setting-wrap {
    margin: 28px 30px;
    .list {
      display: flex;
      margin-bottom: 30px;
      .title {
        width: 90px;
        padding-top: 3px;
      }
      .tips {
        color: @color-red;
        margin-top: 10px;
      }
      .input-number {
        margin: 0 10px;
      }
      .m-b {
        margin: 12px 0 20px;
      }
    }
  }
</style>