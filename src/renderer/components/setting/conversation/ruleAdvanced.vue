<template>
  <div class="rule-advanced">
    <div class="top">
      <el-button :type="btnType" size="mini" :disabled="disable">启动分配规则</el-button>
      <div class="tip">自动分配模式下才可以启用分配规则</div>
    </div>
    <div class="content-wrap">
      <div class="overlay" v-show="disable"></div>
      <div class="transfer-wrap">
        <el-tree
          ref="treeBox"
          :data="treeList"
          :props="defaultProps"
          accordion
          node-key="id"
          :default-expanded-keys="[1]"
          highlight-current
          @node-click="handleClick">
        </el-tree>
      </div>
      <div class="rg-wrap">
        <ul class="nav">
          <li :class="{active: form.allocation_type === 1}" @click="changeType(1)">按公众号</li>
          <li :class="{active: form.allocation_type === 2}" @click="changeType(2)">按地理位置</li>
        </ul>
        <el-transfer
          v-if="form.allocation_type === 1"
          class="el-transfer"
          v-model="value"
          :props="{
            key: 'id',
            label: 'signature'
          }"
          :titles="transferList.signature"
          :data="transferList"
          @change="transferChange">
        </el-transfer>
        <el-tree
          ref="region"
          class="region-wrap"
          v-else
          :data="regionList"
          :props="defaultProps"
          show-checkbox
          accordion
          node-key="id"
          :default-checked-keys="regionDefaultKeys"
          @check="handleCheckChange">
        </el-tree>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      disable: true,
      btnType: 'primary', // danger
      selectList: {},
      treeList: [],
      regionList: [],
      regionDefaultKeys: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      transferList: [],
      value: [],
      form: {
        id: 0,
        is_department: 0,
        allocation_type: 1,
        allocation_value: ''
      }
    }
  },
  created () {
    this.getUserSetting()
  },
  methods: {
    /**
     * 获取系统设置
     */
    getUserSetting () {
      this.$http.post('/getUserSetting').then(res => {
        let modeValue = res.data.basic_setting.mode_value
        if (modeValue === 4) {
          this.disable = false
          this.getInfo()
          this.getRegion()
        } else {
          this.disable = true
        }
      })
    },
    /**
     * 获取左侧数据
     */
    getInfo () {
      this.$http.post('/get_senior_info').then(res => {
        this.treeList = res.data
        this.form.id = res.data[0].id
        this.form.is_department = res.data[0].is_department
        this.isDepartment(res.data[0], res.data[0].is_department)
      })
    },
    /**
     * 判断是否客服/部门 获取穿梭列表左侧数据
     */
    isDepartment (list, v) {
      console.log('当前list: ', list)
      this.transferList = []
      this.getSelectSetting(list, v)
      if (v) { // 是部门
        console.log('部门，获取公众号')
        this.getWxAccount(list, v)
      } else {
        console.log('客服 是否有公众号', list.weixin_official_account)
        if (list.weixin_official_account) {
          this.transferList.push({
            is_department: list.is_department,
            signature: list.weixin_account,
            id: list.id
          })
        }
        console.log('this.transferList: ', this.transferList)
      }
    },
    /**
     * 部门 获取 穿梭列表左侧数据 微信公众号
     */
    getWxAccount (list, v) {
      this.$http.post('/get_weixin_account', {
        id: list.id,
        is_department: v
      }).then(res => {
        this.transferList = res.data
        console.log('获取公众号', res.data)
      })
    },
    /**
     * 获取 穿梭列表右侧数据 微信公众号
     */
    getSelectSetting (list, v) {
      this.value = []
      this.$http.post('/get_session_senior_setting', {
        id: list.id,
        is_department: v
      }).then(res => {
        if (res.data !== null) {
          res.data.forEach(item => {
            this.value.push(item.id)
          })
        }
        console.log('获取右侧公众号', res.data)
      })
    },
    /**
     * 获取省份
     */
    getRegion () {
      this.$http.post('/get_region').then(res => {
        this.regionList = res.data
        console.log('获取省市数据', res.data)
      })
    },
    /**
     * 公众号 列表移动
     */
    transferChange (value) {
      this.form.allocation_value = ''
      value.map(item => {
        this.form.allocation_value += item += ','
      })
      console.log(this.form)
      this.$http.post('/set_session_senior_setting', this.form).then(res => {
        console.log('公众号 列表移动: ', res.data)
      })
    },
    /**
     * 左侧树形图选择
     */
    handleClick (node, ev) {
      this.form.id = node.id
      this.form.allocation_type = 1
      this.$refs.region.setCheckedKeys([]) // 地理位置选择为空
      console.log('handleClick', node, ev)
      if (node.children) {
        console.log('父级')
        this.isDepartment(node.children, node.is_department)
      } else {
        this.isDepartment(node, node.is_department)
        console.log('子级')
      }
    },
    /**
     * 地理位置check
     */
    handleCheckChange (data, checked) {
      this.form.allocation_value = ''
      let checkedList = checked.checkedNodes
      checkedList.map((item, index) => {
        if (!item.children) {
          this.form.allocation_value += item.id += ','
        }
      })
      console.log(this.form)
      // console.log(this.$refs.region.getCheckedNodes())
    },
    getCheckedNodes () {

    },
    changeType (v) {
      this.form.allocation_type = v
    }

  }
}
</script>

<style lang="less" scoped>
  .rule-advanced {
    height: 100%;
    .top {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      border-bottom: 1px solid @border-color;
      .tip {
        color: @color-red;
        margin-left: 20px;
      }
    }
    .content-wrap {
      display: flex;
      height: 85%;
      position: relative;
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
        background: rgba(255, 255, 255, .5);
      }
      .transfer-wrap {
        width: 250px;
        border-right: 1px solid @border-color;
      }
      .rg-wrap {
        flex: 1;
        .nav {
          border-bottom: 1px solid @border-color;
          li {
            display: inline-block;
            cursor: pointer;
            padding: 8px 22px;
            &.active {
              border-bottom: 2px solid #2483f3;
            }
          }
        }
        .el-transfer {
          height: 100%;
        }
        .region-wrap {
          height: 370px;
          overflow-y: scroll;
        }
      }
    }
  }
</style>

<style lang="less">
  .rule-advanced {
    .el-transfer-panel {
      width: 160px;
      border: none;
      height: 100%;
      border-left: 1px solid @border-color;
      border-right: 1px solid @border-color;
      position: relative;
      left: -1px;
      border-radius: 0;
      .el-transfer-panel__header {
        background: none;
        border: none;
      }
    }
    .el-transfer__buttons {
      padding: 0 15px;
    } 
    .el-transfer-panel__list {
      height: 335px;
    }
  }
</style>
