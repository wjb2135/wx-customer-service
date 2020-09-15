<template>
  <div class="container">
    <ip-address v-show="index == 0" :checkedProps="iPAddressStatus"></ip-address>
    <mac-address v-show="index == 1" :tableData="tableData" :loading="loading" :checkedProps="macAddressStatus"></mac-address>
  </div>
</template>

<script>
import ipAddress from '@/components/setting/security/ipAddress'
import macAddress from '@/components/setting/security/macAddress'

export default {
  components: {
    ipAddress, macAddress
  },
  data () {
    return {
      index: 0,
      settingList: {},
      iPAddressStatus: false,
      macAddressStatus: false,
      pageReady: false,
      tableData: [],
      loading: true
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
        if (this.index === 1 && !this.pageReady) {
          this.pageReady = true
          this.getAddress()
        }
      }
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
        this.iPAddressStatus = res.data.IP_address_limitation_setting === 1
        this.macAddressStatus = res.data.MAC_address_limitation_setting === 1
      })
    },
    /**
     * 获取ip地址
     */
    getAddress () {
      this.$http.post('/get_mac_addresss').then(res => {
        this.loading = false
        this.tableData = res.data
        console.log(this.tableData)
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
  }
</style>