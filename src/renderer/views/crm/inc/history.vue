<template>
  <div class="page-crm-history">
    <div class="list">
      <div class="search-box">
        <search-bar placeholder="搜索名称,手机号,微信号" v-on:setKeyWord="setKeyWord"></search-bar>
      </div>
      <div class="history-box">
        <div
          class="item"
          :class="index == nowIndex? 'active': ''"
          v-for="(item,index) in history"
          :key="item.date"
          @click="select(index)"
        >
          <!-- 标题 -->
          <p class="title">
            <span>{{item.date}}</span>
            <span>{{item.sponsor}}</span>
          </p>
          <!-- 内容 -->
          <div class="content">
            <div class="remark">
              <p class="info">
                <span class="tips" v-if="!item.remark">请添加会话备注</span>
                <span v-else>{{item.remark}}</span>
              </p>
              <p class="modify">修改</p>
            </div>
            <div class="label-box">
              <p class="info">
                <span v-if="item.label.length == 0" class="tips">请添加会话标签</span>
                <template v-else>
                  <span class="label" v-for="item in item.label" :key="item">{{item}}</span>
                </template>
              </p>
              <p class="modify">修改</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="record">
      <div class="title-box">
        <p>
          客服:
          <span>1条</span>
        </p>
        <p>
          访客:
          <span>5条</span>
        </p>
        <p>
          用时:
          <span>28分</span>
        </p>
      </div>
      <div class="record-box">
        <chatRecord></chatRecord>
      </div>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar';
import chatRecord from '@/components/chatRecord';
export default {
  components: {
    searchBar,
    chatRecord
  },
  data () {
    return {
      nowIndex: 0,
      history: [
        {
          date: '2019.07.05 14:37-15:06',
          sponsor: '访客发起',
          remark: '',
          label: ['老客', '快快快']
        },
        {
          date: '2019.07.01 14:37-15:01',
          sponsor: '访客发起',
          remark:
            '的接口防静电说服力可接受的联发科借贷数量反馈的是减肥克雷登斯代课老师副驾驶都了',
          label: ['老客', '55565989898']
        },
        {
          date: '2019.07.02 14:37-15:06',
          sponsor: '访客发起',
          remark: '',
          label: ['老客', '快快快']
        },
        {
          date: '2019.07.04 14:37-15:01',
          sponsor: '访客发起',
          remark:
            '的接口防静电说服力可接受的联发科借贷数量反馈的是减肥克雷登斯代课老师副驾驶都了',
          label: [
            '老客',
            '55565989898',
            '快dffgg快快',
            '快dfg快快',
            '快快cvb快',
            '快df快快',
            '快快xcv快'
          ]
        },
        {
          date: '2019.07.011 14:37-15:01',
          sponsor: '访客发起',
          remark:
            '的接口防静电说服力可接受的联发科借贷数量反馈的是减肥克雷登斯代课老师副驾驶都了',
          label: [
            '老客',
            '55565989898',
            '快t快快',
            '快4快快',
            '快ecv快快',
            '快xccv快快',
            '快xcv快快'
          ]
        },
        {
          date: '2019.07.04 14:37-15:+1',
          sponsor: '访客发起',
          remark:
            '的接口防静电说服力可接受的联发科借贷数量反馈的是减肥克雷登斯代课老师副驾驶都了',
          label: [
            '老客',
            '55565989898',
            '快x快快',
            '快xc快快',
            'd',
            '快ss快快',
            '快g快快'
          ]
        },
        {
          date: '2019.07.04 14:37-15:11',
          sponsor: '访客发起',
          remark:
            '的接口防静电说服力可接受的联发科借贷数量反馈的是减肥克雷登斯代课老师副驾驶都了',
          label: ['老客', '55565989898', 'aa', 'dd', 'ss', 'ff', 'gg']
        }
      ]
    };
  },
  methods: {
    setKeyWord () {},
    select (val) {
      this.nowIndex = val;
    }
  }
};
</script>

<style lang="less" scoped>
.page-crm-history {
  height: 100%;
  display: flex;
  .list {
    flex: 1 0 300px;
    height: 100%;
    border-right: 1px solid @border-color;
    width: 300px;
    .search-box {
      padding: 10px 16px;
    }
    .history-box {
      height: calc(100% - 53px);
      overflow-x: hidden;
      overflow-y: auto;
      .item {
        padding: 0 15px;
        border-bottom: 1px solid @border-color;
        &.active {
          background-color: #e1eefc;
        }
        .title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 32px;
          color: #24272b;
          font-size: @font-size-base;
        }
        .content {
          .remark,
          .label-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: @font-size-base;
            margin-bottom: 8px;
            height: 20px;
            .info {
              flex: 0 0 230px;
              width: 230px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              .tips {
                color: #aeb8c4;
              }
              color: #24272b;
            }
            .modify {
              width: 28px;
              flex: 0 0 28px;
              color: @color-primary;
              height: 26px;
              line-height: 26px;
              cursor: pointer;
            }
          }
          .label-box {
            height: auto;
            margin-bottom: 0;
            align-items: flex-start;
            .info {
              white-space: normal;
              max-height: 70px;
              overflow: hidden;
            }
            .label {
              display: inline-block;
              padding: 6px 7px;
              color: #87929f;
              background-color: #f7f9f9;
              margin-right: 10px;
              margin-bottom: 10px;
              border-radius: @border-radius-small;
            }
          }
        }
      }
    }
  }

  .record {
    flex: 1 0 300px;
    height: 100%;
    width: 300px;
    .title-box {
      display: flex;
      padding: 13px 16px;
      font-size: @font-size-base;
      justify-content: space-between;
      height: 40px;
      border-bottom: 1px solid @border-color;
      p {
        color: #24272b;
        span {
          color: #87929f;
        }
      }
    }
    .record-box {
      height: calc(100% - 40px);
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
</style>