<template>
  <div class="visitor-setting-wrap">
    <!-- 头部 -->
    <div class="header">
      <div>
        <el-button type="primary" size="mini" @click="addTag(1)">添加标签分组</el-button>
      </div>
      <div class="btn-wrap">
        <el-button type="primary" size="mini" @click="goPage">下载标签模板</el-button>
        <!-- <el-button type="primary" size="mini" @click="importFile">导入</el-button> -->
        <el-upload
          class="upload-wrap"
          action="http://crmapi.wwj.fanwe.com/tag.import_csv"
          :data="uploadData"
          :on-success="importFile"
          :on-error="importFileError"
          :before-upload="beforeAvatarUpload"
          :file-list="fileList"
          :show-file-list="false">
          <el-button size="small" type="primary">导入</el-button>
        </el-upload>
        <el-button type="primary" size="mini" @click="exportFile">导出</el-button>
      </div>
    </div>
    <!-- 中间 -->
    <div class="content">
      <!-- 左侧 -->
      <div class="left-wrap">
        <el-tree
          ref="treeBox"
          class="tree-list"
          :data="tagList"
          node-key="id"
          :default-expanded-keys="[1]"
          highlight-current
          v-loading="treeLoading"
          @node-click="handleClick">
        </el-tree>
        <div class="drag-btn-wrap">
          <el-button type="primary" size="mini" :disabled="prevDisabled || id === ''" @click="moveClick('prev')">向上移动</el-button>
          <el-button type="info" size="mini" :disabled="nextDisabled || id === ''" @click="moveClick('next')">向下移动</el-button>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="right-wrap">
        <div class="header">
          <div class="title">编辑分组信息</div>
          <div>
            <el-button size="mini" @click="addTag(0)" :disabled="type === 'children'">添加组内标签</el-button>
            <el-button size="mini" @click="remove" :disabled="id === ''">
              <span v-if="type === 'parent'">删除分组</span>
              <span v-else>删除标签</span>
            </el-button>
          </div>
        </div>
        <!-- 表单 -->
        <div class="form">
          <input type="text" :placeholder="placeholder" v-model="tags.name">
          <textarea placeholder="备注" v-model="tags.memo"></textarea>
          <!-- 确定 请求 -->
          <div class="tx-rg"><el-button type="primary" size="mini" @click="tagPost" :disabled="id === ''">确定</el-button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'

export default {
  data () {
    return {
      placeholder: '输入分组名称',
      fileList: [],
      id: 0,
      selectList: {},
      addStatus: false,
      prevDisabled: true,
      nextDisabled: false,
      type: 'parent',
      tags: {
        id: '',
        name: '',
        memo: '',
        pid: '',
        issystem: ''
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      selected: false,
      fileName: '',
      tagList: [],
      uploadData: {
        _token: ''
      },
      treeLoading: true
    }
  },
  computed: {
    downloadUrl () {
      return this.$store.state.app.sysConfig.download_url
    },
    token () {
      console.log(this.$store.state.user._TOKEN)
      return this.$store.state.user._TOKEN
    }
  },
  created () {
    this.getList()
    this.uploadData._token = this.token
    console.log(this.uploadData._token)
  },
  methods: {
    /**
     *  获取数据
     */
    getList () {
      this.$http.post('/tag.get').then(res => {
        this.tagList = res.data
        this.treeLoading = false
        this.$nextTick(() => { // 取第一条高亮
          if (!this.selected) {
            this.selected = true
            this.tags.id = this.tagList[0].id
            this.tags.name = this.tagList[0].name
            this.tags.memo = this.tagList[0].memo
            this.tags.pid = this.tagList[0].pid
            this.tags.issystem = this.tagList[0].issystem
            this.id = this.tagList[0].id
            this.$refs.treeBox.setCurrentKey(this.id)
            this.selectList = this.$refs.treeBox.getCurrentNode()
            console.log(this.selectList)
          } else {
            this.$refs.treeBox.setCurrentKey(this.id)
          }
        })
      })
    },
    /**
     *  添加标签
     */
    addTag (addstatus) {
      this.addStatus = true
      this.tags.name = ''
      this.tags.memo = ''
      if (addstatus) { // 添加标签分组
        this.placeholder = '输入分组名称'
        console.log('添加标签分组')
        let arr = Object.keys(this.tags)
        arr.forEach((item, index) => {
          if (item === 'id') { // 删除ID
            delete this.tags.id
          }
        })
        this.tags.pid = 0
        this.tags.issystem = 1
      } else { // 添加组内标签
        console.log('添加组内标签')
        this.placeholder = '输入标签名称'
        this.tags.pid = this.id
        this.tags.issystem = 0
      }
    },
    /**
     *  删除 标签/分组
     */
    remove () {
      let children = {}
      let index = 0
      if (this.selectList.parent) {
        const parent = this.selectList.parent
        children = parent.data.children || parent.data
        index = children.findIndex(d => d.id === this.id)
      } else {
        children = this.tagList
      }
      if (!this.id) {
        return;
      }
      this.$http.post('/tag.delete', {
        id: this.id
      }).then(res => {
        // this.selected = true
        children.splice(index, 1)
        this.tags.name = ''
        this.tags.memo = ''
        this.id = ''
      })
    },
    /**
     * 确定按钮 添加/编辑 标签 数据请求
     */
    tagPost () {
      if (this.addStatus) { // 新增标签
        console.log('新增标签')
        this.$http.post('/tag.add', this.tags).then(res => {
          res.data.children = []
          this.tagList.unshift(res.data)
          this.tags.name = ''
          this.tags.memo = ''
          this.btnStatus = false
          this.$message({
            showClose: true,
            message: '添加成功',
            type: 'success'
          })
          this.getList()
        })
      } else { // 编辑标签
        console.log('编辑标签')
        this.$http.post('/tag.update', this.tags).then(res => {
          this.$message({
            showClose: true,
            message: '修改成功',
            type: 'success'
          })
          this.getList()
        })
      }
    },
    /**
     * 向上/向下移动 按钮点击
     */
    moveClick (type) {
      // ids 为所有顶级  id    逗号隔开
      // 下级  就   同一级的  ids  pid要传
      let pid = 0
      console.log('this.tagList: ', this.tagList)
      let option, sortIndex, prevOption, nextOption
      let list = []
      let ids = ''
      console.log(this.id)
      if (this.type === 'parent') {
        console.log('父级')
        this.tagList.forEach((item, index) => {
          if (item.id === this.id) {
            sortIndex = index
            option = this.tagList[index]
          }
          list.push(item.id)
        })
      } else {
        console.log('子级')
        this.tagList.forEach((item, index) => {
          item.children.forEach((item1, index1) => {
            if (item1.id === this.id) {
              pid = item.id
              sortIndex = index1
              option = item.children
              item.children.map(item2 => {
                list.push(item2.id)
              })
            }
          })
        })
      }
      if (type === 'prev') {
        option = list[sortIndex - 1]
        this.$set(list, sortIndex - 1, list[sortIndex])
        this.$set(list, sortIndex, option)
        ids += Object.values(list)
        console.log(sortIndex)
        this.nextDisabled = false
        if (sortIndex === 1) {
          this.prevDisabled = true
        } else {
          this.prevDisabled = false
        }
      } else {
        option = list[sortIndex + 1]
        this.$set(list, sortIndex + 1, list[sortIndex])
        this.$set(list, sortIndex, option)
        ids += Object.values(list)
        console.log(sortIndex, list.length)
        this.prevDisabled = false
        if (sortIndex === list.length - 2) {
          this.nextDisabled = true
        } else {
          this.nextDisabled = false
        }
      }
      this.postSort(ids, pid)
    },
    postSort (ids, pid) {
      let id = ids.split(',')
      id = id.reverse().join(',')
      this.$http.post('/tag.setsort', {
        ids: id,
        pid: pid
      }).then(res => {
        this.tagList = res.data
      }).catch(err => {
        this.$message.err(err.message)
      })
    },
    /**
     * 跳转外部浏览器
     */
    goPage () {
      shell.openExternal(this.downloadUrl)
    },
    /**
     * 点击树形列表，存数据
     */
    handleClick (node, ev) {
      this.id = node.id
      this.selectList = ev
      this.addStatus = false
      console.log('handleClick', node, ev)
      this.tags.id = node.id
      this.tags.name = node.name
      this.tags.memo = node.memo
      this.tags.pid = node.pid
      this.tags.issystem = node.issystem
      // console.log('上一个', ev.previousSibling)
      // console.log('下一个', ev.nextSibling)
      if (ev.previousSibling) {
        this.prevDisabled = false
      } else {
        this.prevDisabled = true
      }
      if (ev.nextSibling) {
        this.nextDisabled = false
      } else {
        this.nextDisabled = true
      }

      if (node.children) {
        console.log('父级')
        this.type = 'parent'
      } else {
        this.type = 'children'
        console.log('子级')
      }
    },
    /**
     * 导入
     */
    importFile (file, fileList) {
      this.$message({
        showClose: true,
        message: '上传成功',
        type: 'success'
      })
      this.getList()
    },
    beforeAvatarUpload (file) {
      const isCSV = (/\.csv$/i).test(file.name)
      const isLt2M = file.size / 1024 / 1024 < 5;
      if (!isCSV) {
        this.$message.error('上传只能是csv格式!');
      }
      if (!isLt2M) {
        this.$message.error('大小不能超过 5MB!');
      }
      return isCSV && isLt2M;
    },
    importFileError () {
      this.$message({
        showClose: true,
        message: '上传失败,请重新上传',
        type: 'error'
      })
    },
    /**
     * 创建链接导出
     */
    createLink (val, name) {
      let csv = '\uFEFF' + val
      var blob = new Blob([csv], {
        type:
          'text/csv,charset=UTF-8'
      });
      const url = window.URL.createObjectURL(blob);
      var filename = name + '.csv';
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    /**
     * 导出
     */
    exportFile () {
      this.$http.post('/tag.export_csv').then(res => {
        this.createLink(res, '标签模板')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .visitor-setting-wrap {
    width: 100%;
    > .header {
      border-bottom: 1px solid @border-color;
      display: flex;
      padding: 10px 16px;
      > div {
        &:nth-child(1) {
          flex: 1;
        }
      }
      .btn-wrap {
        display: flex;
        .upload-wrap {
          margin: 0 10px;
        }
      }
    }
    .content {
      display: flex;
      height: 430px;
      .left-wrap {
        width: 250px;
        border-right: 1px solid @border-color;
        position: relative;
        .tree-list {
          overflow-y: auto;
          height: 390px;
        }
        .drag-btn-wrap {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 0;
          width: 100%;
          padding: 10px 16px;
          button {
            flex: 1;
          }
        }
      }
      .right-wrap {
        flex: 1;
        .header {
          align-items: center;
          display: flex;
          padding: 10px 16px;
          .title {
            flex: 1;
            font-size: @font-size-bigger;
          }
        }
      }
    }
  }
</style>