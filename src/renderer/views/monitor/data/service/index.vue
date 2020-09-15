<template>
  <div class="page-monitor-data-service">
    <div v-show="showType == 1" id="chart_service"></div>
    <el-table
      v-show="showType == 2"
      :data="serviceInfo"
      style="width: 100%"
      class="fw-table visitor-table"
      size="mini"
      stripe
      highlight-current-row
      tooltip-effect="dark"
    >
      <el-table-column prop="custom_service_name" label="客服名称" width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="sum_session" label="会话总数"></el-table-column>
      <el-table-column prop="effect_session" label="有效会话数"></el-table-column>
      <el-table-column prop="leave_mobile" label="留电话数"></el-table-column>
      <el-table-column prop="missed_session_count" label="错失会话数"></el-table-column>
      <el-table-column prop="no_reception" label="未应答数"></el-table-column>
      <el-table-column prop="follow_official_account" label="新关注会话数" width="110"></el-table-column>
      <el-table-column prop="unfollow_official_account" label="取关会话数" width="90"></el-table-column>
      <el-table-column prop="visit_number" label="仅访问会话数" width="110"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import echarts from 'echarts';
export default {
  props: {
    name: {
      type: String,
      default: ''
    },
    showType: {
      type: [String, Number],
      deafalut: 1
    }
  },
  data () {
    return {
      serviceInfo: [],
      chartServiceInfo: {},
      myChart: null,
      custom_service_name: ''
    };
  },
  mounted () {
    this.custom_service_name = this.name
    this.allInit()
    window.onresize = () => {
      this.myChart.resize();
    };
  },
  methods: {
    allInit () {
      this.$nextTick(async () => {
        await this.getServiceList();
        this.init();
      });
    },
    getServiceList () {
      return this.$http.post('/custom_service_statistics_list', {custom_service_name: this.custom_service_name}).then(res => {
        if (res.data && res.data.length > 0) {
          this.serviceInfo = res.data;
          this.chartServiceInfo = res.data.map(item => {
            return {
              product: item.custom_service_name,
              '总会话数': item.sum_session,
              '有效会话数': item.effect_session,
              '留电话数': item.leave_mobile,
              '主动邀请数': item.invitation_number,
              '错失会话数': item.missed_session_count
            };
          });
        } else {
          this.serviceInfo = []
          this.chartServiceInfo = []
        }
        this.$emit('isData', this.serviceInfo.length <= 0)
      });
    },
    init () {
      if (this.showType !== 1 || this.chartServiceInfo.length <= 0) {
        this.myChart && this.myChart.clear()
        return;
      }
      this.myChart = echarts.init(document.getElementById('chart_service'));
      let option = {
        legend: {},
        tooltip: {},
        grid: {
          bottom: '26%'
        },
        dataset: {
          dimensions: [
            'product',
            '总会话数',
            '有效会话数',
            '留电话数',
            '主动邀请数',
            '错失会话数'
          ],
          source: this.chartServiceInfo
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 45,
            textStyle: {
              color: 'gray',
              fontSize: 11
            }
          }
        },
        yAxis: {},
        series: [
          { type: 'bar', color: '#2483f3' },
          { type: 'bar', color: '#fa5076' },
          { type: 'bar', color: '#4be9cb' },
          { type: 'bar', color: '#ffcc6c' },
          { type: 'bar', color: '#be91ff' }
        ]
      };
      this.myChart.setOption(option);
    }
  },
  watch: {
    showType () {
      this.$nextTick(() => {
        this.init();
      });
    },
    name () {
      this.custom_service_name = this.name
    }
  }
};
</script>

<style lang="less" scoped>
.page-monitor-data-service {
  height: 100%;
  #chart_service {
    padding-top: 22px;
    height: 100%;
    min-height: 350px;
  }
}
</style>