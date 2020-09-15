<template>
  <div class="home-page">
    <div class="title-wrap">
      <div class="lf"><img :src="baseUserInfo.company && baseUserInfo.company.image || ''">{{ baseUserInfo.company && baseUserInfo.company.name }}</div>
      <div class="rg">
        <i class="iconfont" @click="goPage(1)">&#xe6d3;</i>
        <i class="iconfont" @click="goPage">&#xe6d2;</i>
      </div>
    </div>
    <div class="all-data">
      <div class="type">
        <ul>
          <li :class="{active: active === 1}" @click="changeType(1)">今天</li>
          <li :class="{active: active === 2}" @click="changeType(2)">昨天</li>
        </ul>
      </div>
      <div class="list">
        <ul>
          <li>{{headStatistics.sum_access_number}}<p>总接入量</p></li>
          <li>{{headStatistics.queue_length}}<p>排队人数</p></li>
          <li>{{headStatistics.online_time	}}'<p>在线时间</p></li>
          <li>{{headStatistics.login_time}}'<p>登陆时长</p></li>
          <li>{{headStatistics.response_time}}<p>平均响应时间</p></li>
          <li>{{headStatistics.missed_session_count}}<p>错失会话数</p></li>
          <li>{{headStatistics.custom_service_number}}<p>在线客服数</p></li>
        </ul>
      </div>
    </div>

    <!-- 综合数据 -->
    <div class="list-wrap">
      <div class="title">综合数据</div>
      <el-table 
        class="fw-table"
        :data="dayStatistics"
        v-loading="loading"
        style="width: 100%">
        <el-table-column
          fixed
          align="center"
          prop="type"
          width="120">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="sum_session"
          label="总会话数">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="sum_clients"
          label="独立访客数">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="first_clients"
          label="首次访客数">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="effective_session"
          label="有效会话数">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="leave_message"
          label="留电话数">
        </el-table-column>
        <el-table-column
          class-name="table-color-default"
          align="center"
          prop="leave_message_rate"
          label="留电话率">
        </el-table-column>
      </el-table>
    </div>
    <div class="list-wrap se">
      <!-- 客服排名 -->
      <div class="ranking-wrap">
        <template v-if="ownIndex">
          <div class="title">客服排名</div>
          <el-table
            class="fw-table"
            :data="userRanking"
            type="index"
            style="width: 100%"
            v-loading="rankingLoading"
            height="280">
            <el-table-column
              fixed
              align="center"
              label="排名"
              type="index"
              width="120">
              <template slot-scope="scope">
                <img v-if="scope.$index === 0" src="../../assets/images/home/rank1.png">
                <img v-else-if="scope.$index === 1" src="../../assets/images/home/rank2.png">
                <img v-else-if="scope.$index === 2" src="../../assets/images/home/rank3.png">
                <span v-else class="scope">{{scope.$index + 1}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="nickname"
              label="客服"
              align="center"
              width="180">
              <template slot-scope="scope">
                <img class="avatar" :src="scope.row.avatar || ''">
                <span class="nick">{{scope.row.nickname}}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="session_count"
              align="center"
              label="会话数">
            </el-table-column>
            <el-table-column
              prop="effect_session_count"
              align="center"
              label="有效会话数">
            </el-table-column>
            <el-table-column
              prop="leave_message_count"
              align="center"
              label="留电话数">
            </el-table-column>
            <el-table-column
              prop="missed_session_count"
              align="center"
              label="错失会话数">
            </el-table-column>
          </el-table>
        </template>
        <div class="title">我的排名</div>
        <el-table
          class="fw-table"
          :data="customRanking"
          type="index"
          style="width: 100%">
          <el-table-column
            fixed
            align="center"
            label="排名"
            type="index"
            width="120">
            <template slot-scope="scope">
              <img v-if="scope.row.rank_no === 1" src="../../assets/images/home/rank1.png">
              <img v-else-if="scope.row.rank_no === 2" src="../../assets/images/home/rank2.png">
              <img v-else-if="scope.row.rank_no === 3" src="../../assets/images/home/rank3.png">
              <span v-else class="scope">{{scope.row.rank_no}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="nickname"
            label="客服"
            align="center"
            width="180">
            <template slot-scope="scope">
              <img class="avatar" :src="scope.row.avatar">
              <span class="nick">{{scope.row.nickname}}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="session_count"
            align="center"
            label="会话数">
          </el-table-column>
          <el-table-column
            prop="effect_session_count"
            align="center"
            label="有效会话数">
          </el-table-column>
          <el-table-column
            prop="leave_message_count"
            align="center"
            label="留电话数">
          </el-table-column>
          <el-table-column
            prop="missed_session_count"
            align="center"
            label="错失会话数">
          </el-table-column>
        </el-table>
      </div>
      <!-- 实时数据 -->
      <div class="on-time-data">
        <div class="title">实时数据</div>
        <div class="visit-wrap">
          <div class="wrap" v-if="ownIndex">
            <div class="head"><span>总访问量：</span>{{timeStatistics.user_data.visit_count}}</div>
            <p><span>在线访客：</span>{{timeStatistics.user_data.online_clients}}</p>
            <p><span>等待接待：</span>{{timeStatistics.user_data.await_clients}}</p>
            <p><span>正在接待：</span>{{timeStatistics.user_data.reception_clients}}</p>
            <p><span>留言访客：</span>{{timeStatistics.user_data.leave_message_clients}}</p>
          </div>
          <div class="wrap">
            <div class="head"><span>我的访问量：</span>{{timeStatistics.custom_data.visit_count}}</div>
            <p><span>在线访客：</span>{{timeStatistics.custom_data.online_clients}}</p>
            <p><span>正在接待：</span>{{timeStatistics.custom_data.reception_clients}}</p>
            <p><span>留言访客：</span>{{timeStatistics.custom_data.leave_message_clients}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { shell } from 'electron'
const ipc = require('electron').ipcRenderer
export default {
  data () {
    return {
      csInfo: {},
      active: 1,
      headStatistics: {},
      dayStatistics: [],
      customRanking: [],
      userRanking: [],
      timeStatistics: {
        user_data: {},
        custom_data: {}
      },
      loading: true,
      rankingLoading: true,
      pageLoading: true
    }
  },
  // watch: {
  //   status: {
  //     handler () {
  //       console.log('home watch: status', this.status)
  //       if (this.status === 4) {
  //         console.log('home watch: status', this.status)
  //         // this.pageLoading = false
  //         // this.$store.dispatch('windowChangeLoading', false)
  //         // setTimeout(() => {
  //         // this.$emit('homeLogout', {
  //         //   ipc: 'login-window-show',
  //         //   path: '/login'
  //         // })
  //         // }, 300)
  //         // setTimeout(() => {
  //         //   this.$emit('windowChange', {
  //         //     ipc: 'login-window-show',
  //         //     path: '/login'
  //         //   })
  //         // }, 300)
  //       }
  //     },
  //     deep: true
  //   }
  // },
  created () {
    this.getData()
  },
  methods: {
    /**
     * 各种数据
     */
    getData () {
      this.getDayStatistics(1)
      this.getServiceRanking(0)
      this.getTimeStatistics()
      this.getheadStatistics()
    },
    /**
     * 跳转外部浏览器
     */
    goPage (params) {
      if (params) {
        shell.openExternal(this.sysConfig.platform_url)
      } else {
        shell.openExternal(this.sysConfig.statistics_url)
      }
    },
    /**
     * 切换 今天/昨天
     */
    changeType (type) {
      this.active = type
      this.getDayStatistics(type)
      if (type === 1) {
        this.getServiceRanking(0)
      } else {
        this.getServiceRanking(1)
      }
      this.loading = true
      this.rankingLoading = true
    },
    /**
     * 获取头部统计
     */
    getheadStatistics () {
      this.$http.post('/head_statistics').then(res => {
        this.headStatistics = res.data
      })
    },
    /**
     * 获取综合数据（今日/昨天）
     */
    getDayStatistics (type) {
      this.$http.post('/day_statistics', {
        day_type: type
      }).then(res => {
        this.dayStatistics = []
        let userData = res.data.user_data
        let customData = res.data.custom_data
        let rate = '%'
        userData.type = '全部'
        customData.type = '我的'
        this.dayStatistics.push(userData)
        this.dayStatistics.push(customData)
        let percentData = {}
        percentData.type = '比例'
        percentData.sum_session = userData.sum_session !== 0 ? (customData.sum_session / userData.sum_session * 100).toFixed(2) + rate : '-'
        percentData.sum_clients = userData.sum_clients !== 0 ? (customData.sum_clients / userData.sum_clients * 100).toFixed(2) + rate : '-'
        percentData.first_clients = userData.first_clients !== 0 ? (customData.first_clients / userData.first_clients * 100).toFixed(2) + rate : '-'
        percentData.effective_session = userData.effective_session !== 0 ? (customData.effective_session / userData.effective_session * 100).toFixed(2) + rate : '-'
        percentData.leave_message = userData.leave_message !== 0 ? (customData.leave_message / userData.leave_message * 100).toFixed(2) + rate : '-'
        percentData.leave_message_rate = userData.leave_message_rate !== 0 ? (customData.leave_message_rate / userData.leave_message_rate * 100).toFixed(2) + rate : '-'
        this.dayStatistics.push(percentData)
        this.loading = false
      })
    },
    /**
     * 客服排名
     */
    getServiceRanking (type) {
      this.$http.post('/custom_service_ranking', {
        day_type: type
      }).then(res => {
        this.rankingLoading = false
        this.userRanking = res.data.user_ranking
        this.customRanking = []
        this.customRanking.push(res.data.custom_ranking)
      })
    },
    /**
     * 实时数据
     */
    getTimeStatistics () {
      this.$http.post('/real_time_statistics').then(res => {
        this.timeStatistics.user_data = res.data.user_data
        this.timeStatistics.custom_data = res.data.custom_data
      })
    }
  },
  computed: {
    ...mapGetters([
      'sysConfig',
      'baseUserInfo'
    ]),
    // 无权限的话 主页只显示自己账号数据
    ownIndex () {
      return this.baseUserInfo.position.power.service.includes('index');
    },
    status () {
      return this.baseUserInfo.online_status
    },
    baseUserInfo () {
      return this.$store.state.user.baseUserInfo
    }
    // pageLoading () {
    //   return this.$store.state.user.windowChangeLoading
    // }
  }
  // beforeDestroy () {
  //   console.log('首页销毁')
  //   // this.pageLoading = false
  // }
}
</script>

<style lang="less" scoped>
  .home-page {
    padding: 10px 20px;
    background: #f1f3f5;
    .title-wrap {
      display: flex;
      align-items: center;
      margin: 13px 0 12px;
      .lf {
        flex: 1;
        display: flex;
        align-items: center;
        img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
      }
      .rg {
        display: flex;
        i {
          cursor: pointer;
          background: #d0e6ff;
          color: #2483f3;
          font-size: 31px;
          padding: 8px;
          border-radius: 10px;
          margin-left: 15px;
          cursor: pointer;
        }
      }
    }
    .all-data {
      display: flex;
      padding: 9px 10px;
      background: @background-color-base;
      border-radius: 4px;
      .type {
        flex: 1;
        display: flex;
        align-items: center;
        ul {
          border: 1px solid @color-primary;
          border-radius: 4px;
          width: 140px;
          font-size: 0;
          li {
            cursor: pointer;
            display: inline-block;
            width: 50%;
            color: @color-primary;
            padding: 5px 0;
            font-size: @font-size-base;
            text-align: center;
            &.active {
              background: @color-primary;
              color: @color-white;
            }
          }
        }
      }
      .list {
        ul {
          li {
            display: inline-block;
            color: @color-primary;
            margin-left: 29px;
            font-size: 20px;
            p {
              color: @color-text-secondary;
              margin-top: 5px;
              font-size: @font-size-small;
            }
          }
        }
      }
    }
    .list-wrap {
      &.se {
        display: flex;
        padding-right: 230px;
      }
      .title {
        font-size: @font-size-big;
        color: #464c54;
        font-weight: bold;
        position: relative;
        padding-left: 12px;
        line-height: 0.9;
        margin: 27px 0 16px;
        &::before {
          content: '';
          position: absolute;
          width: 4px;
          height: 100%;
          left: 0;
          background: @color-primary;
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
        }
      }
      .ranking-wrap {
        width: 100%;
        .fw-table {
          .nick {
            position: relative;
            top: -8px;
            margin-left: 8px;
          }
          .avatar {
            width: 30px;
            height: 30px;
            border-radius: 50%;
          }
          .scope {
            background: #eaedf0;
            border-radius: 50%;
            display: inline-block;
            width: 30px;
            height: 30px;
            line-height: 30px;
          }
        }
      }
      .on-time-data {
        width: 210px;
        position: absolute;
        right: 20px;
        .visit-wrap {
          background: #117de9;
          border-radius: 4px;
          color: @color-white;
          padding: 4px 3px;
          .wrap {
            margin-bottom: 15px;
          }
          .head {
            font-weight: bold;
            padding: 8.5px 16px;
            background: rgba(126, 185, 255, 0.5);
            border-radius: 4px;
            margin-bottom: 5px;
          }
          p {
            margin: 10px 0;
            padding-left: 16px;
          }
        }
      }
    }
  }
</style>

<style lang="less">
  .home-page {
    td.table-color-default {
      color: @color-primary;
    }
    .fw-table {
      &.el-table td, &.el-table th {
        padding: 10px 0;
      }
    }
  }
</style>