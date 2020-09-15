<template>
  <div class="dialog-monitor-filter">
    <Dialog title="历史记录筛选条件" :before-close="handleClose">
      <div class="content">
        <div class="block mark-block">
          <div class="title">筛选收藏夹：</div>
          <div class="select">
            <el-select
              v-model="favoriteValue"
              size="mini"
              filterable
              placeholder="请选择"
              v-if="selectFlag"
            >
              <el-option
                v-for="item in favoriteArr"
                :key="item.value"
                :label="item.label"
                :value="item"
              ></el-option>
            </el-select>
          </div>
          <el-input size="mini" v-model="name" v-if="!selectFlag" maxlength="10"></el-input>
          <el-button size="mini" class="button" @click="cancel" v-if="!selectFlag">取消</el-button>
          <el-button size="mini" class="button" v-if="selectFlag" :disabled="!editStatus" @click="modify">修改</el-button>
          <el-button size="mini" class="button" :disabled="delStatus" @click="deleteSearch">删除</el-button>
        </div>
        <div class="block condition-block">
          <div class="item">
            <div class="title">自定义筛选条件</div>
            <div class="btns">
              <span class="clean" @click="clean" :class="cleanStatus?'':'disable'">
                <i class="iconfont">&#xe6b4;</i>
                清空
              </span>
            </div>
          </div>
          <div class="item">
            <!-- 公众号 -->
            <el-select v-model="official" size="mini" filterable placeholder="公众号" clearable :disabled="editStatus">
              <el-option
                v-for="item in list.weixin_type_array.list"
                 :key="item.wx_appid"
                 :label="item.content"
                 :value="item.wx_appid"
              ></el-option>
            </el-select>
            <!-- 选择客服 -->
            <el-select v-model="service" size="mini" filterable placeholder="选择客服" clearable :disabled="editStatus">
              <el-option
                v-for="item in list.custom_service_array.list"
                :key="item.custom_service_id"
                :label="item.content"
                :value="item.custom_service_id"
              ></el-option>
            </el-select>
          </div>
          <div class="item ">
            <el-select v-model="visitorType" placeholder="选择会话类型" size="mini" clearable :disabled="editStatus">
              <el-option
                v-for="item in list.time_type_array.list"
                :key="item.sh_type"
                :label="item.content"
                :value="item.sh_type"
              ></el-option>
            </el-select>
            <el-select v-model="sessionType" placeholder="选择会话状态" size="mini" clearable :disabled="editStatus">
              <el-option
                v-for="item in list.session_type.list"
                :key="item.contac"
                :label="item.content"
                :value="item.contac"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div class="block number-block">
          <div class="title">未应答:</div>
          <div class="">
            时间超过
            <el-input-number v-model="unanswered_time" :min="1" label="描述文字" size="mini" :disabled="editStatus"></el-input-number>
            分钟
          </div>
        </div>
        <div class="block number-block">
          <div class="title">未回复:</div>
          <div class="">
            消息超过
            <el-input-number v-model="unanswered_count" :min="1" label="描述文字" size="mini" :disabled="editStatus"></el-input-number>
            条
          </div>
        </div>
        <div class="block number-block count-block">
          <div class="title">来访次数:</div>
          <div class="">
            <el-input-number v-model="visited_times_1" :min="0" label="描述文字" size="mini" :disabled="editStatus"></el-input-number>
            至
            <el-input-number v-model="visited_times_2" :min="1" label="描述文字" size="mini" :disabled="editStatus"></el-input-number>
            次
          </div>
        </div>
        <div class="block number-block">
          <div class="title">访客位置:</div>
          <div class="position">
            <el-input size="mini" v-model="position" placeholder="输入访客位置" :disabled="editStatus"></el-input>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <div class="share">
          <el-checkbox v-model="share">共享</el-checkbox>
        </div>
        <div class="right">
          <span>将搜索信息添加到收藏夹</span>
          <el-button
            type="success"
            size="mini"
            @click="changeCollect"
            :disabled="collectStatus"
          >{{collectText}}</el-button>
          <el-button type="primary" size="mini" @click="search">搜索</el-button>
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
      position: '',
      selectFlag: true,
      collectText: '收藏',
      share: false,
      favoriteValue: {
        select_type: 0,
        label: '自定义',
        value: '自定义'
      },
      official: '',
      service: '',
      visitorType: '',
      sessionType: '',
      // 未应答
      unanswered_time: '',
      // 未回复
      unanswered_count: '',
      // 来访次数
      visited_times_1: '',
      // 至
      visited_times_2: '',
      favoriteArr: [
        {
          value: '自定义',
          label: '自定义',
          select_type: 0
        }
      ],
      list: {
        weixin_type_array: {},
        custom_service_array: {},
        time_type_array: {},
        session_type: {}
      }
    };
  },
  async created () {
    await this.getSearchList()
    this.getWxAccount()
  },
  methods: {
    /**
    * 获取微信公众号
    */
    getWxAccount () {
      this.$http.post('/get_weixin_account').then(res => {
        let list = res.data.map(item => {
          item.wx_appid = item.authorizer_appid
          item.content = item.nick_name
          return item
        })
        this.list.weixin_type_array.list = list
      })
    },
    clean () {
      if (this.cleanStatus || !this.editStatus) {
        this.position = '';
        this.official = '';
        this.service = '';
        this.visitorType = '';
        this.sessionType = '';
        this.unanswered_time = '';
        this.unanswered_count = '';
        this.visited_times_1 = '';
        this.visited_times_2 = '';
      }
    },
    /**
     * 修改
     */
    modify () {
      this.selectFlag = false;
      this.collectText = '保存';
    },
    /**
     * 取消按钮
     */
    cancel () {
      this.selectFlag = true;
      this.collectText = '收藏';
    },
    /**
     * 收藏按钮
     */
    changeCollect () {
      if (this.selectFlag) {
        this.collectText = '保存';
      } else {
        this.collectText = '收藏';
        this.saveSearch();
      }
      this.selectFlag = !this.selectFlag;
    },
    /**
     * 获取数据
     */
    getSearchList () {
      return this.$http
        .post('/user.search_list', {is_realtime: 1})
        .then(res => {
          this.list = res.data;
          this.favoriteArr = [
            {
              value: '自定义',
              label: '自定义',
              select_type: 0
            }
          ];
          res.data.search_list.forEach(item => {
            this.favoriteArr.push({
              ...item,
              label: item.name,
              value: item.id,
              select_type: 1
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 删除收藏
     */
    deleteSearch () {
      this.$http
        .post('/user.delete_search', {
          id: this.favoriteValue.id
        })
        .then(res => {
          this.$message.success('删除成功')
          this.favoriteArr.map((item, index) => {
            if (item.id === this.favoriteValue.id) {
              return this.favoriteArr.splice(index, 1)
            }
          })
          this.favoriteValue = this.favoriteArr[0]
          this.clean()
          this.$ipcSend('refreshMonitorSearchList')
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 保存按钮
     */
    saveSearch () {
      if (!this.name) {
        this.$message.error('请输入名称')
        return;
      }
      let params = {
        name: this.name,
        position: this.position,
        wx_appid: this.official,
        custom_service: this.service,
        // visitorType: this.visitorType,
        session_type: this.sessionType,
        unanswered_time: this.unanswered_time,
        unanswered_count: this.unanswered_count,
        visited_times_1: this.visited_times_1,
        visited_times_2: this.visited_times_2,
        is_realtime: 1
      };
      if (this.favoriteValue.id) {
        params.id = this.favoriteValue.id
      }
      this.$http
        .post('/user.save_search', params)
        .then(res => {
          this.favoriteValue = {
            ...res.data,
            description_info: JSON.parse(res.data.description),
            label: res.data.name,
            value: res.data.id,
            select_type: 1
          };
          this.getSearchList();
          this.$ipcSend('refreshMonitorSearchList')
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * arrayKey 数组键名
     * key 内部键名
     */
    getName (arrayKey, key, id) {
      if (!id) { return '' }
      let content = {}
      for (let item of this.list[arrayKey + '_array'].list) {
        if (item[key] === id) {
          content = {content: item.content}
          break;
        }
      }
      return content
    },
    /**
     * 搜索
     */
    search () {
      let customService = this.getName('custom_service', 'custom_service_id', this.service)
      let params = {
        position: this.position,
        wx_appid: this.official,
        custom_service: customService.content,
        // visitorType: this.visitorType,
        session_type: this.sessionType,
        unanswered_time: this.unanswered_time,
        unanswered_count: this.unanswered_count,
        visited_times_1: this.visited_times_1,
        visited_times_2: this.visited_times_2
      };
      // 访客管理
      if ('id' in this.favoriteValue) {
        this.$ipcSend('refreshMonitorList', {id: this.favoriteValue.id});
      } else {
        this.$ipcSend('refreshMonitorList', params);
      }
      this.$Win.closeWin();
    },
    handleClose (done) {
      done();
    },
    submit () {
      this.$Win.closeWin();
    }
  },
  computed: {
    editStatus () {
      return this.favoriteValue.select_type === 1 && this.selectFlag;
    },
    delStatus () {
      return this.favoriteValue.select_type === 0;
    },
    cleanStatus () {
      return this.favoriteValue.select_type === 0;
    },
    collectStatus () {
      return this.favoriteValue.select_type !== 0 && this.selectFlag;
    }
  },
  watch: {
    favoriteValue () {
      let value = this.favoriteValue;
      let obj = value.description_info || {};
      this.name = value.name || '';
      this.position = obj.position || '';
      this.official = obj.wx_appid || '';
      this.service = parseInt(obj.custom_service) || '';
      this.sessionType = obj.session_type || '';
      this.unanswered_time = obj.unanswered_time || '';
      this.unanswered_count = obj.unanswered_count || '';
      this.visited_times_1 = obj.visited_times_1 || '';
      this.visited_times_2 = obj.visited_times_2 || '';
    }
  }
};
</script>
<style lang="less" scoped>
.dialog-monitor-filter {
  .content {
    padding: 10px;
    .number-block{
      display: flex;
      align-items: center;
      .title{
        flex: 0 0 92px;
      }
      .el-input-number{
        margin: 0 10px;
      }
      .position{
        width: 330px;
      }
    }
    .count-block{
      .el-input-number{
        &:first-child{
          margin:  0 10px 0 0;
        }
        margin: 0 10px;
      }
    }
    .condition-block{
      .item{
        display: flex;
        justify-content: space-between;
        align-items: center;
        &:nth-child(2){
          margin-top: 7px;
        }
        &:nth-child(3){
          margin-top:16px;
        }
        .el-select{
          flex: 1 1 50%;
          margin-right: 16px;
          &:last-child{
            margin-right: 0;
          }
        }        
      }
      }
    .mark-block {
      display: flex;
      align-items: center;
      .title {
        line-height: 1;
        flex: 0 0 106px;
        font-size: @font-size-base;
        color: @color-text-secondary;
      }
      .select {
        flex: 1 1 auto;
        .el-select {
          width: 100%;
        }
      }
      .el-input {
        flex: 1 1 auto;
      }
      .button {
        margin-left: 10px;
      }
    }
    .block {
      margin-bottom: 25px;
    }
    .clean {
      font-size: @font-size-base;
      color: @color-text-secondary;
      cursor: pointer;
      &.disable{
        cursor: default;
      }
      i {
        font-size: @font-size-small;
      }
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .right{
      display: flex;
      align-items: center;
      justify-content: flex-end;
      span{
        margin-right: 17px;
      }
    }
  }
}
</style>

