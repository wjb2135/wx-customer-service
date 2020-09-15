<template>
  <div class="page-monitor-data-public">
    <div v-show="showType == 1" id="chart_public"></div>
    <el-table
      v-show="showType == 2"
      :data="officialTable"
      style="width: 100%"
      class="fw-table visitor-table"
      size="mini"
      stripe
      highlight-current-row
      tooltip-effect="dark"
    >
      <el-table-column prop="weixin_account" label="公众号名称" width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="follow_official_account" label="今日关注人数" ></el-table-column>
      <el-table-column prop="unfollow_official_account" label="今日取注人数" ></el-table-column>
      <el-table-column prop="visit_number" label="今日来访人数" ></el-table-column>
      <el-table-column prop="sum_number" label="今日总访问人数" ></el-table-column>
      <el-table-column prop="conversion_number" label="今日转换人数" ></el-table-column>
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
      officialInfo: {},
      chartHeight: '',
      myChart: null,
      officialTable: []
    };
  },
  mounted () {
    this.allInit()
    window.onresize = () => {
      this.myChart.resize()
    }
  },
  methods: {
    allInit () {
      this.$nextTick(async () => {
        if (this.showType === 1) {
          await this.getOfficialAccountList();
          this.init();
        } else if (this.showType === 2) {
          this.getOfficialTable();
        }
      });
    },
    /**
     * 获取公众号表格数据
     */
    getOfficialTable () {
      return this.$http.post('/official_account_day_list', {nick_name: this.name}).then(res => {
        if (res.data && res.data.length > 0) {
          this.officialTable = res.data
        } else {
          this.officialTable = []
        }
        this.$emit('isData', this.officialTable.length <= 0)
      })
    },
    /**
     * 获取公众号图表数据
     */
    getOfficialAccountList () {
      return this.$http.post('/official_account_list', {nick_name: this.name}).then(res => {
        this.officialInfo = res.data
        this.$emit('isData', Object.keys(this.officialInfo).length <= 0)
      })
    },
    init () {
      if (this.showType !== 1 || Object.keys(this.officialInfo).length <= 0) {
        this.myChart && this.myChart.clear()
        return;
      }
      this.myChart = echarts.init(document.getElementById('chart_public'));
      let option = {
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: [
            '今日关注人数',
            '今日取关人数',
            '今日来访人数',
            '今日总访问人数',
            '今日转换人数'
          ]
        },
        grid: {
          top: 70,
          bottom: 30
        },
        xAxis: {
          type: 'category',
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            onZero: false
          },
          boundaryGap: false,
          data: [
            '00:00',
            '02:00',
            '04:00',
            '06:00',
            '08:00',
            '10:00',
            '12:00',
            '14:00',
            '16:00',
            '18:00',
            '20:00',
            '22:00'
          ]
        },
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '今日关注人数',
            type: 'line',
            data: this.officialInfo.follow_official_account,
            color: '#2483f3',
            smooth: true
          },
          {
            name: '今日取关人数',
            type: 'line',
            data: this.officialInfo.unfollow_official_account,
            color: '#fa5076',
            smooth: true
          },
          {
            name: '今日来访人数',
            type: 'line',
            data: this.officialInfo.visit_number,
            color: '#4be9cb',
            smooth: true
          },
          {
            name: '今日总访问人数',
            type: 'line',
            data: this.officialInfo.sum_number,
            color: '#ffcc6c',
            smooth: true
          },
          {
            name: '今日转换人数',
            type: 'line',
            data: this.officialInfo.conversion_number,
            color: '#be91ff',
            smooth: true
          }
        ]
      };
      this.myChart.setOption(option);
    }
  },
  watch: {
    showType () {
      this.$nextTick(() => {
        this.allInit();
      })
    }
  }
};
</script>

<style lang="less" scoped>
.page-monitor-data-public {
  height: 100%;
  #chart_public {
    padding-top: 22px;
    height: 100%;
    min-height: 350px;
  }
}
</style>