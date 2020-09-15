<template>
  <div class="container template-choose">
    <div class="left-list">
      <p 
        :class="activeClass === index ? 'active' : ''"
        v-for="(item, index) in list" 
        :key="index"
        @click="listClick(index)">{{item}}</p>
    </div>
    <div class="rg-list">
      <div class="content">
        <div 
          class="list" 
          v-for="(item, index) in templateList.data" 
          :key="index"
          :class="chooseActiveClass === index ? 'active' : ''"
          @click="chooselist(index)">
          <div class="title">
            {{item.name}}
            <div class="date">{{item.created_at}}</div>
          </div>
          <div class="info-list">
            <p v-for="(key, value) in item.weixin_template.content" :key="value">
              <span v-if="key">{{key}}: </span>
              <span v-else>{{key}}</span>
              <span>{{item.content[value].value}}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="pagination">
          <el-pagination
            :page-size="templateList.pageSize"
            :pager-count="5"
            layout="prev, pager, next"
            :total="templateList.total" @change="pageChange">
          </el-pagination>
          共{{sumClients}}个访客
        </div>
        <div class="btn-wrap">
          <el-button type="primary" size="mini" @click="edit">编辑</el-button>
          <el-button type="primary" size="mini" @click="submit">确定</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    templateList: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      activeClass: 0,
      chooseActiveClass: 0,
      list: ['全部模板'],
      total: 0,
      pageSize: 0,
      page: 1,
      sumClients: '',
      id: 0,
      form: [],
      win: ''
    }
  },
  watch: {
    templateList: {
      handler () {
        this.chooselist(0)
      },
      deep: true
    }
  },
  created () {
    this.getStatistics()
    this.win = this.$route.query.winbox || ''
  },
  methods: {
    /**
     * 获取访客数据
     */
    getStatistics () {
      this.$http.post('/realtime_statistics').then(res => {
        this.sumClients = res.data.sum_clients
      })
    },
    /**
     * 当前点击高亮
     */
    chooselist (i) {
      this.chooseActiveClass = i
      this.selectList = this.templateList.data[i]
      this.form = this.selectList.content
      // console.log('赋值', this.form)
    },
    /**
     * 编辑
     */
    edit () {
      if (!this.selectList) {
        this.selectList = this.templateList.data[0]
      }
      console.log('传值', this.selectList)
      console.log('win', this.win)
      require('electron').remote.getGlobal('sharedObject').someProperty = this.selectList
      this.newWindows('/setting/editTemplate?winbox=5&win=' + this.win, {width: 480, height: 580})
    },
    /**
     * 确定
     */
    submit () {
      if (!this.selectList) {
        this.selectList = this.templateList.data[0]
      }
      console.log('传值', this.selectList)
      this.$emit('wxtemplate', this.selectList)
    },
    /**
     * 搜索
     */
    handleIconClick () {
      console.log('搜索')
    },
    pageChange (i) {
      console.log(i)
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    .rg-list {
      flex: 1;
      position: relative;
      .header {
        padding: 10px 16px;
        border-bottom: 1px solid @border-color;
        .input {
          width: 230px;
          background: #f7f9f9;
        }
      }
      .content {
        font-size: 0;
        border-radius: 4px;
        padding: 16px 6px 16px 16px;
        height: 376px;
        overflow: auto;
        .list {
          border: 1px solid #e2f0ff;
          font-size: 14px;
          display: inline-block;
          margin-right: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
          overflow: hidden;
          width: 48%;
          &.active {
            border: 2px solid @color-primary;
          }
          .title {
            padding: 10px;
            background: #e2f0ff;
            color: @color-primary;
            .date {
              color: @color-text-secondary;
            }
          }
          .info-list {
            height: 116px;
            padding: 10px;
            overflow-y: auto;
            > div {
              margin-bottom: 12px;
            }
            p {
              min-height: 20px;
              span {
                display: inline-block;
                vertical-align: top;
                &:first-of-type {
                  min-width: 80px;
                }
              }
            }
          }
        }
      }
      .footer {
        position: absolute;
        right: 0;
        bottom: 10px;
        border-top: 1px solid @border-color;
        width: 100%;
        padding: 10px 16px 0;
        display: flex;
        align-items: center;
        .pagination {
          flex: 1;
          > div {
            display: inline-block;
            vertical-align: middle;
          }
        }
      }
    }
  }
</style>

<style lang="less">
  .conversation-template {
    .rg-list {
      p {
        line-height: 1.5;
      }
    }
  }
  .template-choose {
    .el-input__inner {
      border-radius: 20px;
      border: none;
      background: #f7f9f9;
    }
  }
</style>
