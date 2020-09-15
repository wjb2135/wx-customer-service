<template>
  <div class="page-visitor-label">
    <div class="visitor-select">
      <el-select
        v-model="labelSelect"
        filterable
        @visible-change="select"
        placeholder="标签搜索"
        ref="labelSelect"
      >
        <el-option-group
          v-for="group in options"
          :key="group.label"
          :label="group.options == undefined? '':group.label"
        >
          <template v-if="group.options == undefined">
            <el-option :key="group.value" :label="group.label" :value="group.value"></el-option>
          </template>
          <template v-else>
            <el-option
              v-for="item in group.options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </template>
        </el-option-group>
      </el-select>
    </div>
    <div class="label-tree">
      <el-scrollbar :native="false" style="height:100%" class="m-scroll">
        <el-tree
          :data="labelTree"
          :props="defaultProps"
          icon-class="el-icon-arrow-right"
          :indent="22"
          highlight-current
          class="visitor-label"
          node-key="labelTree"
          @node-click="handleNodeClick"
          ref="mytree"
          current-node-key="3"
        ></el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      labelTree: [
        {
          id: '',
          label: '全部访客',
          issystem: 0,
          children: []
        },
        {
          id: '-2',
          label: '无标签',
          issystem: 0,
          children: []
        },
        {
          id: '-1',
          label: '全部标签',
          issystem: 0,
          children: []
        }
      ],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      labelSelect: '',
      options: [
        {
          value: '自定义',
          label: '自定义'
        },
        {
          label: '我的收藏',
          options: []
        }
      ],
      params: {
        id: 0
      },
      nowId: ''
    };
  },
  created () {
    this.getTags();
    this.getSearchList();
    this.$ipcOn('refreshVisitorList', (event, val) => {
      if (val.id) {
        this.labelSelect = val.id;
      } else {
        this.labelSelect = '自定义';
      }
      this.$emit('search', val);
    });
    this.$ipcOn('refreshSearchList', (event, val) => {
      this.getSearchList();
    });
  },
  methods: {
    /**
     * 获取我的收藏标签列表
     */
    getSearchList () {
      this.options[1].options = [];
      this.$http
        .get('/user.search_list')
        .then(res => {
          res.data.search_list.forEach(item => {
            this.options[1].options.push({
              value: item.id,
              label: item.name
            });
          });
        })
        .catch(() => {
        });
    },
    /**
     * 获取标签列表
     */
    getTags () {
      this.$http
        .get('/tag.get')
        .then(res => {
          this.labelTree.push(...res.data);
          this.$nextTick(() => {
            this.$refs.mytree.setCurrentKey('全部访客')
          })
        })
        .catch(() => {
        });
    },
    /**
     * 树形列表的点击
     */
    handleNodeClick (data) {
      let obj = {
        tag: data.id,
        sex: -1
      };
      if (this.nowId !== data.id) {
        this.$emit('search', obj);
      }
      this.nowId = data.id
    },
    /**
     * 标签的选中
     */
    select (flag) {
      if (flag) { return }
      if (this.labelSelect === '自定义') {
        this.$refs.labelSelect.blur();
        this.setWindow();
      } else {
        let obj = {
          id: this.labelSelect
        };
        this.$emit('search', obj);
      }
    },
    /**
     * 自定义弹窗
     */
    setWindow () {
      this.newWindows('/dialog/filter', { width: 780, height: 480 });
    }
  }
};
</script>
<style lang="less">
.el-tree.visitor-label {
  color: @color-text-primary;
  .el-tree-node {
    // 经过的颜色
    &:focus > .el-tree-node__content {
      background-color: @color-table-hover !important;
    }
    // 选中的颜色
    &.is-current > .el-tree-node__content {
      background-color: @color-table-active !important;
    }
  }
  & > .el-tree-node {
    // 父级
    & > .el-tree-node__content {
      line-height: 36px;
      height: 36px;
      .el-tree-node__label {
        color: @color-text-primary;
        font-size: @font-size-bigger;
      }
      .el-tree-node__expand-icon {
        color: #87929f;
        font-size: @font-size-bigger;
        margin-left: 5px;
      }
    }

    // 子级
    .el-tree-node__children {
      .el-tree-node__content {
        line-height: 30px;
        height: 30px;
      }
      .el-tree-node__expand-icon {
        color: transparent;
      }
    }
  }
  // 无内容
  & > .el-tree-node > .el-tree-node__content {
    .is-leaf {
      color: transparent;
      display: none;
    }
    .el-tree-node__label {
      padding-left: 5px;
    }
    .is-leaf + .el-tree-node__label {
      padding-left: 15px;
    }
  }
}
</style>

<style lang="less" scoped>
.page-visitor-label {
  .visitor-select {
    padding: 10px;
    .el-select {
      width: 100%;
    }
  }
  .label-tree {
    height: calc(100vh - 110px);
    ul {
      li {
        cursor: pointer;
        padding-left: 10px;
        line-height: 36px;
        font-size: @font-size-bigger;
        &:hover {
          background-color: @color-table-hover;
        }
        &.active {
          background-color: @color-table-active;
        }
      }
    }
  }
}
</style>