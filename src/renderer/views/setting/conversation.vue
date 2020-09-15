<template>
  <div class="container setting-page">
    <conversation-time v-if="index == 0"></conversation-time>
    <conversation-visitor v-else-if="index == 1"></conversation-visitor>
    <conversation-rule v-else-if="index == 2"></conversation-rule>
    <conversation-close-reason v-else-if="index == 3"></conversation-close-reason>
    <conversation-type v-else-if="index == 4"></conversation-type>
    <reservation-invite v-else-if="index == 5"></reservation-invite>
    <check-box v-else :checkList="checkList" :list="list" @changeBox="changeBox" title="其他设置"></check-box>
  </div>
</template>

<script>
import checkBox from '@/components/setting/checkBoxConversation'
import conversationTime from '@/components/setting/conversation/time'
import conversationVisitor from '@/components/setting/conversation/visitor'
import conversationRule from '@/components/setting/conversation/rule'
import conversationCloseReason from '@/components/setting/conversation/closeReason'
import conversationType from '@/components/setting/conversation/type'
import reservationInvite from '@/components/setting/conversation/reservationInvite'

export default {
  components: {
    checkBox,
    conversationTime,
    conversationVisitor,
    conversationRule,
    conversationCloseReason,
    conversationType,
    reservationInvite
  },
  data () {
    return {
      index: 0,
      timeSetting: {},
      tagList: [],
      pageReady: false,
      list: [
        {value: '只显示说话的访客'},
        {value: '只记录未读留言：未读'},
        {value: '全部留言：未读+已读'}
      ],
      checkList: [],
      otherSetting: 0
    }
  },
  watch: {
    '$route' (to, from) { // 监听 传参
      this.index = this.$route.query.index
      if (this.index === undefined) {
        this.index = 0
      }
    },
    index: {
      handler () {
        if (this.index === 6 && !this.pageReady) {
          this.pageReady = true
          this.getUserSetting()
        }
      }
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    /**
     * 获取系统设置
     */
    getUserSetting () {
      this.$http.post('/getUserSetting').then(res => {
        this.seniorSetting = res.data.senior_setting
        this.otherSetting = Number(res.data.other_setting) - 1
        this.checkList.push(this.list[this.otherSetting].value)
      })
    },
    changeBox (val) { // 其他设置
      let otherSetting = this.list[this.otherSetting].value
      if (val.length) {
        val.forEach((item, index) => {
          if (item !== otherSetting) {
            this.checkList = [item]
            this.list.forEach((item1, index1) => {
              if (item1.value === item) {
                this.otherSetting = index1
              }
            })
          }
        })
      } else {
        console.log('可以加', val)
        this.checkList.push(otherSetting)
      }
      this.$http.post('/setUserSetting', {
        setting_type: 'other_setting',
        other_setting: this.otherSetting + 1
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    width: 100%;
  }
</style>