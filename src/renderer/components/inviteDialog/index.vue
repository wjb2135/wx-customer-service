<template>
  <div class="service-dialog">
    <Dialog title="邀请">
      <div class="contant">
        <div class="left">
          <div class="head">
            <el-radio-group size="mini" v-model="tabs" @change="changeTabs">
              <el-radio-button label="可邀请访客"></el-radio-button>
              <el-radio-button label="不可邀请访客"></el-radio-button>
            </el-radio-group>
          </div>
          <div class="body">
            <el-scrollbar :native="false" style="height:100%" class="m-scroll">
              <el-table
                :data="tableData"
                style="width: 100%"
                size="mini"
                stripe
                class="fw-table visitor-table"
              >
                <el-table-column label="名称" width="120" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <span>{{ scope.row.name || scope.row.nickname }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="公众号" prop="weixin_account_name"></el-table-column>
                <el-table-column label="状态" prop="subscribe_status_str" show-overflow-tooltip></el-table-column>
              </el-table>
            </el-scrollbar>
          </div>
        </div>
        <div class="right" v-show="tabs === '可邀请访客'">
          <chatEdit name="邀请内容" :showType="showType" @radioMedia="radioMedia"></chatEdit>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="left">
          <span v-if="tabs === '可邀请访客'">共邀请{{ableList.length}}人</span>
          <span v-else>不可邀请{{unableList.length}}人</span>
        </div>
        <div class="right">
          <el-button size="mini" @click="closeWin">取 消</el-button>
          <el-button type="primary" @click="submit" size="mini" v-show="tabs === '可邀请访客'">确 定</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog';
import chatEdit from '@/components/chatEdit';
import { mapGetters } from 'vuex';
export default {
  components: {
    Dialog,
    chatEdit
  },
  data () {
    return {
      tabs: '可邀请访客',
      ableList: [], // 可邀请
      unableList: [], // 不可邀请
      tableData: [], // 原始列表
      ids: '',
      mediaData: {
        type: 'text'
      },
      showType: ['face', 'folder', 'screen', 'media', 'voice'],
      loading: false
    };
  },
  created () {
    this.sort();
  },
  computed: {
    ...mapGetters({
      visitorUserList: 'visitorUserList'
    })
  },
  methods: {
    closeWin () {
      this.$Win.closeWin();
    },
    /**
     * 素材赋值
     */
    radioMedia (val) {
      this.mediaData = val;
    },
    /**
     * 分类
     */
    sort () {
      this.visitorUserList.forEach(item => {
        if (!item.last_operation_time) {
          this.unableList.push(item);
          return;
        }
        let towDayMilliSecond = 24 * 60 * 60 * 1000 * 2;
        let nowMilliSecond = new Date().getTime();
        let lastMilliSecond = new Date(item.last_operation_time).getTime();
        // 可邀请对象为最后操作时间不超过48小时
        if (nowMilliSecond - lastMilliSecond <= towDayMilliSecond && item.subscribe_status_str === '当前关注') {
          this.ableList.push(item);
          this.ids += this.ids === '' ? item.id : ',' + item.id;
        } else {
          this.unableList.push(item);
        }
      });
      this.tableData = this.ableList;
    },
    /**
     * 切换tabs
     */
    changeTabs () {
      this.tableData =
        this.tabs === '可邀请访客' ? this.ableList : this.unableList;
    },
    /**
     * 发送邀请
     */
    submit () {
      if (this.ableList.length <= 0) {
        this.$message({
          type: 'error',
          message: '没有可邀请的访客'
        })
        return;
      }
      if (this.loading) {
        return;
      }
      this.loading = true;
      // 默认比当前时间多一小时
      let time = new Date(new Date().getTime())
      // 格式化时间
      time = this.$utilscore.formatTime(time, 'YYYY-MM-DD hh:mm:ss')
      let params = {
        realtime: time,
        clients_id: this.ids,
        appid: this.ableList.length > 0 && this.ableList[0].wx_appid
      };
      // 文件上传
      if (this.mediaData.contentType === 'multipart/form-data') {
        // 追加内容
        for (let key of Object.keys(params)) {
          this.mediaData.data.append(key, params[key]);
        }
        this.$http
          .post('/res.save', this.mediaData.data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(res => {
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.closeWin();
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        params.type = this.mediaData.type;
        params.content = this.mediaData.content || '';
        params.source_id =
          this.mediaData.source_id && this.mediaData.source_id[0];
        params.fileType = this.mediaData.fileType || '';
        params.fileUpload = this.mediaData.fileUpload || '';
        this.$http
          .post('/res.save', params)
          .then(res => {
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.closeWin();
          })
          .catch(() => {
            this.loading = false;
          });
      }
    }
  }
};
</script>
<style lang="less">
.service-dialog {
  .dialog__wrapper {
    height: 100%;
    .dialog {
      height: 100%;
      .dialog__body {
        height: calc(100% - 40px);
        padding: 0;
      }
    }
  }
  .chat-edit {
    height: 100%;
    .header-tool {
      height: 49px;
    }
    .edit-bar {
      height: 100%;
      textarea {
        height: 100%;
        background-color: #fff;
        resize: none;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.service-dialog {
  height: 100%;
  .head {
    padding: 10px 7px;
  }
  .contant {
    display: flex;
    height: 100%;
    overflow: hidden;
    .left {
      flex: 1;
      width: 50%;
      height: 100%;
      .head {
        border-bottom: 1px solid @border-color;
      }
      .body {
        height: calc(100% - 48px);
        border-right: 1px solid @border-color;
      }
    }
    .right {
      flex: 1;
      margin: 0 10px 10px;
      padding-top: 3px;
    }
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>