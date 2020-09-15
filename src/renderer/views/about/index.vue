<template>
  <div>
    <mainHead slot="header" title="关于"></mainHead>
    <div class="about-page">
      <!-- 公司名称 logo -->
      <div class="name-wrap flex-box">
        <img :src="system.company_icon">
        <div>
          <h2>{{system.company_name}}</h2>
          <p>软件名称：{{system.software_name}}</p>
        </div>
      </div>
      <!-- 信息 -->
      <div class="info flex-box">
        <div>
          <ul>
            <li>当前版本：{{userInfo.group_name}}</li>
            <li>企业名称：{{system.company_name}}</li>
            <li>授权日期：{{userInfo.group_create_time}} - {{userInfo.group_expire}}</li>
            <li>有效期限：{{userInfo.expire_day}}</li>
            <li>剩余时间：{{userInfo.expire_day}}</li>
            <li>授权坐席：{{userInfo.max_custom_service_seat}}</li>
          </ul>
          <div>公司官网：<span class="link" @click="openUrl">{{system.company_website}}</span></div>
          <div>联系电话：{{system.company_phone}}</div>
        </div>
        <div>
          <img :src="system.weixin_qrcode">
          扫码关注{{system.company_name}}公众号
        </div>
      </div>
      <!-- 协议 -->
      <div class="protocol-wrap">
        <div class="title">用户协议</div>
        <div class="content">{{system.user_protocol}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'
import mainHead from '@/components/windows/mainHead.vue'
export default {
  components: {
    mainHead
  },
  data () {
    return {
      system: {},
      userInfo: {}
    }
  },
  created () {
    this.getInfo()
  },
  methods: {
    /**
     * 获取数据
     */
    getInfo () {
      this.$http.post('/system.about').then(res => {
        this.system = res.data
      })
      this.$http.post('/cs.info').then((res) => {
        this.userInfo = res.data
      });
    },
    /**
     * 打开链接
     */
    openUrl () {
      shell.openExternal(this.system.company_website)
    }
  }
}
</script>

<style lang="less" scoped>
  .about-page {
    padding: 20px 15px 10px;
    line-height: 1.5;
    .flex-box {
      display: flex;
    }
    .name-wrap {
      color: @color-primary;
      margin-bottom: 20px;
      align-items: center;
      img {
        width: 54px;
        height: 54px;
        border-radius: 6px;
        margin-right: 10px;
      }
    }
    .info {
      margin-bottom: 20px;
      > div {
        margin-right: 30px;
        ul {
          margin-bottom: 20px;
          width: 202px;
        }
        .link {
          color: @color-primary;
          text-decoration: underline;
          cursor: pointer;
        }
        img {
          width: 100%;
        }
      }
    }
    .protocol-wrap {
      .title {
        color: @color-primary;
        margin-bottom: 10px;
      }
      .content {
        height: 150px;
        overflow: scroll;
        padding: 10px;
        border: 1px solid @border-color;
      }
    }
  }
</style>