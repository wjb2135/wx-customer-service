<template>
  <div class="page-visitor-filter">
    <Dialog title="筛选条件" :before-close="handleClose">
      <!-- 筛选收藏夹 -->
      <div class="favorite">
        <div class="title">筛选收藏夹</div>
        <div class="content">
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
          <el-input size="mini" v-model="name" v-if="!selectFlag" maxlength="10"></el-input>
          <el-button size="mini" class="button" @click="cancel" v-if="!selectFlag">取消</el-button>
          <el-button size="mini" class="button" v-if="selectFlag" :disabled="!editStatus" @click="modify">修改</el-button>
          <el-button size="mini" class="button" :disabled="delStatus" @click="deleteSearch">删除</el-button>
        </div>
      </div>
      <!-- 自定义筛选条件 -->
      <div class="condition">
        <div class="title">
          <span>自定义筛选条件</span>
          <span class="clean" @click="clean" :class="cleanStatus?'':'disable'">
            <i class="iconfont">&#xe6b4;</i>
            清空
          </span>
        </div>
        <!-- 条件 -->
        <div class="input-box" v-if="Object.keys(list).length>0">
          <!-- 第一行 -->
          <el-row :gutter="10">
            <el-col :span="6">
              <!-- 公众号 -->
              <el-select v-model="official" size="mini" filterable placeholder="公众号" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.weixin_type_array.list"
                  :key="item.wx_appid"
                  :label="item.content"
                  :value="item.wx_appid"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 关注时间 -->
              <el-select v-model="dateType" size="mini" filterable placeholder="关注时间" :disabled="editStatus">
                <el-option
                  v-for="item in dateTypeArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 开始日期 -->
              <el-date-picker
                v-model="startDateTime"
                size="mini"
                type="datetime"
                placeholder="选择日期时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                align="right"
                :disabled="editStatus"
              ></el-date-picker>
            </el-col>
            <el-col :span="6">
              <!-- 结束日期 -->
              <el-date-picker
                v-model="endDateTime"
                size="mini"
                type="datetime"
                placeholder="选择日期时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                align="right"
                :disabled="editStatus"
              ></el-date-picker>
            </el-col>
          </el-row>
          <!-- 第二行 -->
          <el-row :gutter="10">
            <el-col :span="6">
              <!-- 访客类型 -->
              <el-select v-model="visitorType" size="mini" filterable placeholder="访客类型" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.time_type_array.list"
                  :key="item.sh_type"
                  :label="item.content"
                  :value="item.sh_type"
                ></el-option>
              </el-select>
            </el-col>

            <el-col :span="6">
              <!-- 访客性别 -->
              <el-select v-model="sex" size="mini" filterable placeholder="访客性别" :disabled="editStatus">
                <el-option
                  v-for="item in [{content: '访客性别', sex: '-1'}].concat(list.sex_array.list)"
                  :key="item.sex"
                  :label="item.content"
                  :value="item.sex"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 访客年龄 -->
              <el-select v-model="age" size="mini" filterable placeholder="访客年龄" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.age_array.list"
                  :key="item.age"
                  :label="item.content"
                  :value="item.age"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 访客来源 -->
              <el-select v-model="source" size="mini" filterable placeholder="访客来源" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.source_array.list"
                  :key="item.source"
                  :label="item.content"
                  :value="item.source"
                ></el-option>
              </el-select>
            </el-col>
          </el-row>
          <!-- 第四行 -->
          <el-row :gutter="10">
            <el-col :span="6">
              <!-- 来访次数 -->
              <el-select v-model="times" size="mini" filterable placeholder="来访次数" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.times_array.list"
                  :key="item.times"
                  :label="item.content"
                  :value="item.times"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 访客标签 -->
              <el-select v-model="tag" size="mini" filterable placeholder="访客标签" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.tag_array.list"
                  :key="item.tag"
                  :label="item.content"
                  :value="item.tag"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 联系方式 -->
              <el-select v-model="contac" size="mini" filterable placeholder="联系方式" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.contact_array.list"
                  :key="item.contac"
                  :label="item.content"
                  :value="item.contac"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 所属客服 -->
              <el-select v-model="service" size="mini" filterable placeholder="所属客服" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.custom_service_array.list"
                  :key="item.custom_service_id"
                  :label="item.content"
                  :value="item.custom_service_id"
                ></el-option>
              </el-select>
            </el-col>
          </el-row>
          <!-- 第五行 -->
          <el-row :gutter="10">
            <el-col :span="6">
              <!-- 访客状态 -->
              <el-select v-model="status" size="mini" filterable placeholder="请选择" clearable :disabled="editStatus">
                <el-option
                  v-for="item in list.status_array.list"
                  :key="item.status"
                  :label="item.content"
                  :value="item.status"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="18">
              <!-- 时间范围 -->
              <el-input size="mini" v-model="position" placeholder="输入访客位置" :disabled="editStatus"></el-input>
            </el-col>
          </el-row>
        </div>
        <!-- 显示搜索的条件 -->
        <div class="show-search-word"></div>
        <div slot="footer" class="dialog-footer footer-button">
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
import Frame from '@/components/windows/mainFrame.vue';
import mainHead from '@/components/windows/mainHead.vue';
export default {
  components: {
    Frame,
    mainHead
  },
  data () {
    return {
      position: '',
      favoriteValue: {
        select_type: 0,
        label: '自定义',
        value: '自定义'
      },
      selectFlag: true,
      name: '',
      collectText: '收藏',
      favoriteArr: [
        {
          value: '自定义',
          label: '自定义',
          select_type: 0
        }
      ],
      // 查询类型
      dateType: 1,
      dateTypeArr: [
        {
          value: 1,
          label: '最近来访'
        },
        {
          value: 2,
          label: '最后说话'
        },
        {
          value: 3,
          label: '首次关注'
        }
      ],
      list: {
        age_array: {
          list: []
        },
        contact_array: {
          list: []
        },
        custom_service_array: {
          list: []
        },
        sex_array: {
          list: []
        },
        source_array: {
          list: []
        },
        status_array: {
          list: []
        },
        tag_array: {
          list: []
        },
        time_type_array: {
          list: []
        },
        times_array: {
          list: []
        },
        weixin_type_array: {
          list: []
        }
      },
      // 二维码
      QRcode: '',
      QRcodeArr: [
        {
          value: 1,
          label: '老司机聊程序'
        }
      ],
      // 来访类型
      visitorType: '',
      // 公众号
      official: '',
      // 访客性别
      sex: '-1',
      // 年龄
      age: '',
      // 访客来源
      source: '',
      // 联系方式
      contac: '',
      // 来访次数
      times: '',
      // 访客标签
      tag: '',
      // 所属客服
      service: '',
      // 访客状态
      status: '',
      // 开始时间与结束时间
      startDateTime: '',
      endDateTime: ''
    };
  },
  async created () {
    await this.getSearchList();
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
        this.dateType = 1;
        this.startDateTime = '';
        this.endDateTime = '';
        this.visitorType = '';
        this.official = '';
        this.source = '';
        this.sex = '';
        this.age = '';
        this.contac = '';
        this.times = '';
        this.tag = '';
        this.service = '';
        this.status = '';
        this.position = '';
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
     * 搜索
     */
    search () {
      let params = {
        time_type: this.dateType,
        begin_time: this.startDateTime,
        end_time: this.endDateTime,
        sh_type: this.visitorType,
        wx_appid: this.official,
        sex: this.sex || -1,
        age: this.age,
        source: this.source,
        contac: this.contac,
        times: this.times,
        tag: this.tag,
        custom_service: this.service,
        status: this.status,
        position: this.position,
        id: ''
      };
      // 访客管理
      if ('id' in this.favoriteValue) {
        this.$ipcSend('refreshVisitorList', {id: this.favoriteValue.id});
      } else {
        this.$ipcSend('refreshVisitorList', params);
      }
      this.$Win.closeWin();
    },
    /**
     * 取消按钮
     */
    cancel () {
      this.selectFlag = true;
      this.collectText = '收藏';
    },
    handleClose (done) {
      done();
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
          this.$ipcSend('refreshSearchList')
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
        issystem: 0,
        time_type: this.dateType,
        begin_time: this.startDateTime,
        end_time: this.endDateTime,
        sh_type: this.visitorType,
        wx_appid: this.official,
        sex: this.sex > 0 ? this.sex : -1,
        age: this.age,
        source: this.source,
        contac: this.contac,
        times: this.times,
        tag: this.tag,
        custom_service: this.service,
        status: this.status,
        position: this.position
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
          this.$ipcSend('refreshSearchList')
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 获取数据
     */
    getSearchList () {
      return this.$http
        .get('/user.search_list')
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
      this.dateType = parseInt(obj.time_type) || '';
      this.startDateTime = obj.begin_time || '';
      this.endDateTime = obj.end_time || '';
      this.visitorType = obj.sh_type || '';
      this.official = obj.wx_appid || '';
      this.source = obj.source || '';
      this.sex = obj.sex || '';
      this.age = obj.age || '';
      this.contac = obj.contac || '';
      this.times = obj.times || '';
      this.tag = parseInt(obj.tag) || '';
      this.service = parseInt(obj.custom_service) || '';
      this.status = obj.status || '';
      this.position = obj.position || '';
    }
  }
};
</script>
<style lang="less">
.page-visitor-filter {
  .dialog {
    .dialog__body {
      padding: 0;
    }
  }
}
</style>

<style lang="less" scoped>
.page-visitor-filter {
  .footer-button {
    padding: 10px 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 50px;
  }
  .show-search-word {
    padding: 10px 20px;
    height: 120px;
    color: @color-text-secondary;
    font-size: @font-size-base;
    border-bottom: 1px solid @border-color;
  }
  .el-row {
    margin-bottom: 10px;
  }
  .input-box {
    padding: 0 20px;
    .el-date-editor.el-input,
    .el-select {
      width: 100%;
    }
  }
  .dialog-title {
    background-color: @color-primary;
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: @color-white;
    font-size: @font-size-base;
    padding: 0 20px;
    .close {
      cursor: pointer;
    }
  }
  .favorite {
    border-bottom: 1px solid @border-color;
    .title {
      padding: 10px 20px 0;
      font-size: @font-size-base;
      color: @color-text-secondary;
    }
    .content {
      padding: 10px 20px;
      font-size: 0;
      display: flex;
      .el-input {
        width: 178px;
      }
      .button {
        margin-left: 10px;
      }
    }
  }
  .condition {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      font-size: @font-size-base;
      color: @color-text-secondary;
      .clean {
        cursor: pointer;
        &.disable{
          cursor: default;
        }
        i {
          font-size: @font-size-small;
        }
      }
    }
  }
}
</style>