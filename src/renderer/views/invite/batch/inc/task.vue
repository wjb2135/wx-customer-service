<template>
  <div class="task-dialog">
    <Dialog title="发送任务确认">
      <div class="content">
        <div class="info-block">
          <!-- 批量邀请名称 -->
          <div class="block">
            <p class="title">批量邀请名称</p>
            <el-input v-model="name" size="mini" placeholder="请输入任务名称" maxlength="25"></el-input>
          </div>
          <!-- 批量邀请条件 -->
          <div class="block">
            <p class="title">批量邀请条件</p>
            <div class="condition">
              发送给:{{condition}}</div>
          </div>
          <!-- 批量邀请内容 -->
          <div class="block">
            <p class="title">批量邀请内容</p>
            <mediaType :editAble = false :clearAble = false :data="inviteFormChat"></mediaType>
          </div>
          <!-- 确认发送公众号 -->
          <div class="block">
            <p class="title">确认发送公众号</p>
            <div class="table">
              <el-table
                :data="list"
                style="width: 100%"
                size="mini"
                highlight-current-row
                class="visitor-table"
                @selection-change="handleSelectionChange"
              >
                >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="公众号" prop="weixin_account_name"></el-table-column>
                <el-table-column label="预计发送人数" prop="count"></el-table-column>
                <el-table-column label="状态">
                  <template>
                    <span>准备</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="choose">
          <span>共{{official}}个公众号</span>
          <span>,预计发给{{totall}}人</span>
        </div>
        <div class="right">
          <el-button type="primary" @click="submit" size="mini">发送</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import Dialog from '@/components/Dialog';
import mediaType from '@/components/mediaType/index';
export default {
  components: {
    Dialog,
    mediaType
  },
  data () {
    return {
      // 公众号数量
      official: 0,
      // 人数
      totall: 0,
      // 列表
      list: [],
      // 名称
      name: '',
      // 条件
      condition: '',
      // 选中的值
      checkedData: []
    };
  },
  created () {
    let serviceName = this.baseUserInfo.realname || this.baseUserInfo.nickname
    this.groupList()
    this.name = this.$utilscore.formatTime(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss') + ' ' + serviceName
    this.condition = this.$route.query.condition
  },
  methods: {
    submit () {
      if (!this.name) {
        return this.$message.error('请输入邀请名称')
      }
      if (this.checkedData.length <= 0) {
        return this.$message.error('请选择至少一个公众号进行批量邀请')
      }
      let data = {
        idStr: '',
        appid: ''
      }
      this.checkedData.forEach((item) => {
        if (data.idStr === '') {
          data.idStr = item.idStr
          data.appid = item.appid
        } else {
          data.idStr += `,${item.idStr}`
          data.appid += `,${item.appid}`
        }
      })
      console.log(this.checkedData, 'this.checkedData')

      this.$ipcSend('sendTask', {title: this.name, data: data})
      this.$Win.closeWin()
    },
    handleSelectionChange (val) {
      this.totall = 0;
      this.checkedData = val
      this.official = this.checkedData.length
      if (this.checkedData.length > 0) {
        this.checkedData.forEach((item) => {
          this.totall += item.count
        })
      }
    },
    /**
     * 按公众号分组
     */
    groupList () {
      let weixinArray = {}
      this.inviteUserList.forEach((item) => {
        if (weixinArray[item.weixin_account_name]) {
          weixinArray[item.weixin_account_name].idStr += `,${item.id}`
          weixinArray[item.weixin_account_name].idArray.push(item.id)
          weixinArray[item.weixin_account_name].count++
        } else {
          weixinArray[item.weixin_account_name] = {
            weixin_account_name: item.weixin_account_name,
            appid: item.wx_appid,
            idStr: item.id,
            idArray: [item.id],
            count: 1
          }
        }
      })
      this.list = Object.values(weixinArray)
    }
  },
  computed: {
    ...mapGetters(['inviteFormChat', 'baseUserInfo', 'inviteUserList'])
  }
};
</script>
<style lang="less">
.task-dialog{
  .dialog__body{
    height: 551px;
    overflow-y: auto;
  }
}
</style>
<style lang="less" scoped>
.task-dialog {
  height: 100%;
  .block{
    margin-bottom: 10px;
    .title{
      margin-bottom: 15px;
      color: @color-text-secondary;
    }
    .condition{
      padding: 3px;
      background-color: #f2f2f2;
      color: @color-text-placeholder;
      line-height: 1.5;
      font-size: 12px;
    }
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>