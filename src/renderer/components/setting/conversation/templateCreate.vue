<template>
  <div class="container">
    <div class="left-list">
      <!-- <el-input class="input">
        <i
          class="el-icon-search el-input__icon"
          slot="suffix"
          @click="handleIconClick">
        </i>
      </el-input> -->
      <el-autocomplete 
        class="search"
        size="small"
        popper-class="my-autocomplete"
        v-model="state"
        :fetch-suggestions="querySearch"
        placeholder="请输入内容"
        @select="handleSelect">
        <i
          class="el-icon-search el-input__icon"
          slot="suffix"
          @click="handleIconClick">
        </i>
        <template slot-scope="{ item }">
          <div class="title">{{ item.title }}</div>
        </template>
      </el-autocomplete>
      <p 
        :class="activeClass === index ? 'active' : ''"
        v-for="(item, index) in list" 
        :key="index"
        @click="listClick(index)">{{item.title}}</p>
    </div>
    <div class="rg-list">
      <div class="form">
        <div>
          <div class="title">模板ID:</div>
          <div>{{ currentList.wx_template_id }}</div>
        </div>
        <div>
          <div class="title">标题:</div>
          <div>{{ currentList.title }}</div>
        </div>
        <div>
          <div class="title">行业:</div>
          <div v-if="currentList.primary_industry">{{ currentList.primary_industry }} -> {{ currentList.deputy_industry }}</div>
        </div>
        <div>
          <div class="title">链接地址:</div>
          <div class="input-wrap"><input type="text" placeholder="请输入链接地址" v-model="currentList.detail_url"></div>
        </div>
      </div>
      <div class="form detail-wrap" v-loading="loading">
        <div v-for="(key, value) in currentList.weixin_template.content" :key="value">
          <div class="title">{{key}}</div>
          <div class="input-wrap">
            <input type="text" :id="value" @input="input($event, value)">
            <!-- <input type="text" v-model="currentList.content[value].value"> -->
          </div>
          <div class="color-picker" @click="getColorDom(value)">
            <el-color-picker @change="change"></el-color-picker>
             <!-- @input="input(event, value, 'color')" -->
            <!-- <el-color-picker v-model="currentList.content[value].color"></el-color-picker> -->
          </div>
        </div>
      </div>
      <div class="bottm-btn">
        <el-button type="primary" size="mini" @click="btnOk">确定</el-button>
        <el-button type="primary" size="mini" @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { setTimeout } from 'timers';

export default {
  data () {
    return {
      activeClass: 0,
      list: [],
      searchList: [],
      state: '',
      appid: '',
      colorDom: '',
      // currentList: {
      //   weixin_template: {
      //     content: {}
      //   },
      //   content: {}
      // },
      contentValue: {
        value: '',
        color: '#24272b'
      },
      content: {},
      contentA: {},
      link: '',
      loading: true,
      currentList: {
        content: {
          first: {value: '', color: '#24272b'}
        },
        weixin_template: {
          content: {
            first: ''
          }
        }
      }
    }
  },
  created () {
    this.appid = this.baseUserInfo.weixin_account[0].appid
    this.getTemplate()
  },
  mounted () {
  },
  computed: {
    baseUserInfo () {
      return this.$store.state.user.baseUserInfo
    }
  },
  methods: {
    /**
     * 获取数据
     */
    getTemplate () {
      this.$http.post('/res.template_wx', {
        appid: this.appid
      }).then(res => {
        let data = res.data.data
        this.list = data
        this.searchList = this.loadAll(data)
        this.list.forEach((item, index) => {
          item.template_id = item.id
          item.weixin_template = {
            content: item.content
          }
          let i = 0
          let obj = {}
          for (i in item.weixin_template.content) {
            obj[i] = this.contentValue
          }
          item.content = obj
        })
        this.currentList = this.list[0]
        this.loading = false
      })
    },
    /**
     * 获取 color 的dom
     */
    getColorDom (dom) {
      this.colorDom = dom
    },
    /**
     * color 赋值
     */
    change (e) {
      this.currentList.content[this.colorDom].color = e
    },
    /**
     * input 赋值
     */
    input (event, value) {
      console.log(value, this.currentList.content[value])
      this.currentList.content[value].value = event.currentTarget.value
      console.log('this.currentList', this.currentList.content)
    },
    /**
     * 切换nav
     */
    listClick (i) {
      this.currentList = this.list[i]
      this.activeClass = i
      let ii = 0
      for (ii in this.currentList.content) {
        if (document.getElementById(ii)) {
          document.getElementById(ii).value = ''
        }
        this.currentList.content[ii].color = '#24272b'
      }
      this.loading = true
      this.loading = false
    },
    /**
     * 跳转会话设置、预约邀请
     */
    btnOk () {
      // console.log(this.currentList)
      this.$emit('wxtemplate', this.currentList)
    },
    cancel () {
      this.$Win.closeWin()
    },
    /**
     * 搜索
     */
    querySearch (queryString, cb) {
      var searchList = this.searchList;
      var results = queryString ? searchList.filter(this.createFilter(queryString)) : searchList
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    /**
     * 搜索
     */
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      };
    },
    /**
     * 搜索的数据
     */
    loadAll (data) {
      let arr = data.map((item, index) => {
        return {title: item.title, index: index}
      })
      return arr
    },
    /**
     * 搜索
     */
    handleSelect (item) {
      this.currentList = this.list[item.index]
      this.activeClass = item.index
    },
    handleIconClick (ev) {
      console.log(ev)
    }
  }
}
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    .my-autocomplete {
      li {
        line-height: normal;
        padding: 7px;

        .name {
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .addr {
          font-size: 12px;
          color: #b4b4b4;
        }

        .highlighted .addr {
          color: #ddd;
        }
      }
    }
    .rg-list {
      padding-top: 8px;
      flex: 1;
      position: relative;
      .form {
        padding: 20px 28px 10px;
        &.detail-wrap {
          height: 278px;
          overflow-y: scroll;
        }
        > div {
          display: flex;
          align-items: center;
          .title {
            width: 90px;
          }
          .input-wrap {
            flex: 1;
            input {
              border-radius: 4px;
              border: none;
              background: #f7f9f9;
              display: block;
              width: 100%;
              padding: 10px;
            }
          }
          .color-picker {
            margin-left: 10px;
          }
        }
        &:first-of-type {
          border-bottom: 1px solid @border-color;
          > div {
            margin-bottom: 10px;
          }
        }
      }
      .bottm-btn {
        position: absolute;
        background: #fff;
        right: 0;
        bottom: 12px;
        width: 100%;
        text-align: right;
        padding-right: 16px;
        padding-top: 12px;
        border-top: 1px solid @border-color;
      }
    }
  }
</style>