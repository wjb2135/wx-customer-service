<template>
  <Dialog title="选择分组">
    <span>{{activeReplyIds}}</span>
    <div  class="group-list">
      <el-radio-group v-model="activeGroupId">
        <el-radio :label="item.id" v-for="(item, index) in group" :key="index">{{item.name}}</el-radio>
      </el-radio-group>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" size="mini" @click="submit">确 定</el-button>
    </div>
  </Dialog>
</template>
 
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      group: [],
      activeGroupId: ''
    }
  },
  async created () {
    let res = await this.$http.post(`/cs.fastreply_group_read`, {
      type: this.$route.query.type
    })
    if (res.data && res.data.length > 0) {
      this.group = res.data
      this.activeGroupId = res.data[0].id
      this.activeGroupName = res.data[0].name
    }
  },
  methods: {
    submit () {
      this.$http.post(`/cs.fastreply_move`, {
        reply_id: this.$route.query.activeReplyIds,
        reply_group_id: this.activeGroupId,
        type: this.$route.query.type
      }).then((res) => {
        this.$ipcSend('refreshGroup', {
          winbox: this.$route.query.win
        })
        this.$Win.closeWin()
      }).catch(() => {

      });
    }
  },
  computed: {
    ...mapGetters(['activeReplyIds'])
  }
}
</script>