<template>
  <Dialog title="新建链接">
    <el-form ref="form" :model="form" label-width="40px" size="mini">
      <el-form-item label="名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.link"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submit">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
  data () {
    return {
      form: {
        name: '',
        link: ''
      },
      type: '',
      win: ''
    };
  },
  created () {
    // 父窗口数值
    this.win = this.$route.query.win || '';
    this.type = this.$route.query.type || '';
  },
  methods: {
    submit () {
      if (this.$utilscore.isEmpty(this.form.name)) {
        this.$message({
          showClose: true,
          message: '请输入链接名称',
          type: 'error'
        })
        return;
      }
      if (this.$utilscore.isEmpty(this.form.link)) {
        this.$message({
          showClose: true,
          message: '请输入链接地址',
          type: 'error'
        })
        return;
      }
      if (
        this.form.link.indexOf('http://') < 0 &&
        this.form.link.indexOf('https://') < 0
      ) {
        this.$message({
          showClose: true,
          message: '请输入正确的链接格式',
          type: 'error'
        })
        return;
      }
      let params = Object.assign(
        {
          type: 'text'
        },
        this.form
      );
      if (this.win) {
        params.winbox = this.win;
        this.$ipcSend('createLink', params);
      } else {
        ipcRenderer.send('createLink', params);
      }
      this.$Win.closeWin();
    }
  }
};
</script>
