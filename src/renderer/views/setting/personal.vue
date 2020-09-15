<template>
  <div>
    <check-box :checkList="checkList" :list="list" @changeBox="changeBox" title="提醒"></check-box>
  </div>
</template>

<script>
import checkBox from '@/components/setting/checkBox'
import db from '../../utils/db'
export default {
  components: {
    checkBox
  },
  data () {
    return {
      list: ['开启新到等待接待访客提醒', '关闭提示音', '开机自动启动'],
      checkList: []
    }
  },
  created () {
    this.getData()
    db.db.customSetting.loadDatabase()
  },
  methods: {
    /**
     * 获取数据
     */
    getData () {
      this.$http.post('/getCustomSetting').then(res => {
        let data = res.data.notice_setting
        if (data.new_visitor_notice === 1) {
          this.checkList.push('开启新到在线访客提醒')
        }
        if (data.wait_visitor_notice === 1) {
          this.checkList.push('开启新到等待接待访客提醒')
        }
        if (data.combine_notice === 1) {
          this.checkList.push('合并同类型的提醒')
        }
        if (data.close_learning_notice === 1) {
          this.checkList.push('关闭提示音')
        }
        if (data.auto_learning_notice === 1) {
          this.checkList.push('开机自动启动')
        }
      })
    },
    /**
     * select
     */
    changeBox (val) {
      this.checkList = val
      this.setCustomSetting()
    },
    /**
     * 请求数据
     */
    setCustomSetting () {
      let setting = {
        new_visitor_notice: 0,
        wait_visitor_notice: 0,
        combine_notice: 0,
        close_learning_notice: 0,
        auto_learning_notice: 0
      }
      this.checkList.forEach(element => {
        if (element === '开启新到在线访客提醒') {
          setting.new_visitor_notice = 1
        }
        if (element === '开启新到等待接待访客提醒') {
          setting.wait_visitor_notice = 1
        }
        if (element === '合并同类型的提醒') {
          setting.combine_notice = 1
        }
        if (element === '关闭提示音') {
          setting.close_learning_notice = 1
        }
        if (element === '开机自动启动') {
          setting.auto_learning_notice = 1
        }
      });
      this.$http.post('/setCustomSetting', {
        setting_type: 'notice_setting',
        notice_setting: JSON.stringify(setting)
      }).then((res) => {
        db.db.customSetting.find({}, function (err, docs) {
          if (err) {
            console.log(err)
          } else {
            if (docs && docs.length > 0) {
              console.log('更新新值')
              db.db.customSetting.update({}, setting, {}, function (err, numReplaced, upsert) {
                console.log(err)
                console.log(numReplaced)
                console.log(upsert)
              });
            } else {
              console.log('插入新值')
              db.db.customSetting.insert(setting, function (err, newDoc) {
                console.log(err)
                console.log(newDoc)
              });
            }
          }
        })
        this.ipc.send('reloadDbCustomSetting')
        if (setting.auto_learning_notice === 1) {
          this.ipc.send('openAutoStartApp')
        } else {
          this.ipc.send('closeAutoStartApp')
        }
      }).catch(err => {
        this.$message.error(err.message)
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    margin: 28px 30px;
    display: flex;
    .title {
      width: 60px;
    }
    .right-wrap {
      margin-top: 3px;
      > div {
        margin-bottom: 15px;
      }
    }
  }
</style>

<style lang="less">
</style>
