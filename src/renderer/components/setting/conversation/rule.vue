<template>
  <div class="conversation-rule-wrap">
    <div class="header">
      <ul>
        <li :class="{active: activeClass == 0}" @click="navChange(0)">基础分配规则</li>
        <li :class="{active: activeClass == 1}" @click="navChange(1)">高级分配规则</li>
      </ul>
      <div class="tip">进入公众号的访客优先按已开启的顺序分配</div>
      <div class="btn-back">
        <el-button type="primary" size="mini" v-show="setting" @click="settingBtn1()">返回</el-button>
      </div>
    </div>
    <rule-basic
      class="content"
      v-if="activeClass === 0" 
      @setting="settingBtn"
      :setting="setting"></rule-basic>
    <rule-advanced 
      v-else
      :seniorSetting="seniorSetting"
      :modeValue="modeVlue"></rule-advanced>
  </div>
</template>

<script>
import ruleBasic from '@/components/setting/conversation/ruleBasic'
import ruleAdvanced from '@/components/setting/conversation/ruleAdvanced'

export default {
  components: {
    ruleBasic,
    ruleAdvanced
  },
  data () {
    return {
      activeClass: 0,
      setting: false,
      modeVlue: 0,
      basicSetting: {},
      seniorSetting: {}
    }
  },
  created () {
    // this.getUserSetting()
  },
  methods: {
    /**
     * 获取系统设置
     */
    getUserSetting () {
      this.$http.post('/getUserSetting').then(res => {
        this.basicSetting = res.data.basic_setting
        this.seniorSetting = res.data.senior_setting
        this.modeVlue = res.data.basic_setting.mode_value
      })
    },
    /**
     * 切换基础、高级规则
     */
    navChange (type) {
      this.activeClass = type
      if (type) {
        this.setting = false
      }
    },
    modeValueChange (v) {
      this.modeVlue = v
    },
    /**
     * 切换自定义设置
     */
    settingBtn (v) {
      if (v === 0) {
        this.setting = true
      } else {
        this.setting = false
      }
      console.log(this.setting)
    },
    settingBtn1 () {
      this.setting = false
    },
    /**
     * 点击checkbox
     */
    change (i) {
      this.checked.forEach((item, index) => {
        if (index === i) {
          this.checked[index] = true
        } else {
          this.checked[index] = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .conversation-rule-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    .header {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid @border-color;
      ul {
        margin-right: 20px;
        border-radius: 4px;
        border: 1px solid @color-primary;
        color: @color-primary;
        display: flex;
        li {
          cursor: pointer;
          padding: 6px 20px;
          flex: 1;
          &.active {
            color: @color-white;
            background: @color-primary;
          }
        }
      }
      .tip {
        flex: 1;
      }
      .btn-back {
        position: absolute;
        right: 16px;
      }
    }
    .content {
      margin: 28px 30px;
    }
  }
</style>
