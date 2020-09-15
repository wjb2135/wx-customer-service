<template>
  <!-- 选择微信分组 -->
  <Dialog title="选择微信分组">
    <div class="set-wechat-group">
      <el-radio-group v-model="wechat_group">
        <el-radio :label="item.id" v-for="item in groupArr" :key="item.id">{{item.group_name}}</el-radio>
      </el-radio-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel" size="mini">取 消</el-button>
      <el-button type="primary" @click="submit" size="mini">确 定</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog';
import {mapActions} from 'vuex'
export default {
  components: {
    Dialog
  },
  data () {
    return {
      wechat_group: 0,
      groupArr: [],
      id: ''
    };
  },
  created () {
    this.id = this.$route.query.id;
    this.wechat_group = parseInt(this.$route.query.group);
    this.getGroups();
  },
  methods: {
    /**
     * 设置分组
     */
    submit () {
      let params = {
        id: this.id,
        group_id: this.wechat_group
      };
      this.$http
        .post('/user.set_group', params)
        .then(res => {
          this.groupArr.map((item) => {
            if (parseInt(item.id) === this.wechat_group) {
              this.$ipcSend('refreshUserInfo')
            }
          })
          this.$Win.closeWin();
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 关闭弹窗
     */
    cancel () {
      this.$Win.closeWin();
    },
    /**
     * 获取分组列表
     */
    getGroups () {
      let params = {
        id: this.id
      };
      this.$http
        .post('/user.get_groups', params)
        .then(res => {
          this.groupArr = res.data;
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.set-wechat-group {
  .el-radio {
    display: block;
    margin: 10px 0;
  }
}
</style>


