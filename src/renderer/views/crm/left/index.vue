<template>
  <div class="page-crm-filter">
    <!-- 搜索 -->
    <div class="seach-box block">
      <search-bar placeholder="搜索名称,手机号,微信号" @keydownEnter="keydownEnter"></search-bar>
    </div>
    <div class="filter-box">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
        <!-- 自定义、收藏标签筛选 -->
        <div class="block">
          <el-select
            v-model="favoriteValue"
            @visible-change="visibleChange"
            size="mini"
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in favoriteArr"
              :key="item.value"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </div>
        <!-- 时间筛选 -->
        <div class="block">
          <div class="title clean-title">
            <span>时间筛选</span>
            <span class="clean" @click="clean" :class="cleanStatus?'':'disable'">
              <i class="iconfont">&#xe6b4;</i>
              清空
            </span>
          </div>
          <div class="row-time">
            <div class="col-type">
              <el-select v-model="dateType" size="mini" filterable placeholder="请选择">
                <el-option
                  v-for="item in dateTypeArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>
        <!-- 开始 结束 -->
        <div class="block">
          <div class="dateTimeBlock">
            <div class="title">开始</div>
            <el-date-picker
              v-model="startDateTime"
              size="mini"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
            ></el-date-picker>
          </div>
          <div class="dateTimeBlock">
            <div class="title">结束</div>
            <el-date-picker
              value-format="yyyy-MM-dd HH:mm:ss"
              v-model="endDateTime"
              size="mini"
              type="datetime"
              placeholder="选择日期时间"
            ></el-date-picker>
          </div>
        </div>
        <!-- 访客来源 -->
        <div class="block">
          <div class="title">访客来源</div>
          <el-select v-model="source" size="mini" filterable placeholder="请选择">
            <el-option
              v-for="(item,index) in list.source_array.list"
              :key="item.source+'_'+index"
              :label="item.content"
              :value="item.source"
            ></el-option>
          </el-select>
        </div>
        <!-- 公众号 -->
        <div class="block">
          <div class="title">公众号</div>
          <el-select v-model="official" size="mini" filterable placeholder="请选择">
            <el-option
              v-for="item in list.weixin_type_array.list"
              :key="item.wx_appid"
              :label="item.content"
              :value="item.wx_appid"
            ></el-option>
          </el-select>
        </div>
        <!-- 联系方式 -->
        <div class="block contactVisit">
          <div class="contact">
            <div class="title">联系方式</div>
            <el-radio-group v-model="contac" size="mini">
              <el-radio-button
                v-for="item in list.contact_array.list"
                :key="item.contac"
                :label="item.contac"
                :value="item.contac"
              >{{item.content}}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="block contactVisit">
          <div class="visit">
            <div class="title">首次来访</div>
            <el-radio-group v-model="times" size="mini">
              <el-radio-button
                v-for="item in list.times_array.list"
                :key="item.times"
                :label="item.times"
                :value="item.times"
              >{{item.content}}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- 访客标签 -->
        <div class="block">
          <div class="title">访客标签</div>
          <el-select v-model="tag" size="mini" filterable placeholder="请选择">
            <el-option
              v-for="item in list.tag_array.list"
              :key="item.tag"
              :label="item.content"
              :value="item.tag"
            ></el-option>
          </el-select>
        </div>
        <div class="more-filtrate" v-show="moreStatus">
          <!--  访客类型 -->
          <div class="block">
            <div class="title">访客类型</div>
            <el-select v-model="visitorType" size="mini" filterable placeholder="请选择">
              <el-option
                v-for="item in list.time_type_array.list"
                :key="item.sh_type"
                :label="item.content"
                :value="item.sh_type"
              ></el-option>
            </el-select>
          </div>
          <!--  性别  -->
          <div class="block contactVisit">
            <div class="contact">
              <div class="title">性别</div>
              <el-radio-group v-model="sex" size="mini">
                <el-radio-button
                  v-for="item in list.sex_array.list"
                  :key="item.sex"
                  :label="item.sex"
                  :value="item.sex"
                >{{item.content}}</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <!--  年龄  -->
          <div class="block">
            <div class="title">年龄</div>
            <el-select v-model="age" size="mini" filterable placeholder="请选择">
              <el-option
                v-for="item in list.age_array.list"
                :key="item.age"
                :label="item.content"
                :value="item.age"
              ></el-option>
            </el-select>
          </div>
          <!--  访客状态  -->
          <div class="block">
            <div class="title">访客状态</div>
            <el-select v-model="status" size="mini" filterable placeholder="请选择">
              <el-option
                v-for="item in list.status_array.list"
                :key="item.status"
                :label="item.content"
                :value="item.status"
              ></el-option>
            </el-select>
          </div>
          <!--  所属客服  -->
          <div class="block">
            <div class="title">所属客服</div>
            <el-select v-model="service" size="mini" filterable placeholder="请选择">
              <el-option
                v-for="item in list.custom_service_array.list"
                :key="item.custom_service_id"
                :label="item.content"
                :value="item.custom_service_id"
              ></el-option>
            </el-select>
          </div>
          <!--  访客位置  -->
          <div class="block">
            <div class="title">访客位置</div>
            <el-input size="mini" v-model="position"></el-input>
          </div>
        </div>
        <!-- 展开所以筛选 -->
        <div class="block filtrate" :class="moreStatus?'close': ''">
          <p @click="changeMoreStatus">
            <span v-show="!moreStatus">展开所有筛选</span> 
            <span v-show="moreStatus">收起所有筛选</span> 
          </p>
          <i class="iconfont">&#xe68f;</i>
        </div>
      </el-scrollbar>
    </div>
    <div class="footer-btns">
      <el-button type="success" size="mini" @click="changeCollect">{{collectText}}</el-button>
      <el-button type="primary" size="mini" @click="search">搜索</el-button>
    </div>
  </div>
</template>

<script>
import searchBar from '@/components/searchBar';
export default {
  components: {
    searchBar
  },
  data () {
    return {
      collectText: '收藏',
      selectFlag: true,
      list: {
        age_array: {
          list: []
        },
        contact_array: {
          list: []
        },
        custom_service_array: {
          list: []
        },
        sex_array: {
          list: []
        },
        source_array: {
          list: []
        },
        status_array: {
          list: []
        },
        tag_array: {
          list: []
        },
        time_type_array: {
          list: []
        },
        times_array: {
          list: []
        },
        weixin_type_array: {
          list: []
        }
      },
      // 查询类型
      dateType: '',
      dateTypeArr: [
        {
          value: 1,
          label: '最近来访'
        },
        {
          value: 2,
          label: '最后说话'
        },
        {
          value: 3,
          label: '首次关注'
        }
      ],
      favoriteValue: {
        value: '自定义',
        label: '自定义',
        select_type: 0
      },
      favoriteArr: [
        {
          value: '自定义',
          label: '自定义',
          select_type: 0
        }
      ],
      moreStatus: false,
      // 访客位置
      position: '',
      // 访客类型
      visitorType: '',
      // 公众号
      official: '',
      // 访客性别
      sex: '',
      // 年龄
      age: '',
      // 访客来源
      source: '',
      // 联系方式
      contac: '',
      // 来访次数
      times: '',
      // 访客标签
      tag: '',
      // 所属客服
      service: '',
      // 访客状态
      status: '',
      // 开始时间与结束时间
      startDateTime: '',
      endDateTime: '',
      name: '',
      memo: '',
      cleanStatus: true,
      searchName: ''
    };
  },
  mounted () {
    this.getSearchList();
    this.$ipcOn('collectData', (event, val) => {
      this.name = val.name;
      this.memo = val.memo;
      this.saveSearch();
    });
  },
  destroyed () {
    this.$ipcRemove('collectData');
  },
  methods: {
    keydownEnter (val) {
      let params = {
        search_name: val
      }
      if (val !== this.searchName) {
        this.$emit('selectList', params);
      }
      this.searchName = val;
    },
    clean () {
      if (this.cleanStatus) {
        this.dateType = '';
        this.startDateTime = '';
        this.endDateTime = '';
        this.visitorType = '';
        this.official = '';
        this.source = '';
        this.sex = '';
        this.age = '';
        this.contac = '';
        this.times = '';
        this.tag = '';
        this.service = '';
        this.status = '';
        this.position = '';
      }
    },
    visibleChange (flag) {
      if (flag) {
        return;
      }
      if (this.favoriteValue.select_type === 0) {
        this.selectFlag = true;
        this.collectText = '收藏';
      } else {
        this.selectFlag = false;
        this.collectText = '删除收藏';
      }
    },
    /**
     * 收藏按钮
     */
    changeCollect () {
      // 收藏
      if (this.selectFlag) {
        this.newWindows('/crm/collect', { width: 400, height: 260 });
      } else {
        // 删除收藏
        this.deleteSearch();
      }
    },
    /**
     * 删除收藏
     */
    deleteSearch () {
      this.$http
        .post('/user.delete_search', {
          id: this.favoriteValue.id
        })
        .then(res => {
          this.$message.success('删除成功');
          this.favoriteArr.map((item, index) => {
            if (item.id === this.favoriteValue.id) {
              return this.favoriteArr.splice(index, 1);
            }
          });
          this.favoriteValue = this.favoriteArr[0];
          this.selectFlag = true;
          this.collectText = '收藏';
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 保存按钮
     */
    saveSearch () {
      let params = {
        name: this.name,
        memo: this.memo,
        issystem: 0,
        time_type: this.dateType,
        begin_time: this.startDateTime,
        end_time: this.endDateTime,
        sh_type: this.visitorType,
        wx_appid: this.official,
        sex: this.sex,
        age: this.age,
        source: this.source,
        contac: this.contac,
        times: this.times,
        tag: this.tag,
        custom_service: this.service,
        status: this.status,
        position: this.position
      };
      this.$http
        .post('/user.save_search', params)
        .then(res => {
          this.favoriteValue = {
            ...res.data,
            description_info: JSON.parse(res.data.description),
            label: res.data.name,
            value: res.data.id,
            select_type: 1
          };
          this.getSearchList();
          this.selectFlag = false;
          this.collectText = '删除收藏';
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 搜索
     */
    search () {
      let params = {
        time_type: this.dateType,
        begin_time: this.startDateTime,
        end_time: this.endDateTime,
        sh_type: this.visitorType,
        wx_appid: this.official,
        sex: this.sex || -1,
        age: this.age,
        source: this.source,
        contac: this.contac,
        times: this.times,
        tag: this.tag,
        custom_service: this.service,
        status: this.status,
        position: this.position
      };
      // 访客管理
      if ('id' in this.favoriteValue) {
        this.$emit('selectList', { id: this.favoriteValue.id });
      } else {
        this.$emit('selectList', params);
      }
    },
    /**
     * 展示所有筛选
     */
    changeMoreStatus () {
      this.moreStatus = !this.moreStatus;
    },
    setKeyWord () {},
    /**
     * 获取数据
     */
    getSearchList () {
      this.$http
        .get('/user.search_list')
        .then(res => {
          this.list = res.data;
          this.favoriteArr = [
            {
              value: '自定义',
              label: '自定义',
              select_type: 0
            }
          ];
          res.data.search_list.forEach(item => {
            this.favoriteArr.push({
              ...item,
              label: item.name,
              value: item.id,
              select_type: 1
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  watch: {
    favoriteValue () {
      let value = this.favoriteValue;
      let obj = value.description_info || {};
      this.name = value.name || '';
      this.dateType = parseInt(obj.time_type) || '';
      this.startDateTime = obj.begin_time || '';
      this.endDateTime = obj.end_time || '';
      this.visitorType = obj.sh_type || '';
      this.official = obj.wx_appid || '';
      this.source = obj.source || '';
      this.sex = obj.sex || '';
      this.age = obj.age || '';
      this.contac = obj.contac || '';
      this.times = obj.times || '';
      this.tag = parseInt(obj.tag) || '';
      this.service = parseInt(obj.custom_service) || '';
      this.status = obj.status || '';
      this.position = obj.position || '';
      this.cleanStatus = this.favoriteValue.select_type === 0;
    }
  }
};
</script>

<style lang="less" scoped>
.page-crm-filter {
  height: 100%;
  .seach-box {
    padding-top: 10px;
  }
  .filter-box {
    height: calc(100% - 108px);
  }
  .footer-btns {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 50px;
  }
  .clean-title{
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .clean {
    cursor: pointer;
    &.disable{
      cursor: default;
    }
    i {
      font-size: @font-size-small;
    }
  }
  .block.filtrate {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0;
    p {
      cursor: pointer;
      font-size: @font-size-base;
      color: @color-primary;
      display: flex;
      align-items: center;
    }
    i {
      font-size: 10px;
      color: @color-primary;
      margin-left: 10px;
    }
    &.close {
      i {
        transform: rotateX(180deg);
      }
    }
  }
  .block {
    margin-bottom: 15px;
    padding-right: 10px;
    padding-left: 10px;
    .el-select {
      width: 100%;
    }
    .title {
      line-height: 1;
      font-size: 14px;
      color: #87929f;
      margin-bottom: 10px;
    }
    .row-time {
      display: flex;
      .col-type {
        flex: 1 0 auto;
      }
    }
    .dateTimeBlock {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      & ~ .dateTimeBlock {
        margin-bottom: 0;
      }
      .title {
        line-height: 1;
        font-size: 14px;
        color: rgb(135, 146, 159);
        width: 28px;
        margin-right: 15px;
        margin-bottom: 0;
        white-space: nowrap;
      }
    }
  }
  .contactVisit {
    display: flex;
    flex-wrap: wrap;
    .contact {
      flex: 1 0 110px;
      margin-right: 10px;
      white-space: nowrap;
    }
    .visit {
      white-space: nowrap;
      flex: 1 0 110px;
    }
  }
}
</style>