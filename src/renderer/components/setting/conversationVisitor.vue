<template>
  <div class="visitor-setting-wrap">
    <div class="header">
      <div>
        <el-button type="primary" size="mini">添加标签分组</el-button>
      </div>
      <div>
        <el-button type="primary" size="mini">下载标签模板</el-button>
        <el-button type="primary" size="mini">导入</el-button>
        <el-button type="primary" size="mini">导出</el-button>
      </div>
    </div>
    <div class="content">
      <div class="left-wrap"></div>
      <div class="right-wrap">
        <div class="header">
          <div class="title">编辑分组信息</div>
          <div>
            <el-button size="mini" round>添加组内标签</el-button>
            <el-button size="mini" round>删除分组</el-button>
          </div>
        </div>
        <div class="form">
          <input type="text" placeholder="请输入分组名称">
          <textarea placeholder="请输入分组备注"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
  .visitor-setting-wrap {
    width: 100%;
    .header {
      border-bottom: 1px solid @border-color;
      display: flex;
      padding: 10px 16px;
      > div {
        &:nth-child(1) {
          flex: 1;
        }
      }
    }
    .content {
      display: flex;
      height: 100%;
      .left-wrap {
        width: 250px;
        border-right: 1px solid @border-color;
      }
      .right-wrap {
        flex: 1;
        .header {
          align-items: center;
          display: flex;
          .title {
            flex: 1;
          }
        }
        .form {
          padding: 10px 16px;
          input, textarea {
            border: none;
            background: #f7f9f9;
            margin-bottom: 10px;
            display: block;
            width: 100%;
            padding: 10px;
            &::placeholder {
              color: @color-text-placeholder;
            }
          }
          textarea {
            height: 110px;
            resize: none;
          }
        }
      }
    }
  }
</style>