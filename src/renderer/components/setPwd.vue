<template>
  <Dialog title="修改密码" :before-close="handleClose">
    <div class="set-pwd">
      <el-form ref="form" :model="form" :rules="rules" label-width="110px" size="small">
        <el-form-item label="输入原始密码" prop="oldPassword">
          <el-input v-model="form.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="输入新密码" prop="newPassword">
          <el-input v-model="form.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="rPassword">
          <el-input v-model="form.rPassword"></el-input>
        </el-form-item>
      </el-form>
      <div class="tip">强密码规则：密码长度至少为6位，且必须包含至少一位数字和一位英文字母</div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="closeWindow">取 消</el-button>
      <el-button size="small" type="primary" @click="submitForm('form')">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
import { setTimeout } from 'timers';
export default {
  data () {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.newPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        rPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, message: '输入原始密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '输入新密码', trigger: 'blur' }
        ],
        rPassword: [
          { required: true, validator: validatePass, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleClose (done) {
      done();
    },
    closeWindow () {
      this.$Win.closeWin()
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$http.post('/cs.changepwd', {
            old_password: this.form.oldPassword,
            new_password: this.form.newPassword
          }).then(() => {
            this.$message({
              message: '修改成功',
              type: 'success'
            })
            setTimeout(() => {
              this.closeWindow()
            }, 1000)
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
  .set-pwd {
    .tip {
      font-size: @font-size-small;
      color: @color-text-regular;
      margin-top: 15px;
    }
  }
</style>
