<template>
  <!-- 编辑常用回复语 -->
  <Dialog :title="type == 1 ? ' 知识库编辑' : '常用回复编辑'">
    <div class="edit-common-reply">
      <el-row>
        <el-col :span="8">
          <div class="edit-group">
            <div class="edit-group-hd">
              <span class="btn" @click="createGroup">新建</span>
              <span class="btn" @click="delGroup">删除</span>
              <span class="btn" @click="editGroup">修改(分组)</span>
            </div>
            <div class="edit-group-bd">
              <div class="title-group">常用回复</div>
              <div class="list-group">
                <div class="item-group" :class="{'active': activeGroupId === item.id}" v-for="(item, index) in group" :key="index" @click="chooseGroup(item.id)">{{item.name}}</div>
              </div>
            </div>
          </div>
          <!-- <div class="after">
            <span class="btn-out">导出</span>
            <span class="btn-in">导入</span>
          </div> -->
        </el-col>
        <el-col :span="16">
          <div class="edit-reply">
            <div class="edit-reply-hd">
              <div class="hd-l">
                <el-button size="mini" round @click="createReply">+ 新建</el-button>
              </div>
              <div class="hd-r">
                <span class="btn-del" @click="deleteFastreply">删除</span>
                <span class="btn-move" @click="moveFastreply">移动(分组)</span>
              </div>
            </div>
            <div class="edit-reply-bd">
              <el-table
                :data="fastreplyList"
                @selection-change="handleSelectionChange"
                size="mini"
                height="370"
                style="width: 100%">
                <el-table-column
                  type="selection"
                  width="45">
                </el-table-column>
                <el-table-column
                  prop="quick_key"
                  width="60"
                  label="快捷码">
                  <template slot-scope="scope">
                    <span>/{{scope.row.quick_key}}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="name"
                  width="100"
                  label="标题">
                </el-table-column>
                <el-table-column
                  prop="reply"
                  label="内容">
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="60"
                  align="right">
                  <template slot-scope="scope">
                    <i class="iconfont icon-edit" @click="editReply(scope.row.id)">&#xe6b4;</i>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div class="after">
            <el-button type="primary" size="mini" @click="closeWin">确定</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </Dialog>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      type: this.$route.query.type,
      group: [],
      activeGroupId: '',
      activeGroupName: ''
    }
  },
  created () {
    this.getFastreplyGroup()
    this.$ipcOn('refreshGroup', () => {
      this.getFastreplyGroup()
      this.$ipcSend('refreshGroup')
    })
  },
  methods: {
    ...mapActions(['setActiveReplyIds']),
    async getFastreplyGroup () {
      let res = await this.$http.post(`/cs.fastreply_group_read`, {
        type: this.type
      })
      if (res.data && res.data.length > 0) {
        this.group = res.data
        this.activeGroupId = res.data[0].id
        this.activeGroupName = res.data[0].name
      } else {
        this.group = []
        this.activeGroupId = ''
        this.activeGroupName = ''
      }
    },
    handleSelectionChange (val) {
      let data = val.map((item) => {
        return item.id
      })
      this.activeReplyIds = data
      this.setActiveReplyIds(data)
    },
    /**
     * 创建组
     */
    createGroup () {
      this.newWindows(`/session/editQuickReply/createGroup?type=${this.type}&win=${this.$route.query.winbox}`, { width: 380, height: 160 });
    },
    /**
     * 编辑组
     */
    editGroup () {
      this.newWindows(`/session/editQuickReply/createGroup?type=${this.type}&groupId=${this.activeGroupId}&groupName=${this.activeGroupName}&win=${this.$route.query.winbox}`, { width: 380, height: 160 });
    },
    /**
     * 删除组
     */
    delGroup () {
      let self = this
      self.$dialog.showMessageBox({
        type: 'info',
        title: '删除分组确认',
        message: '删除分组会连分组下的回复全部删除，是否继续删除？',
        buttons: ['ok', 'cancel']
      }, (index) => {
        if (index === 0) {
          self.$http.post('/cs.fastreply_group_delete', {
            reply_group_id: self.activeGroupId,
            type: this.type
          }).then((res) => {
            self.getFastreplyGroup()
          })
        } else {
          console.log('You click cancel');
        }
      })
    },
    chooseGroup (id) {
      this.activeGroupId = id
    },
    createReply () {
      this.newWindows(`/session/editQuickReply/createReply?type=${this.type}&groupId=${this.activeGroupId}&win=${this.$route.query.winbox}`, { width: 450, height: 370 });
    },
    /**
     * 删除当前回复内容
     */
    deleteFastreply (replyId) {
      if (this.activeReplyIds && this.activeReplyIds.length > 0) {
        this.$http.post(`/cs.fastreply_delete`, {
          reply_id: this.activeReplyIds.join(','),
          type: this.type
        }).then((res) => {
          this.getFastreplyGroup()
        }).catch(() => {

        });
      } else {
        this.$message({
          message: '您需要先选择一个条目才能进行删除',
          type: 'error'
        })
      }
    },
    /**
     * 快捷回复移动
     */
    moveFastreply () {
      if (this.activeReplyIds && this.activeReplyIds.length > 0) {
        this.newWindows(`/session/editQuickReply/moveReplay?type=${this.type}&activeReplyIds=${this.activeReplyIds.join(',')}&win=${this.$route.query.winbox}`, { width: 450, height: 370 });
      } else {
        this.$message({
          message: '您需要先选择一个条目才能进行编辑',
          type: 'error'
        })
      }
    },
    editReply (id) {
      this.newWindows(`/session/editQuickReply/createReply?type=${this.type}&groupId=${this.activeGroupId}&replyId=${id}&win=${this.$route.query.winbox}`, { width: 450, height: 370 });
    },
    closeWin () {
      this.$ipcSend('refreshGroup')
      this.$Win.closeWin()
    }
  },
  computed: {
    fastreplyList () {
      if (this.group && this.group.length > 0) {
        let data = this.group.filter((item) => {
          console.log('aaaaa' + item.id)
          console.log('bbbbb' + this.activeGroupId)
          return item.id === this.activeGroupId
        })
        return data[0].children
      } else {
        return []
      }
    }
  },
  watch: {
    activeGroupId () {

    }
  }
}
</script>

<style lang="less">
  .edit-common-reply {
    height: 100%;
    background-color: #fff;
    margin: -15px;
    height: 450px;
    .icon-edit {
      cursor: pointer;
      font-size: 12px;
    }
    .btn, .btn-del, .btn-move {
      cursor: pointer;
    }
    .el-col {
      position: relative;
    }
    .after {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      background-color: #f7f7f7;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      border-top: 1px solid @border-color;
      padding: 0 10px;
      .btn-out, .btn-in {
        margin-left: 10px;
        text-decoration: underline;
        color: @color-primary;
        font-size: 12px;
        cursor: pointer;
      }
    }
    .el-table {
      th {
        padding: 0;
      }
      th , .tr{
        background-color: #f7f7f7;
        height: 30px;
      }
      .cell {
        line-height: 1.5;
        overflow:hidden; 
        text-overflow:ellipsis;
        display:-webkit-box; 
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2; 
      }
    }
    .el-row, .el-col {
      height: 100%;
    }
    .el-col-8 {
      border-right: 1px solid @border-color;
    }
    .edit-group {
      .edit-group-hd {
        height: 34px;
        display: flex;
        background-color: #fff;
        justify-content: flex-end;
        align-items: center;
        border-bottom: 1px solid @border-color;
        font-size: 12px;
        padding: 0 15px;
        span {
          color: @color-primary;
          text-decoration: underline;
          margin: 0 7px;
        }
      }
      .title-group {
        background-color: #f7f7f7;
        height: 30px;
        line-height: 30px;
        padding: 0 15px;
      }
      .list-group {
        .item-group {
          height: 30px;
          line-height: 30px;
          padding: 0 15px;
          padding-left: 20px;
          cursor: pointer;
          &.active {
            background-color: @color-primary;
            color: #fff;
          }
        }
      }
    }
    .edit-reply {
      .edit-reply-hd {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 34px;
        padding: 0 15px;
        border-bottom: 1px solid @border-color;
        font-size: 12px;
        .el-button--mini {
          padding: 5px 15px;
        }
        .hd-l {
          span {

          }
        }
        .hd-r {
          span {
            margin-left: 10px;
            text-decoration: underline;
            color: @color-primary;
          }
        }
      }
    }
  }
</style>
