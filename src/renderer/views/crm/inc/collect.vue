<template>
  <div class="service-dialog">
    <Dialog title="新建收藏">
      <div class="contant">
        <div class="block">
          <p class="title">收藏名称：</p>
          <el-input v-model="name" size="mini" maxlength="10" placeholder="请输入内容"></el-input>
        </div>
        <div class="block remark-block">
          <p class="title">收藏备注：</p>
          <el-input v-model="memo" size="mini" type="textarea" maxlength="100" placeholder="请输入内容"></el-input>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="right">
          <el-button size="mini" @click="closeWin">取 消</el-button>
          <el-button type="primary" @click="submit" size="mini">确 定</el-button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog';
export default {
  components: {
    Dialog
  },
  data () {
    return {
      name: '',
      memo: ''
    };
  },
  created () {},
  methods: {
    closeWin () {
      this.$Win.closeWin();
    },
    /**
     * 保存
     */
    submit () {
      if (!this.name) {
        this.$message.error('名称不能为空')
        return
      }
      this.$ipcSend('collectData', {
        name: this.name,
        memo: this.memo
      })
      this.$Win.closeWin();
    }
  }
};
</script>
<style lang="less" scoped>
.service-dialog {
  height: 100%;
  .title {
    line-height: 1;
    font-size: 14px;
    color: #87929f;
    margin-bottom: 10px;
  }
  .block {
    margin-bottom: 10px;
  }
  .remark-block {
    margin-bottom: 0;
  }
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>