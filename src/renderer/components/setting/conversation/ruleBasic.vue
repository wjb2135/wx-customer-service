<template>
  <div class="setting-page">
    <div v-if="!setting">
      <div class="list">
        <div class="title">抢单模式:</div>
        <el-checkbox v-model="checked[0]" @change="change(0)">所有会话均在等待接待中，需客服手动接待</el-checkbox>
      </div>
      <div class="list">
        <div class="title">服务模式:</div>
        <el-checkbox v-model="checked[1]" @change="change(1)">按当前接待量自动平均分配会话，分担流量保证客服人员服务效率</el-checkbox>
      </div>
      <div class="list">
        <div class="title">营销模式:</div>
        <el-checkbox v-model="checked[2]" @change="change(2)">按当日分配量自动平均分配会话，保证所有客服人员客户资源相当</el-checkbox>
      </div>
      <div class="list">
        <div class="title">自定义模式:</div>
        <div class="flex">
          <el-checkbox v-model="checked[3]" @change="change(3)">按自己需求自定义分配规则</el-checkbox>
          <div>
            <el-button type="primary" size="mini" @click="settingBtn(0)" v-show="data.mode_value === 4">设置</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 自定义模式 -->
    <div v-else class="setting-ing">
      <div class="tip">优先分配设置后，进入公众号的访客按已开启的顺序分配</div>
      <div class="check-box-wrap">
        <!-- 自定义模式 -->
        <div class="title">自定义模式:</div>
        <el-checkbox-group v-model="customCheckList" @change="changeBox" class="right-wrap rule">
          <div v-for="(item, index) in customList" :key="index"><el-checkbox :label="item.value" :disabled="index === 0 || index === 2 || index === 5"></el-checkbox></div>
        </el-checkbox-group>
      </div>
      <!-- 对话分配 -->
      <div class="flex-box">
        <div class="title">对话分配:</div>
        <div>
          <el-select v-model="data.priority_allocation" placeholder="请选择" size="mini" @change="priorityChange">
            <el-option
              v-for="item in priority"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              {{ item.label }}
            </el-option>
          </el-select>
          <div class="tip">按当日会话总分配量平均分配</div>
        </div>
        <div class="el-select">
          <el-checkbox v-model="talkChecked" @change="talkChange">优先分配给PC端客服</el-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkBox from '@/components/setting/checkBox'

export default {
  components: {
    checkBox
  },
  props: {
    setting: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      checked: [false, false, false, false, false],
      talkChecked: true,
      customList: [
        {value: '优先分配给专属客服（仅限开通专属客服功能的企业使用 设置方式：公司管理平台＞用户管理）'},
        {value: '优先分配给所属客服'},
        {value: '优先分配给会话来源客服（会话来源客服是指二维码制定客服等）'},
        {value: '优先分配给上次接待客服'},
        {value: '优先分配给同部门客服（按当日分配量平均分配给同部门其他客服）'},
        {value: '优先分配给指定部门客服（仅对扫码进入公众号的访客有效 设置方式：微信营销平台＞二维码管理）'}
      ],
      customCheckList: [
        '优先分配给专属客服（仅限开通专属客服功能的企业使用 设置方式：公司管理平台＞用户管理）',
        '优先分配给会话来源客服（会话来源客服是指二维码制定客服等）',
        '优先分配给指定部门客服（仅对扫码进入公众号的访客有效 设置方式：微信营销平台＞二维码管理）'
      ],
      priority: [
        {value: '0', label: '不自动分配'},
        {value: '1', label: '按当前接待量平均分配'},
        {value: '2', label: '按当日分配量平均分配'},
        {value: '3', label: '轮询分配'},
        {value: '4', label: '按等级分配'}
      ],
      data: {
        mode_value: 0,
        custom_mode_value: '',
        talk_allocation: '0',
        priority_allocation: '0',
        custom_mode_switch: '0'
      },
      customSetting: false
    }
  },
  watch: {
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
        this.basicSetting = res.data.basic_setting
        this.checked[this.basicSetting.mode_value - 1] = true
        this.data.mode_value = this.basicSetting.mode_value
        console.log('this.data.mode_value: ', this.data.mode_value)
        this.data.custom_mode_value = this.basicSetting.custom_mode_value
        console.log('watch this.data.custom_mode_value', this.data.custom_mode_value)
        let customValue = this.basicSetting.custom_mode_value.split(',')
        customValue.forEach((item, index) => {
          if (item && item !== '0' && item !== '2' && item !== '5') {
            let value = this.customList[Number(item)].value
            this.customCheckList.push(value)
          }
        })
        this.data.priority_allocation = this.basicSetting.priority_allocation
        this.data.talk_allocation = this.basicSetting.talk_allocation
        // this.data.custom_mode_switch = this.basicSetting.custom_mode_switch
        if (this.data.talk_allocation === '0') {
          this.talkChecked = false
        } else {
          this.talkChecked = true
        }
      })
    },
    /**
     * 切换自定义设置
     */
    settingBtn (v) {
      this.$emit('setting', v)
    },
    /**
     * 基础分配规则 点击checkbox
     */
    change (i) {
      this.data.mode_value = i + 1
      this.setUserSetting()
      this.checked.forEach((item, index) => {
        if (index === i) {
          this.checked[index] = true
        } else {
          this.checked[index] = false
        }
      })
      if (i === 3) {
        this.customSetting = true
      } else {
        this.customSetting = false
      }
    },
    /**
     * 自定义模式 点击checkbox
     */
    changeBox (val) {
      let arr = ''
      this.data.custom_mode_value = ''
      val.forEach((item, index) => {
        this.customList.forEach((item1, index1) => {
          if (item === item1.value) {
            arr += index1 + ','
          }
        })
      })
      console.log('this.data.custom_mode_value: ', this.data.custom_mode_value)
      this.data.custom_mode_value = arr
      console.log(arr)
      console.log('this.data.custom_mode_value: ', this.data.custom_mode_value)
      this.setUserSetting()
    },
    /**
     * 自定义模式 点击checkbox
     */
    talkChange (val) {
      if (val.length) {
        this.data.talk_allocation = '0'
      } else {
        this.data.talk_allocation = '1'
      }
      this.setUserSetting()
    },
    priorityChange (val) {
      this.setUserSetting()
    },
    /**
     * 请求数据
     */
    setUserSetting () {
      this.$http.post('/setUserSetting', {
        setting_type: 'basic_setting',
        basic_setting: JSON.stringify(this.data)
      }).then(() => {
        this.$emit('modeValueChange', this.data.mode_value)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .list {
    display: flex;
    margin-bottom: 15px;
    .title {
      width: 90px;
    }
    .flex {
      display: flex;
      flex-direction: column;
      button {
        margin-top: 15px;
      }
    }
  }
  .setting-ing {
    .tip {
      color: @color-red;
    }
    .check-box {
      margin: 25px 0;
    }
    .flex-box {
      display: flex;
      align-items: baseline;
      .tip {
        margin-top: 6px;
        margin-left: 10px;
      }
      .title {
        width: 90px;
      }
      .el-select {
        margin-left: 12px;
      }
    }
    .check-box-wrap {
      margin: 28px 0;
      display: flex;
      align-items: flex-start;
      .title {
        width: 120px;
      }
      .right-wrap {
        > div {
          margin-bottom: 15px;
        }
      }
    }
  }
</style>


<style lang="less">
  .right-wrap.rule {
    .el-checkbox {
      white-space: inherit;
    }
    .el-checkbox__label {
      display: inline;
    }
  }
  .setting-page {
    .setting-ing {
      .check-box {
        .title {
          width: 120px;
        }
        .el-checkbox {
          white-space: inherit;
          .el-checkbox__label {
            width: 450px;
            vertical-align: top;
          }
        }
      }
    }
  }
</style>
