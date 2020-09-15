<template>
  <Dialog :title="isEdit ? (type == 1 ? '编辑知识库条目' : '编辑常用回复') : (type == 1 ? '新建知识库条目' : '新建常用回复')">
    <div class="create-reply">
      <el-form ref="form" size="mini" :model="form">
        <el-form-item label="">
          <el-input v-model="form.name" placeholder="请输入标题" show-word-limit maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="">
          <div class="tool-bar" v-if="false">
            <!-- 链接 -->
            <span class="tool-item tool-link" @click="linkDialog" title="链接"></span>
            <!-- 表情包 -->
            <el-popover
              placement="top-start"
              width="440"
              v-model="visible">
              <emotion @emotion="handleEmotion" :height="200"></emotion>
              <span class="tool-item tool-phiz" slot="reference" title="表情"></span>
            </el-popover>
          </div>
          <el-input type="textarea" placeholder="请输入内容" v-model="form.reply" maxlength="255" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="添加快捷码">
          <el-input v-model="form.quick_key">
            <template slot="prepend">/</template>
          </el-input>
          <div class="tip">*快捷码以"/"开头，后面由两位数字组成，在聊天框中输入快捷码，即可直接替换成对应的快捷回复</div>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button type="primary" size="mini" @click="submit">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
  import Emotion from '@/components/Emotion/index'
  export default {
    components: {
      Emotion
    },
    data () {
      return {
        visible: false,
        type: this.$route.query.type,
        form: {
          name: '',
          reply: '',
          quick_key: '',
          reply_group_id: this.$route.query.groupId,
          type: this.$route.query.type
        },
        isEdit: false
      }
    },
    created () {
      if (this.$route.query.replyId) {
        this.isEdit = true
        this.$http.post(`/cs.fastreply_read`, {
          reply_id: this.$route.query.replyId,
          type: this.type
        }).then((res) => {
          this.form.name = res.data.name
          this.form.reply = res.data.reply
          this.form.quick_key = res.data.quick_key
          this.form.reply_id = this.$route.query.replyId
        }).catch(() => {
  
        });
      }
    },
    methods: {
      /**
     * 选择表情
     */
      handleEmotion (i) {
        this.messageType = 'text'
        this.$refs.editInput.innerHTML += i
      },
      submit () {
        if (this.$utilscore.isEmpty(this.form.name)) {
          this.$message({
            showClose: true,
            message: '请输入快捷回复标题',
            type: 'error'
          })
          return
        }
        if (this.$utilscore.isEmpty(this.form.reply)) {
          this.$message({
            showClose: true,
            message: '请输入快捷回复内容',
            type: 'error'
          })
          return
        }
        if (!this.$utilscore.isEmpty(this.form.quick_key)) {
          let reg = /(^[0-9]{2,2}$)/
          if (!reg.test(this.form.quick_key)) {
            this.$message({
              showClose: true,
              message: '请输入正确的快捷码',
              type: 'error'
            })
            return
          }
        }
        let url = this.isEdit ? `/cs.fastreply_update` : `/cs.fastreply_create`
        this.$http.post(`${url}`, this.form).then((res) => {
          this.$ipcSend('refreshGroup', {
            winbox: this.$route.query.win
          });
          this.$Win.closeWin()
        }).catch(() => {
  
        });
      },
      cancel () {
        this.$Win.closeWin()
      },
      /**
       * 创建链接
       */
      linkDialog () {
        this.newWindows('session/createLink', {width: 400, height: 200});
      }
    }
  }
</script>

<style lang="less">
.create-reply {
  .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
    margin-bottom: 15px;
  }
  .tip {
    line-height: 1.5;
    font-size: 12px;
    margin-top: 15px;
  }
  .tool-bar {
    height: 36px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    overflow: hidden;
    text-align: right;
    justify-content: flex-end;
    .tool-item {
      color: #88929f;
      font-family: 'iconfont';
      font-size: 20px;
      margin-left: 15px;
      cursor: pointer;
    }
    .tool-phiz {
      &:after {
        content: '\e617';
      }
    }
    .tool-folder {
      position: relative;
      .input-file {
        position: absolute;
        top: 0;
        left: 0;
        width: 20px;
        height: 20px;
        opacity: 0;
        overflow: hidden;
        cursor: pointer;
      }
      &:after {
        content: '\e6ce';
      }
    }
    .tool-screenshot {
      &:after {
        content: '\e625';
      }
    }
    .tool-image {
      &:after {
        content: '\e889';
      }
    }
    .tool-link {
      &:after {
        content: '\e627';
      }
    }
    .tool-voice {
      &:after {
        content: '\e600';
      }
    }
  }
}
</style>