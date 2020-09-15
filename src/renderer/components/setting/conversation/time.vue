<template>
  <div class="time-setting-wrap">
    <!-- 主动关闭 -->
    <div class="list">
      <div class="title">主动关闭:</div>
      <div class="right-wrap">访客超过
        <el-input-number
          class="input-number" 
          v-model="setting.active_closure" 
          @change="handleChange()" 
          :min='3'
          :max='10'
          :type="type"
          size="mini"></el-input-number>分钟未说话，客服可以主动关闭会话
        <div class="tips">*仅适用于无主动关闭会话权限的客服</div>
      </div>
    </div>
    <!-- 自动关闭 -->
    <div class="list">
      <div class="title">自动关闭:</div>
      <div class="right-wrap">客服和访客超过
        <el-input-number
          class="input-number" 
          v-model="setting.automatic_closure" 
          @change="handleChange()" 
          :min='10'
          :max='180'
          :type="type"
          size="mini"></el-input-number>分钟未说话，则视为关闭会话
        <div class="tips">*设置的关闭时间必须大于主动关闭时间</div>
      </div>
    </div>
    <!-- 自动退回 -->
    <div class="list">
      <div class="title">自动退回:</div>
      <div class="right-wrap">
        <div>访客超过
          <el-input-number
            class="input-number" 
            v-model="setting.automatic_rollback_msg" 
            @change="handleChange()" 
            :min='0'
            :max='5'
            :type="type"
            size="mini"></el-input-number>条消息未回复
        </div>
        <div class="m-b">客服超过
          <el-input-number
            class="input-number" 
            v-model="setting.automatic_rollback_min" 
            @change="handleChange()" 
            :min='0'
            :max='10'
            :type="type"
            size="mini"></el-input-number>分钟未回复
          <div class="tips">*客服超过20条消息未回复并且超过20分钟则会话被自动退回</div>
        </div>
          <el-button :type="btnType" size="mini" @click="handleChange(setting.has_automatic_rollback)">
            <span v-if="setting.has_automatic_rollback === '1'">关闭自动退回</span>
            <span v-else>开启自动退回</span>
          </el-button>
      </div>
    </div>
    <!-- 开场白 -->
    <!-- <div class="list">
      <div class="title">开场白:</div>
      <div class="right-wrap">开场白间隔
        <el-input-number
          class="input-number" 
          v-model="setting.opening_remarks_hour" 
          @change="handleChange()" 
          :min='0'
          :max='24'
          :type="type"
          size="mini"></el-input-number>小时
        <el-input-number
          class="input-number" 
          v-model="setting.opening_remarks_min" 
          @change="handleChange()" 
          :min='0'
          :max='59'
          :type="type"
          size="mini"></el-input-number>分钟
        <div class="tips">*访客来访时间距离上次会话结束时间超过设置的时间，才会再次发送开场白回复</div>
      </div>
    </div> -->
  </div>
</template>

<script>

export default {
  data () {
    return {
      // setting: { // 会话设置-时间设置
      //   active_closure: '0', // 主动关闭
      //   automatic_closure: '0', // 自动关闭
      //   has_automatic_rollback: '0', // 自动退回（0关闭 1开启）
      //   automatic_rollback_msg: '0', // 自动退回消息
      //   automatic_rollback_min: '0', // 自动退回分钟
      //   opening_remarks_hour: '0', // 开场白间隔小时
      //   opening_remarks_min: '0' // 开场白间隔分钟
      // },
      setting: {},
      type: 0,
      btnType: 'primary'
    }
  },
  created () {
    this.getUserSetting()
  },
  methods: {
    /**
     * 获取系统设置
     */
    getUserSetting () {
      this.$http.post('/getUserSetting').then(res => {
        this.setting = res.data.session_time_setting
        if (this.setting.has_automatic_rollback === '1') {
          this.btnType = 'danger'
        } else {
          this.btnType = 'primary'
        }
      })
    },
    /**
     * 保存系统设置
     */
    handleChange (v) {
      if (v === '1') { // 启动退回
        this.btnType = 'primary'
        this.setting.has_automatic_rollback = '0'
        this.setting.automatic_rollback_msg = '0'
        this.setting.automatic_rollback_min = '0'
      } else if (v === '0') {
        this.btnType = 'danger'
        this.setting.has_automatic_rollback = '1'
      }
      this.$http.post('/setUserSetting', {
        setting_type: 'session_time_setting',
        session_time_setting: JSON.stringify(this.setting)
      }).then(() => {
      })
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