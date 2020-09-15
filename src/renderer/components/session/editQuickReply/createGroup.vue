<template>
  <Dialog :title="isEdit ? '编辑分组' : '新建分组'">
    <el-form ref="form" size="mini" :model="form" label-width="80px">
      <el-form-item label="名称">
        <el-input v-model="form.name" show-word-limit maxlength="10"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button type="primary" size="mini" @click="create">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
export default {
  data () {
    return {
      isEdit: false,
      form: {
        name: '',
        type: this.$route.query.type
      }
    }
  },
  created () {
    if (this.$route.query.groupId) {
      this.isEdit = true
      this.form.name = this.$route.query.groupName
      this.form.reply_group_id = this.$route.query.groupId
    }
  },
  methods: {
    create () {
      let url = this.isEdit ? `/cs.fastreply_group_update` : `/cs.fastreply_group_create`
      this.$http.post(`${url}`, this.form).then((res) => {
        this.$ipcSend('refreshGroup', {
          winbox: this.$route.query.win
        })
        this.$Win.closeWin()
      }).catch(() => {

      });
    },
    cancel () {
      this.$Win.closeWin()
    }
  }
}
</script>