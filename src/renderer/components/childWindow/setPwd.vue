<template>
  <Dialog title="修改密码" :before-close="handleClose">
    <el-form ref="form" :model="form" label-width="100px">
      <el-form-item label="输入原始密码">
        <el-input v-model="form.old_password"></el-input>
      </el-form-item>
      <el-form-item label="输入新密码">
        <el-input v-model="form.new_password"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="form.r_password"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog';
export default {
  components: {
    Dialog
  },
  data () {
    return {
      form: {
        old_password: '',
        new_password: '',
        r_password: ''
      }
    }
  },
  methods: {
    handleClose (done) {
      done();
    },
    cancel () {
      this.$Win.closeWin();
    },
    submit () {
      this.$Win.closeWin();
    }
  }
}
</script>
