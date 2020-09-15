<template>
  <!-- 设置访客标签 -->
  <div class="dialog-search-tag">
    <Dialog title="设置访客标签">
      <div class="header">
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
      <div slot="footer" class="dialog-footer__choosekf">
        <el-button size="small" @click="cancel">取 消</el-button>
        <el-button size="small" type="primary" @click="submit">确 定</el-button>
      </div>
    </Dialog>
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
      viewActiveTypes: false,
      activeTagsAge: [], // 已选中的标签
      searchKey: '',
      tagsArr: [],
      showTags: [],
      id: '',
      ids: '',
      addTags: [] // 暂存标签
    };
  },
  created () {
    this.getTags();
    this.id = this.$route.query.id || '';
    if (this.id) {
      this.selectTags = JSON.parse(this.$route.query.selectTags);
      // 已选
      this.activeTagsAge = [...this.selectTags];
    } else {
      this.ids = this.$route.query.ids || '';
    }
  },
  methods: {
    /**
     * 关闭弹窗
     */
    cancel () {
      this.$Win.closeWin();
    },
    /**
     * 设置标签
     */
    submit () {
      let reg = /[A-Za-z]/
      let numberArr = []
      // 过滤字母
      this.activeTagsAge.forEach((item) => {
        let flag = !reg.test(item)
        if (flag) {
          numberArr.push(item)
        }
      })
      if (this.ids) {
        this.multipleSetTags(numberArr);
      } else {
        this.setTags(numberArr);
      }
    },
    setTags (arr) {
      let params = {
        id: this.id,
        tags: arr.join(',')
      };
      this.$http
        .post('/user.set_tags', params)
        .then(res => {
          this.$ipcSend('refreshUserInfo');
          this.$Win.closeWin();
        })
        .catch(err => {
          console.log(err);
        });
    },
    multipleSetTags (arr) {
      let params = {
        ids: this.ids,
        tags: arr.join(',')
      };
      this.$http
        .post('/user.multiple_set_tags', params)
        .then(res => {
          this.$ipcSend('refreshUserInfo');
          this.$Win.closeWin();
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
  }
};
</script>
<style lang="less">
.dialog-search-tag {
  height: 100%;
  .dialog__wrapper {
    height: 100%;
    .dialog {
      height: 100%;
      .dialog__body {
        padding: 0;
        height: calc(100% - 93px);
      }
    }
  }
}
</style>


<style lang="less" scoped>
.dialog-search-tag {
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
}
.group-tag {
  height: calc(100% - 53px);
}
.group-tag-inner {
  padding: 22px 30px;
  height: 100%;
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
    max-width: 100%;
    span {
      background-color: #f7f9f9;
      display: inline-block;
      padding: 0 7px;
      align-items: center;
      line-height: 25px;
      height: 25px;
      margin: 8px 10px 0 0;
      color: #87929f;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      &.active {
        background-color: @color-primary;
        color: #fff;
      }
    }
  }
}
</style>
