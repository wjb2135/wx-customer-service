<template>
  <Dialog title="协作成员">
    <div class="cooperation">
      <div class="cooperation-title">协作列表</div>
      <div class="cooperation-main" style="height: 235px;">
        <el-scrollbar style="height:100%">
          <div class="cs-list">
            <div class="cs-item" v-for="(item, index) in cooperationCustomService" :key="index">
              <div class="cs-item-inner">
                <div class="item-avatar">
                  <img :src="item.avatar" alt="">
                </div>
                <div class="item-info">
                  <span>{{item.nickname}}</span>
                </div>
                <div class="del" @click="del(item.id)" v-if="baseUserInfo.id === customServiceId"></div>
              </div>
            </div>
            <div class="add-item" @click="openWinSessionChooseKf"></div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <div slot="footer" class="dialog-footer__cooperation">
      <div class="btn-group">
        <div class="group-l">
          <el-button type="danger" size="small" @click="disband" v-if="baseUserInfo.id === customServiceId">解散</el-button>
          <el-button type="danger" size="small" @click="quit" v-if="baseUserInfo.id !== customServiceId">退出</el-button>
        </div>
        <div class="group-r">
          <el-button type="primary" size="small" @click="doCooperation">确定</el-button>
          <el-button type="primary" size="small" @click="cancel">取消</el-button>   
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data () {
    return {
      cooperationCustomService: [],
      customServiceId: ''
    }
  },
  created () {
    let self = this
    self.id = self.$route.query.id
    self.getCooperationCustomService()
    self.$ipcOn('refreshCooperationCustomService', (event, val) => {
      self.getCooperationCustomService();
    })
  },
  methods: {
    ...mapActions(['setCooperationCustomService']),
    async getCooperationCustomService () {
      let res = await this.$http.post('/user.info', {
        id: this.$route.query.id
      });
      this.uId = res.data.id //  当前接待的主客服ID
      this.customServiceId = res.data.custom_service_id //  当前接待的主客服ID
      this.cooperationCustomService = res.data.cooperation_custom_service // 协作团队
    },
    /**
     * 解散
     */
    disband () {
      let self = this
      self.$dialog.showMessageBox({
        type: 'info',
        title: '解散协作',
        message: '是否确定要解散协作组？',
        buttons: ['ok', 'cancel']
      }, (index) => {
        if (index === 0) {
          self.$http.post('/user.cooperation', {
            id: self.$route.query.id,
            ids: ''
          }).then((res) => {
            this.$Win.closeWin()
            self.$ipcSend('refreshUserInfo')
          })
        } else {
          console.log('You click cancel');
        }
      })
    },
    /**
     * 退出
     */
    quit () {
      this.$dialog.showMessageBox({
        type: 'info',
        title: '退出协作',
        message: '是否确定要退出协作组？',
        buttons: ['ok', 'cancel']
      }, (index) => {
        if (index === 0) {
          this.$http.post('/user.exit_cooperation', {
            id: this.id
          }).then(() => {
            this.$Win.closeWin()
            this.$ipcSend('closeUserChat')
            this.$ipcSend('refreshLeftData')
          })
        } else {
          console.log('You click cancel');
        }
      })
    },
    /**
     * 删除成员
     */
    del (id) {
      let filterArr = this.cooperationCustomService.filter((item) => {
        return item.id !== id
      })
      console.log(filterArr)
      this.cooperationCustomService = filterArr
    },
    /**
     * 设置协作
     */
    doCooperation () {
      let ids = this.cooperationCustomService.map((val, index, arr) => {
        return val.id
      })
      ids = ids.join(',')
      this.$http.post('/user.cooperation', {
        id: this.id,
        ids: ids
      }).then(() => {
        this.$Win.closeWin()
        this.$ipcSend('refreshUserInfo')
      })
    },
    /**
     * 取消
     */
    cancel () {
      this.$Win.closeWin()
    },
    /**
     * 设置协作
     */
    openWinSessionChooseKf () {
      this.newWindows(`/session/chooseKf?id=${this.uId}&type=add`, {width: 400, height: 380})
    }
  },
  watch: {
    newAddCooperationCustomService () {
      if (this.newAddCooperationCustomService) {
        this.cooperationCustomService = [...this.cooperationCustomService, ...this.newAddCooperationCustomService]
      }
    },
    cooperationCustomService () {
      this.setCooperationCustomService(this.cooperationCustomService)
    }
  },
  computed: {
    ...mapGetters(['baseUserInfo', 'newAddCooperationCustomService'])
  }
}
</script>


<style lang="less">
  .cooperation {
    .cooperation-title {
      margin-bottom: 15px;
    }
    .cs-list {
      display: flex;
      flex-wrap: wrap;
      margin: -5px;
      width: 100%;
      .add-item {
        width: 60px;
        height: 60px;
        margin: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f7f7f7;
        &:after {
          content: '\e698';
          font-family: 'iconfont';
          color: #ccc;
          font-size: 20px;
        }
      }
      .cs-item {
        width: 50%;
        .cs-item-inner {
          position: relative;
          margin: 5px;
          background-color: #f7f7f7;
          padding: 15px;
          display: flex;
          align-items: center;
          height: 60px;
        }
        .item-avatar {
          width: 40px;
          height: 40px;
          margin-right: 10px;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50px;
          }
        }
        .del {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 16px;
          height: 16px;
          border-radius: 16px;
          background-color: #bbb;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          &:after {
            content: '\e690';
            font-family: 'iconfont';
            color: #fff;
            line-height: 1;
            display: block;
            font-size: 8px;
          }
        }
      }
    }
  }
  .dialog-footer__cooperation {
    .btn-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
