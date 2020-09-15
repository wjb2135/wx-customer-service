<template>
  <div class="conversation-close-reason">
    <!-- 添加/删除按钮 -->
    <setting-btn
      title1="添加模板"
      title2="删除模板"
      @btnClick="btnClick"></setting-btn>
    <div class="flex-box">
      <!-- 左侧list -->
      <setting-list
        class="flex"
        :data="list"
        :activeClass="activeClass"
        :prevDisabled="prevDisabled"
        :nextDisabled="nextDisabled"
        @moveClick="moveClick"
        @listClick="listClick"></setting-list>
      <!-- 右侧表单 -->
      <div class="rg-wrap">
        <!-- 预约模板主题 -->
        <div class="list">
          <div class="title">填写预约模板主题</div>
          <div class="form">
            <el-input type="text" placeholder="请输入模板主题" v-model="form.title" @blur="titleBlur" maxlength="10" show-word-limit></el-input>
          </div>
        </div>
        <!-- 邀请时间 -->
        <div class="list">
          <div class="title">邀请时间</div>
          <div class="select-wrap form">
            <el-select class="select-text" v-model="timeType" placeholder="邀请时间" size="mini" @change="timeTpyeChange">
              <el-option 
                v-for="(item, index) in timeList"
                :key="index" 
                :label="item.label" 
                :value="item.value"></el-option>
            </el-select>
            <el-input 
              type="number" 
              v-model="time" 
              class="select-time" 
              size="mini" 
              :min="1" 
              :max="24"
              @change="timeChange"></el-input>
            点（次日）
          </div>
        </div>
        <!-- 邀请语 -->
        <div class="list">
          <!-- <div class="title">邀请语
            <div class="icon-wrap">
              <i class="iconfont">&#xe692;</i>
              <i class="iconfont">&#xe6a9;</i>
              <i class="iconfont" @click="openWidow">&#xe6a5;</i>
              <i class="iconfont">&#xe627;</i>
            </div>
          </div>
          <div class="form">
            <wx-template class="content" v-if="form.weixin_template" :list="form"></wx-template>
            <div v-else
              class="content" 
              ref="content" 
              v-html="form.content.content"
              @input="textChange"
              contenteditable="true"></div>
          </div> -->
          <chatEdit
            class="chat-wrap"
            name="邀请内容"
            :id="clientsId"
            :content="templateContent"
            @radioMedia="radioMedia"
            @textareaChange="textareaChange"
           :showType="showType"
           ></chatEdit>
        </div>
        <!-- 添加按钮 -->
        <div class="form">
          <div class="tx-rg" v-show="addStatus"><el-button type="primary" size="mini" @click="templateAdd" :loading="loading">添加</el-button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import settingList from '@/components/setting/list'
import settingBtn from '@/components/setting/button'
import wxTemplate from '@/components/wxTemplate'
import chatEdit from '@/components/chatEdit';
export default {
  components: {
    settingList,
    settingBtn,
    wxTemplate,
    chatEdit
  },
  data () {
    return {
      loading: false,
      showType: ['face', 'media', 'link', 'template'],
      templateContent: {},
      clientsId: '',
      activeClass: 0,
      addStatus: false,
      prevDisabled: true,
      nextDisabled: false,
      id: 0,
      list: [],
      form: {
        content: ''
        // title: '',
        // type: 'text',
        // content: '啦啦啦',
        // source_id: 0,
        // time_type: 0,
        // time: 1,
        // appid: 0,
        // template_id: '',
        // url: ''
      },
      timeList: [
        {label: '绝对时间', value: 0},
        {label: '相对时间', value: 1}
      ],
      timeType: 0,
      time: 1,
      reservationInfo: {},
      serviceId: this.$store.state.user.baseUserInfo.id
    }
  },
  watch: {
    activeClass: {
      handler () {
        if (this.list.length === 0) {
          this.prevDisabled = true
          this.nextDisabled = true
          return
        }
        // console.log(this.activeClass, this.list.length - 1)
        if (this.activeClass === 0) {
          this.prevDisabled = true
          this.nextDisabled = false
        } else if (this.activeClass === this.list.length - 1) {
          this.prevDisabled = false
          this.nextDisabled = true
        } else {
          this.prevDisabled = false
          this.nextDisabled = false
        }
      },
      deep: true
    },
    form: {
      handler () {
        // console.log(this.form)
      },
      deep: true
    }
  },
  created () {
    this.getTemplateList()
    console.log(this.$route, 'this.$route')
    this.form.appid = this.baseUserInfo.weixin_account[0].appid
  },
  computed: {
    baseUserInfo () {
      return this.$store.state.user.baseUserInfo
    }
  },
  methods: {
    /**
     * 获取列表
     */
    getTemplateList () {
      this.$http.post('/res.template', {
        appid: this.baseUserInfo.weixin_account[0].appid,
        pagesize: 0
      }).then(res => {
        this.list = res.data
        this.list.forEach(item => {
          if (item.content.type === 'imagetext') {
            item.content.content.media_content = JSON.parse(item.content.content.media_content)
          }
        })
        if (this.list.length <= 1) {
          this.nextDisabled = true
        } else {
          if (this.status) {
            this.nextDisabled = false
            this.status = false
          }
        }
        if (this.list.length === 0) {
          this.addStatus = true
          return
        }
        this.getCurrentList(this.list[0])
      })
    },
    /**
     * 邀请时间 - 点
     */
    timeChange (v) {
      let vv = parseInt(v)
      this.time = vv
      if (vv === '' || vv === 0) {
        this.time = 1
      }
      if (vv.length > 2 || vv > 24) {
        this.time = 24
      }
      this.form.time = vv
      if (this.form.id) {
        this.templateType('edit')
      }
    },
    textChange () {
      // console.log(this.$el.innerHTML)
    },
    /**
     * 添加删除 按钮点击
     */
    btnClick (i) {
      if (i) { // 删除
        if (this.list.length === 0) return
        this.reasonDelete()
      } else { // 添加
        let noIds = true
        this.addStatus = true
        this.list.forEach((item, index) => {
          if (!item.id) {
            noIds = false
            this.activeClass = index
            this.form = item
          }
        })
        if (!noIds) return
        console.log(noIds)
        this.form = {
          title: '',
          time_type: 0,
          source_id: 0,
          time: 1,
          appid: this.baseUserInfo.weixin_account[0].appid,
          content: {
            content: '',
            type: 'text'
          }
        }
        this.templateContent = { ...this.form.content, type: 'text' }
        this.reservationInfo = this.form
        this.list.push(this.form)
        // this.form
        // this.templateContent = this.form
        this.activeClass = this.list.length - 1
      }
    },
    moveClick (type) {
      let option = this.list[this.activeClass]
      let tempOption = []
      if (type === 'prev') {
        tempOption = this.list[this.activeClass - 1]
        this.$set(this.list, this.activeClass - 1, option)
        this.$set(this.list, this.activeClass, tempOption)
        this.activeClass = this.activeClass - 1
      } else {
        tempOption = this.list[this.activeClass + 1]
        this.$set(this.list, this.activeClass + 1, option)
        this.$set(this.list, this.activeClass, tempOption)
        this.activeClass = this.activeClass + 1
      }
      let ids = ''
      this.list.forEach(item => {
        let id = parseInt(item.id)
        ids += id += ','
      })
      this.postSort(ids)
    },
    /**
     * 排序
     */
    postSort (ids) {
      this.$http.post('/res.template_setsort', {
        ids: ids
      }).then(() => {
      }).catch(err => {
        this.$message.err(err.message)
      })
    },
    /**
     * 列表点击
     */
    listClick (item) {
      if (item.id) {
        this.addStatus = false
      } else {
        this.addStatus = true
      }
      // 右侧填充理由
      this.activeClass = item.index
      this.getCurrentList(this.list[item.index])
      // if (this.form.template_id) { // 微信模板
      //   this.template_id = this.form.template_id
      //   this.templateContent = { ...this.form, type: 'wxTemplate' }
      //   this.reservationInfo = this.form
      //   this.templateContent.type = 'wxTemplate'
      //   this.templateContent = this.form
      // } else {
      //   // if (this.media.data.media_content)
      //   this.template_id = ''
      //   this.templateContent = this.form.content
      //   this.templateContent.type = this.form.content.type
      //   this.templateContent.content = this.form.content.content
      // }
    },
    getCurrentList (form) {
      this.form = form
      this.reservationInfo = form
      this.time = form.time
      this.timeType = form.time_type
      // console.log('this.form ', this.form.content)
      if (Number(this.form.template_id)) { // 微信模板
        this.template_id = this.form.template_id
        this.templateContent = { ...this.form, type: 'wxTemplate' }
        this.reservationInfo = this.form
        this.templateContent = this.form
        this.templateContent.type = 'wxTemplate'
      } else {
        this.template_id = ''
        this.templateContent = this.form.content
        this.templateContent.type = this.form.content.type
        this.templateContent.content = this.form.content.content
      }
    },
    /**
     * 选择素材
     */
    radioMedia (val) {
      if (val.type !== 'text') {
        this.reservationInfo = val
        if (this.form.id) {
          this.templateType('edit')
        }
        console.log(val)
      }
    },
    /**
     * 选择表情/textarea change
     */
    textareaChange (val) {
      this.templateContent = val
      this.reservationInfo = val
      console.log(val, 'log内容')
      // console.log('textareaChange', val)
      console.log('id', this.form.id)
      // console.log(this.templateContent, this.form)
      if (this.form.id) {
        this.templateType('edit')
      }
    },
    /**
     * 主题 input blur
     */
    titleBlur () {
      let title = this.form.title
      let item = this.list[this.activeClass]
      if (this.list.length === 0 || !item.id) { return }
      if (this.form.title === '') return
      if (this.form.id) {
        this.templateType('edit')
      }
    },
    /**
     * 邀请时间 - 绝对时间
     */
    timeTpyeChange (v) {
      this.form.time_type = v
      let item = this.list[this.activeClass]
      if (this.list.length === 0 || !item.id) { return }
      if (this.form.title === '') return
      if (this.form.id) {
        this.templateType('edit')
      }
    },
    templateType (v) {
      // console.log('当前列表', this.form)
      // console.log(this.form.template_id)
      // console.log('请求的数据', this.templateContent)
      let form = {
        title: this.form.title,
        // content: this.form.template_id ? JSON.stringify(this.form.content) : this.form.content.content,
        // source_id: this.form.content.type === 'text' ? '' : '',
        time_type: this.timeType,
        time: this.time,
        appid: this.baseUserInfo.weixin_account[0].appid,
        receive_custom_service_id: this.serviceId,
        // template_id: this.reservationInfo.template_id ? this.reservationInfo.template_id : '',
        url: this.reservationInfo.template_id ? this.reservationInfo.detail_url : ''
      }
      if (this.form.contentType === 'multipart/form-data') {
        // 追加内容
        for (let key of Object.keys(form)) {
          this.reservationInfo.data.append(key, form[key]);
        }
      } else {
        console.log('this.reservationInfo', this.reservationInfo)
        console.log('this.reservationInfo.content', this.reservationInfo.content)
        // form.content = this.form.template_id ? JSON.stringify(this.form.content) : this.form.content.content,
        if (this.reservationInfo.template_id) {
          form.template_id = this.reservationInfo.template_id
          form.type = this.reservationInfo.content.type
          form.content = JSON.stringify(this.reservationInfo.content)
        } else {
          form.content = this.reservationInfo.content
          if (this.reservationInfo.type !== 'text') {
            if (v === 'edit') {
              form.source_id = this.reservationInfo.content.source_id
              form.type = this.reservationInfo.content.type
            } else {
              form.source_id = this.reservationInfo.source_id[0]
              form.type = this.reservationInfo.type
            }
          }
        }
        if (this.reservationInfo.content && (this.reservationInfo.content.type === 'text' || this.reservationInfo.content.type === 'voice')) {
          form.content = this.reservationInfo.content.content
        }
        form.fileType = this.reservationInfo.fileType || ''
        form.fileUpload = this.reservationInfo.fileUpload || ''
      }
      if (this.reservationInfo.template_id === '0' && this.reservationInfo.content.type !== 'text' && this.reservationInfo.content.type !== 'wxTemplate') {
        delete form.content
        form.source_id = this.reservationInfo.content.source_id;
      }
      if (v === 'edit') {
        form.id = this.form.id
        this.templateEdit(form)
      } else {
        this.templateAddPost(form)
      }
      console.log('最后请求的数据', form)
    },
    /**
     * 修改模板
     */
    templateEdit (form) {
      this.$http.post('/res.template_save', form).then((res) => {
        this.list[this.activeClass] = res.data.data
        this.getCurrentList(res.data.data)
      })
    },
    /**
     * 添加模板
     */
    templateAdd () {
      // console.log(this.form, this.reservationInfo, this.templateContent)
      // console.log(this.form.content)
      if (this.form.title === '') {
        this.$message.error('请输入模板主题')
        return
      }
      if (Object.keys(this.templateContent).length <= 0) {
        this.$message.error('请输入邀请语')
        return
      }
      this.templateType('add')
    },
    templateAddPost (form) {
      this.loading = true
      this.$http.post('/res.template_save', form).then((res) => {
        this.list.splice(this.activeClass, 1)
        this.list.push(res.data.data)
        this.form = res.data.data
        this.addStatus = false
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    /**
     * 删除模板
     */
    reasonDelete () {
      if (this.list.length === 0) return // 列表长度为0
      if (!this.list[this.activeClass].id) { // 当前选中的没有id
        this.list.splice(this.activeClass, 1)
        this.activeClass = 0
        return
      }
      if (this.list.length === 0) return
      this.$http.post('/res.template_delete', {
        id: this.form.id
      }).then(() => {
        this.list.splice(this.activeClass, 1)
        this.activeClass = 0
        this.form = this.list[0]
        this.templateContent = this.list[0]
        if (this.list.length) {
          this.form = this.list[0]
          this.addStatus = false
        } else {
          this.form = {
            title: '',
            type: 'text',
            content: '',
            source_id: 0,
            time_type: 0,
            time: 1,
            appid: this.baseUserInfo.weixin_account[0].appid
          }
        }
      })
    },
    /**
     * 打开素材
     */
    openWidow () {
      // this.$router.push('/setting/template')
      this.newWindows('/setting/template', {width: 820, height: 580})
    }
  }
}
</script>

<style lang="less">
  .conversation-close-reason {
    width: 100%;
    .el-input .el-input__count .el-input__count-inner {
      background-color: #f7f9f9;
    }
    .flex-box {
      display: flex;
      height: 82.6%;
      .rg-wrap {
        flex: 1;
        .title {
          padding: 10px 16px;
          font-size: @font-size-bigger;
          position: relative;
        }
        .chat-wrap {
          padding: 0 16px;
          height: 205px;
          margin-bottom: 10px;
        }
        .select-wrap {
          padding-left: 16px;
          .select-text {
            width: 180px;
            margin-left: 5px;
          }
          .select-time {
            width: 75px;
            margin-right: 5px;
          }
        }
      }
      .content {
        width: 386px;
        height: 110px;
        background: #f7f9f9;
        border-radius: 4px;
        padding: 10px;
        outline: none;
        overflow: scroll;
      }
    }
  }
</style>