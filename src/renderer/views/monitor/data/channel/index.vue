<template>
  <div class="page-monitor-data-channel">
    <div v-show="showType == 1" id="chart_channel"></div>
    <el-table
      v-show="showType == 2"
      :data="tableData"
      style="width: 100%"
      class="fw-table visitor-table"
      size="mini"
      stripe
      highlight-current-row
      tooltip-effect="dark"
    >
      <el-table-column prop="publicName" label="公众号名称" width="180"></el-table-column>
      <el-table-column prop="channelName" label="渠道名称" width="180"></el-table-column>
      <el-table-column prop="attention" label="今日关注人数" width="180"></el-table-column>
      <el-table-column prop="unfollow" label="今日取注人数" width="180"></el-table-column>
      <el-table-column prop="haunt" label="今日来访人数" width="180"></el-table-column>
      <el-table-column prop="totallHaunt" label="今日总访问人数" width="180"></el-table-column>
      <el-table-column prop="convert" label="今日转换人数" width="180"></el-table-column>
    </el-table>
  </div>
</template>

<script>
import echarts from 'echarts';
export default {
  props: {
    showType: {
      type: [String, Number],
      deafalut: 1
    }
  },
  data () {
    return {
      tableData: [
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        },
        {
          publicName: '老司机聊程序',
          channelName: '多福多寿',
          attention: '0',
          unfollow: '1',
          haunt: '2',
          totallHaunt: '1',
          convert: '2'
        }
      ]
    };
  },
  mounted () {
    this.$nextTick(() => {
      this.init();
    })
  },
  methods: {
    init () {
      if (this.showType !== 1) {
        return
      }
      let myChart = echarts.init(document.getElementById('chart_channel'));
      // let chart.clear();
      let option = {
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: [
            '今日关注人数',
            '今日取注人数',
            '今日来访人数',
            '今日总访问人数',
            '今日转换人数'
          ]
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
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
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '今日关注人数',
            type: 'line',
            stack: '总量',
            data: [0, 10, 26, 38, 54, 62, 88, 120, 132, 101, 134, 90],
            color: '#2483f3'
          },
          {
            name: '今日取注人数',
            type: 'line',
            stack: '总量',
            data: [0, 182, 191, 234, 290, 330, 310, 54, 62, 88, 120, 132],
            color: '#fa5076'
          },
          {
            name: '今日来访人数',
            type: 'line',
            stack: '总量',
            data: [0, 232, 201, 154, 190, 330, 410, 10, 50, 80, 154, 650],
            color: '#4be9cb'
          },
          {
            name: '今日总访问人数',
            type: 'line',
            stack: '总量',
            data: [0, 332, 301, 20, 150, 235, 215, 151, 334, 390, 330, 320],
            color: '#ffcc6c'
          },
          {
            name: '今日转换人数',
            type: 'line',
            stack: '总量',
            data: [0, 123, 154, 354, 345, 386, 486, 568, 457, 458, 855, 698],
            color: '#be91ff'
          }
        ]
      };
      myChart.setOption(option);
    }
  },
  watch: {
    showType () {
      this.$nextTick(() => {
        this.init();
      })
    }
  }
};
</script>

<style lang="less" scoped>
.page-monitor-data-channel {
  height: 100%;
  #chart_channel {
    padding-top: 23px;
    height: 300px;
  }
}
</style>