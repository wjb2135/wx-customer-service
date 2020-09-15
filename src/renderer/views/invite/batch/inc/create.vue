<template>
  <div class="page-invite-create">
    <div class="main">
      <!-- 筛选 -->
      <div class="filter">
        <div class="title">
          <p class="word">
            <i class="iconfont">&#xe6d4;</i>
            <span>批量邀请筛选条件</span>
          </p>
          <p class="hint">
            <i class="iconfont">&#xe6d0;</i>
            <span>批量邀请只能邀请48小时内给公众号发过消息的访客</span>
          </p>
        </div>
        <div class="content">
          <!-- 收藏 -->
          <div class="block">
            <div class="caption">选择收藏</div>
            <div class="select">
              <el-select
                v-model="favoriteValue"
                @visible-change="visibleChange"
                size="mini"
                filterable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in favoriteArr"
                  :key="item.value"
                  :label="item.label"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
            <div class="btn">
              <el-button
                size="mini"
                type="primary"
                :disabled="collectStatus"
                @click="changeCollect"
              >{{collectText}}</el-button>
            </div>
          </div>
          <!-- 来源 -->
          <div class="block">
            <div class="caption">访客来源</div>
            <div class="select">
              <el-select
                v-model="source"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="source"
              >
                <el-option
                  v-for="(item) in list.source_array.list"
                  :key="item.source"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
          </div>
          <!-- 标签 -->
          <div class="block">
            <div class="caption">访客标签</div>
            <div class="select">
              <el-select
                v-model="tag"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="tag"
              >
                <el-option
                  v-for="item in list.tag_array.list"
                  :key="item.tag"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
          </div>
          <!-- 公众号 -->
          <div class="block">
            <div class="caption">公众号</div>
            <div class="select">
              <el-select
                v-model="official"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="wx_appid"
              >
                <el-option
                  v-for="item in list.weixin_type_array.list"
                  :key="item.wx_appid"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
          </div>
          <!-- 联系方式 -->
          <div class="block">
            <div class="caption">联系方式</div>
            <div class="select nolimit">
              <el-select
                v-model="contac"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="contac"
              >
                <el-option
                  v-for="item in list.contact_array.list"
                  :key="item.contac"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
          </div>
          <!-- 访客类型 -->
          <div class="block">
            <div class="caption">访客类型</div>
            <div class="select">
              <el-select
                v-model="visitorType"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="sh_type"
              >
                <el-option
                  v-for="item in list.time_type_array.list"
                  :key="item.sh_type"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
          </div>
          <!-- 更多筛选条件 -->
          <div v-show="moreStatus">
            <!-- 来访次数 -->
            <div class="block">
              <div class="caption">来访次数</div>
              <el-select
                v-model="times"
                size="mini"
                filterable
                placeholder="请选择"
                clearable
                value-key="times"
              >
                <el-option
                  v-for="item in list.times_array.list"
                  :key="item.times"
                  :label="item.content"
                  :value="item"
                ></el-option>
              </el-select>
            </div>
            <!-- 访客性别 -->
            <div class="block">
              <div class="caption">访客性别</div>
              <div class="select">
                <el-select
                  v-model="sex"
                  size="mini"
                  filterable
                  placeholder="请选择"
                  clearable
                  value-key="sex"
                >
                  <el-option
                    v-for="item in list.sex_array.list"
                    :key="item.sex"
                    :label="item.content"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
              <!-- 访客位置 -->
            </div>
            <!-- 所属客服 -->
            <div class="block">
              <div class="caption">所属客服</div>
              <div class="select">
                <el-select
                  v-model="service"
                  size="mini"
                  filterable
                  placeholder="请选择"
                  clearable
                  value-key="custom_service_id"
                >
                  <el-option
                    v-for="item in list.custom_service_array.list"
                    :key="item.custom_service_id"
                    :label="item.content"
                    :value="item"
                  ></el-option>
                </el-select>
              </div>
            </div>
            <!-- 访客位置 -->
            <div class="block">
              <div class="caption">访客位置</div>
              <div class="select">
                <el-input size="mini" v-model="position" placeholder></el-input>
              </div>
            </div>
          </div>
          <!-- 展开所以筛选 -->
          <div class="block filtrate" :class="moreStatus?'close': ''">
            <p @click="changeMoreStatus">
              <span v-show="!moreStatus">展开所有筛选</span> 
              <span v-show="moreStatus">收起所有筛选</span> 
              <i class="iconfont">&#xe68f;</i>
            </p>
          </div>
        </div>
      </div>
      <!-- 编辑框 -->
      <div class="edit">
        <div class="title">
          <p>
            <i class="iconfont">&#xe6d4;</i>
            <span>填写群发内容</span>
          </p>
        </div>
        <div class="conten">
          <chatEdit :showType="showType" @radioMedia="radioMedia"></chatEdit>
        </div>
      </div>
    </div>
    <div class="footer">
      <el-button size="mini" @click="createTask">创建</el-button>
    </div>
  </div>
</template>

<script>
import chatEdit from '@/components/chatEdit';
import { mapActions } from 'vuex';
export default {
  components: {
    chatEdit
  },
  data () {
    return {
      showType: ['face', 'folder', 'screen', 'media', 'voice'],
      collectText: '收藏',
      selectFlag: true,
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
      // 查询类型
      dateType: '',
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
      favoriteValue: {
        value: '自定义',
        label: '自定义',
        select_type: 0
      },
      favoriteArr: [
        {
          value: '自定义',
          label: '自定义',
          select_type: 0
        }
      ],
      moreStatus: false,
      // 访客位置
      position: '',
      // 访客类型
      visitorType: '',
      // 公众号
      official: '',
      // 访客性别
      sex: '',
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
      endDateTime: '',
      name: '',
      memo: '',
      // 展示数据
      formChat: {},
      // 传输给后端的数据
      formData: {},
      // 条件字符串
      conditionStr: '',
      loading: false,
      // 返回回来的邀请列表数据
      userList: []
    };
  },
  mounted () {
    this.getSearchList();
    this.$ipcOn('collectData', (event, val) => {
      this.name = val.name;
      this.memo = val.memo;
      this.saveSearch();
    });
    // 发送任务
    this.$ipcOn('sendTask', (event, val) => {
      this.sendTask(val.title, val.data);
    });
  },
  destroyed () {
    this.$ipcRemove('collectData');
    this.$ipcRemove('sendTask');
  },
  methods: {
    ...mapActions(['setInviteFormChat', 'setInviteUserList']),
    init () {
      this.formChat = {}
      this.formData = {}
    },
    sendTask (title, list) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      let params = {
        clients_id: list.idStr,
        appid: list.appid,
        conditions: this.conditionStr,
        title: title
      };
      // 文件上传
      if (this.formData.contentType === 'multipart/form-data') {
        // 追加内容
        for (let key of Object.keys(params)) {
          if (params[key]) {
            this.formData.data.append(key, params[key]);
          }
        }
        this.$http
          .post('/res.batch_save', this.formData.data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(res => {
            this.loading = false;
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.init()
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        // 其他
        params.type = this.formData.type;
        params.content = this.formData.content || '';
        params.source_id =
          this.formData.source_id && this.formData.source_id[0];
        params.fileType = this.formData.fileType || '';
        params.fileUpload = this.formData.fileUpload || '';
        this.$http
          .post('/res.batch_save', params)
          .then(res => {
            this.loading = false;
            this.$message({
              message: '发送邀请成功',
              type: 'success'
            });
            this.init()
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    async createTask () {
      // 群发内容不能为空
      if (Object.keys(this.formChat).length <= 0) {
        return this.$message.error('请输入群发内容');
      }
      // 缓存群发内容
      this.$store.dispatch('setInviteFormChat', this.formChat);
      // 获取群发对象
      await this.getAllShList();
      this.conditionStr = this.getConditionStr();

      // 打开群发任务窗口
      this.newWindows(`/invite/task?win=${this.$route.query.winbox}&condition=${this.conditionStr}`, {
        width: 600,
        height: 640
      });
    },
    getConditionStr () {
      let condition = `
      ${this.visitorType.content ? '访客类型:' + this.visitorType.content : ''}
      ${this.official.content ? '| 公众号:' + this.official.content : ''}
      ${this.sex.content ? '| 性别:' + this.sex.content : ''}
      ${this.age.content ? '| 年龄:' + this.age.content : ''}
      ${this.source.content ? '| 来源:' + this.source.content : ''}
      ${this.contac.content ? '| 联系方式:' + this.contac.content : ''}
      ${this.times.content ? '| 来访次数:' + this.times.content : ''}
      ${this.tag.content ? '| 访客标签:' + this.tag.content : ''}
      ${this.service.content ? '| 所属客服:' + this.service.content : ''}
      ${this.position !== '' ? '| 访客位置:' + this.position : ''}
      `;
      // 去空格
      condition = condition.replace(/^\s*|\s*$/g, '');
      // 去|符号
      condition = condition.replace(/^\|*|\|*$/g, '');
      return condition;
    },
    getAllShList () {
      let params = {};
      if (this.favoriteValue.id) {
        params = {
          pagesize: 0,
          id: this.favoriteValue.id
        };
      } else {
        params = {
          pagesize: 0,
          sh_type: this.visitorType.sh_type,
          wx_appid: this.official.wx_appid,
          sex: this.sex.sex || -1,
          age: this.age.age,
          source: this.source.source,
          contac: this.contac.contac,
          times: this.times.times,
          tag: this.tag.tag,
          custom_service: this.service.custom_service_id,
          position: this.position
        };
      }

      return this.$http
        .post('user.get_all_sh_list', params)
        .then(res => {
          let towDayMilliSecond = 24 * 60 * 60 * 1000 * 2;
          let nowMilliSecond = new Date().getTime();
          let list = []
          res.data.list.forEach((item) => {
            let lastMilliSecond = new Date(item.last_operation_time).getTime();
            // 最后操作时间不可超过48小时
            if (nowMilliSecond - lastMilliSecond <= towDayMilliSecond) {
              list.push(item)
            }
          })
          // 缓存群发对象
          this.$store.dispatch('setInviteUserList', list);
        })
        .catch(() => {
          this.$store.dispatch('setInviteUserList', []);
        });
    },
    visibleChange (flag) {
      if (flag) {
        return;
      }
      if (this.favoriteValue.select_type === 0) {
        this.selectFlag = true;
        this.collectText = '收藏';
      } else {
        this.selectFlag = false;
        this.collectText = '删除收藏';
      }
    },
    /**
     * 收藏按钮
     */
    changeCollect () {
      // 收藏
      if (this.selectFlag) {
        this.newWindows('/crm/collect', { width: 400, height: 260 });
      } else {
        // 删除收藏
        this.deleteSearch();
      }
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
          this.$message.success('删除成功');
          this.favoriteArr.map((item, index) => {
            if (item.id === this.favoriteValue.id) {
              return this.favoriteArr.splice(index, 1);
            }
          });
          this.favoriteValue = this.favoriteArr[0];
          this.selectFlag = true;
          this.collectText = '收藏';
        })
        .catch(err => {
          console.log(err);
        });
    },
    /**
     * 保存按钮
     */
    saveSearch () {
      let params = {
        name: this.name,
        memo: this.memo,
        issystem: 0,
        sh_type: this.visitorType.sh_type,
        wx_appid: this.official.wx_appid,
        sex: this.sex.sex || -1,
        age: this.age.age,
        source: this.source.source,
        contac: this.contac.contac,
        times: this.times.times,
        tag: this.tag.tag,
        custom_service: this.service.custom_service_id,
        position: this.position
      };
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
          this.selectFlag = false;
          this.collectText = '删除收藏';
        })
        .catch(() => {
        });
    },
    /**
     * 展示所有筛选
     */
    changeMoreStatus () {
      this.moreStatus = !this.moreStatus;
    },
    /**
     * 获取数据
     */
    getSearchList () {
      this.$http
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
    },
    /**
     * 编辑数据
     */
    radioMedia (val) {
      this.formData = val;
      if (val.contentType === 'multipart/form-data') {
        this.formChat = val.formChat;
      } else {
        this.formChat = val;
      }
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
    }
  },
  computed: {
    collectStatus () {
      return this.favoriteValue.select_type !== 0 && this.selectFlag;
    }
  },
  watch: {
    favoriteValue () {
      let value = this.favoriteValue;
      let obj = value.description_info || {};
      this.name = value.name || '';
      this.visitorType = { sh_type: obj.sh_type, ...this.getName('time_type', 'sh_type', obj.sh_type) };
      this.official = { wx_appid: obj.wx_appid, ...this.getName('weixin_type', 'wx_appid', obj.wx_appid) };
      this.source = { source: obj.source, ...this.getName('source', 'source', obj.source) };
      this.sex = { sex: obj.sex, ...this.getName('sex', 'sex', obj.sex) };
      this.age = { age: obj.age || '', ...this.getName('age', 'age', obj.age) };
      this.contac = { contac: obj.contac || '', ...this.getName('contact', 'contac', obj.contac) };
      this.times = { times: obj.times || '', ...this.getName('times', 'times', obj.times) };
      this.tag = { tag: parseInt(obj.tag) || '', ...this.getName('tag', 'tag', parseInt(obj.tag)) };
      this.service = { custom_service_id: parseInt(obj.custom_service) || '', ...this.getName('custom_service', 'custom_service_id', parseInt(obj.custom_service)) };
      this.position = obj.position || '';
    }
  }
};
</script>
<style lang="less">
.page-create-service {
  .service-name,
  .service-department,
  .service-position,
  .service-status {
    display: inline-block;
    width: 50px;
  }
}
</style>

<style lang="less" scoped>
.page-invite-create {
  height: 100%;
  .footer {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
  }

  .main {
    height: calc(100% - 50px);
    display: flex;
  }
  .filter {
    border-bottom: 1px solid @border-color;
    border-right: 1px solid @border-color;
    .content {
      padding: 5px 11px;
      height: calc(100% - 45px);
      overflow: auto;
      .block {
        padding: 8px 0;
        display: flex;
        align-items: center;
        .caption {
          width: 56px;
          margin-right: 22px;
          color: #87929f;
          font-size: @font-size-base;
        }
        .select,
        .el-select {
          margin-right: 10px;
          width: 223px;
          flex: 0 0 223px;
          .el-select,
          .el-input {
            width: 100%;
          }
        }
        .btn {
          font-size: 0;
        }
        .notes {
          font-size: @font-size-base;
          color: #87929f;
        }
      }
      .block.filtrate {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0;
        p {
          cursor: pointer;
          font-size: @font-size-base;
          color: @color-primary;
          display: flex;
          align-items: center;
        }
        i {
          font-size: 10px;
          color: @color-primary;
          margin-left: 10px;
        }
        &.close {
          i {
            transform: rotateX(180deg);
          }
        }
      }
    }
  }
  .filter,
  .edit {
    height: 100%;
    flex: 1 1 600px;
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 45px;
      font-size: @font-size-big;
      color: #464c54;
      padding-right: 16px;
      p {
        font-weight: @font-weight-primary;
        white-space: nowrap;
        display: flex;
        align-items: center;
        i {
          margin: 0 6px;
          color: @color-primary;
          font-size: @font-size-large;
        }
        span {
          font-weight: bold;
        }
      }
      .hint {
        color: #fa4865;
        font-size: @font-size-base;
        i {
          color: #fa4865;
          margin-right: 9px;
          font-size: @font-size-large;
        }
      }
    }
  }
  .edit {
    flex: 1 2 600px;
    .conten {
      position: relative;
      left: -1px;
      height: calc(100% - 45px);
    }
  }
}
</style>