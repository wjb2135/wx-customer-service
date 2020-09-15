<template>
  <!-- 会话备注和标签 -->
  <div class="session-remark">
    <el-tabs v-model="activeName">
      <el-tab-pane label="会话标签" name="tag">
        <div class="search-tag">
          <span class="view-actived-tag" @click="changeActivedTag">
            <template v-if="!viewActiveTypes">查看已标注标签({{activeTagsAge.length}})</template>
            <template v-else>查看全部标签</template>
          </span>
          <searchBar placeholder="搜索标签" @setKeyWord="setKeyWord"></searchBar>
        </div>
        <div class="group-tag">
          <div class="group-tag-inner" v-if="tagsArr.length>0">
            <div class="item-tag" v-for="item in tagsArr" :key="item.id">
              <label>{{item.name}}</label>
              <div class="tag-box">
                <div class="tag" v-for="tag in item.children" :key="tag.id">
                  <!-- 已标注 -->
                  <template v-if="viewActiveTypes">
                    <span
                      :class="{'active': activeTagsAge.includes(tag.id)}"
                      v-if="activeTagsAge.includes(tag.id)"
                      @click="selectTagAge(tag)"
                    >{{tag.name}}</span>
                  </template>
                  <!-- 全部 -->
                  <template v-else>
                    <span
                      :class="{'active': activeTagsAge.includes(tag.id)}"
                      @click="selectTagAge(tag)"
                    >{{tag.name}}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="btn-group">
          <el-button type="primary" size="mini" @click="submit">确定</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane label="会话备注" name="remark">
        <el-input
          type="textarea"
          placeholder="请输入会话备注"
          v-model="remark"
          maxlength="100"
          rows="8"
          show-word-limit
        ></el-input>
        <div class="btn-group">
          <el-button type="primary" size="mini" @click="setChatRemark">确定</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import searchBar from '@/components/searchBar';
export default {
  components: {
    searchBar
  },
  props: {
    userInfo: {
      type: [Object],
      defalut: {}
    },
    selectTags: {
      type: [Array],
      defalut: []
    }
  },
  data () {
    return {
      activeName: 'tag',
      searchKey: '',
      remark: '',
      viewActiveTypes: false,
      activeTagsAge: [], // 已选中的标签
      tagsArr: [],
      showTags: [],
      id: '',
      addTags: [] // 暂存标签
    };
  },
  created () {
    this.remark = this.userInfo.chat_remark;
    this.id = this.userInfo.id;
    this.getTags();
  },
  methods: {
    /**
     * 设置会话备注
     */
    setChatRemark () {
      this.$http
        .post('/user.set_chat_remark', {
          id: this.id,
          remark: this.remark
        })
        .then(res => {
          this.hide()
        });
    },
    hide () {
      this.activeName = 'tag'
      this.$emit('hide')
    },
    /**
     * 设置会话标签
     */
    submit () {
      let params = {
        id: this.id,
        tags: this.activeTagsAge.join(',')
      };
      this.$http
        .post('/user.set_chat_tags', params)
        .then(res => {
          this.$ipcSend('refreshUserInfo')
          this.hide()
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 获取标签列表
     */
    getTags () {
      this.$http
        .get('/tag.get')
        .then(res => {
          this.showTags = res.data;
          this.tagsArr = res.data;
          // 赋值
          res.data.map(item => {
            item.children.map(tag => {
              if (this.selectTags.includes(tag.id)) {
                this.addTags.push(tag);
              }
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 选中/取消标签
     */
    selectTagAge (val) {
      if (!this.activeTagsAge.includes(val.id)) {
        this.activeTagsAge.push(val.id);
        this.addTags.push(val);
      } else {
        this.activeTagsAge.splice(this.activeTagsAge.indexOf(val.id), 1);
        this.addTags = this.addTags.filter((item, index) => {
          if (item.id !== val.id) {
            return item;
          }
        });
      }
    },
    /**
     * 搜索
     */
    setKeyWord (val) {
      this.searchKey = val;
      if (val === '') {
        this.tagsArr = this.showTags;
        return;
      }
      // 过滤
      this.tagsArr = this.showTags.filter(item => {
        let flag = false;
        if (!(item.children instanceof Array)) {
          return false;
        }
        for (let i = 0; i < item.children.length; i++) {
          if (item.children[i].name.indexOf(val) >= 0) {
            flag = true;
          }
        }
        return flag;
      });
    },
    /**
     * 查看选中的标签
     */
    changeActivedTag () {
      this.viewActiveTypes = !this.viewActiveTypes;
    }
  },
  watch: {
    userInfo () {
      this.remark = this.userInfo.chat_remark;
      this.id = this.userInfo.id;
      // 已选
      this.activeTagsAge = [...this.selectTags];
      this.activeName = 'tag'
    }
  }
};
</script>

<style lang="less" scoped>
.session-remark {
  .btn-group {
    padding-top: 10px;
    float: right;
  }
  .search-tag {
    background-color: #fff;
    height: 33px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .search-input {
      width: 200px;
    }
    .view-actived-tag {
      text-decoration: underline;
      color: @color-primary;
      cursor: pointer;
    }
  }
  .header {
    background-color: #fff;
    height: 53px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 16px;
    border-bottom: 1px solid @border-color;
    .search-input {
      width: 230px;
    }
    .view-actived-tag {
      font-size: @font-size-base;
      color: #24272b;
      cursor: pointer;
    }
  }
  .group-tag {
  }
  .group-tag-inner {
    height: 147px;
    overflow: hidden;
    overflow-y: auto;
  }
  .item-tag {
    font-size: @font-size-small;
    margin-bottom: 13px;
    &:last-child {
      margin-bottom: 0;
    }
    .tag-box {
      display: flex;
      flex-wrap: wrap;
    }
    &:first-child {
      margin-top: 0;
    }
    label {
      font-size: @font-size-base;
      color: #24272b;
      display: block;
      line-height: 30px;
      height: 30px;
    }
    .tag {
      span {
        background-color: #f7f9f9;
        display: flex;
        padding: 0 7px;
        align-items: center;
        line-height: 25px;
        height: 25px;
        margin: 8px 10px 8px 0;
        color: #87929f;
        cursor: pointer;
        &.active {
          background-color: @color-primary;
          color: #fff;
        }
      }
    }
  }
}
</style>

