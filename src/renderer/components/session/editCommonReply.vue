<template>
  <!-- 编辑常用回复语 -->
  <Dialog title="常用回复编辑">
    <div class="edit-common-reply">
      <el-row>
        <el-col :span="8">
          <div class="edit-group">
            <div class="edit-group-hd">
              <span @click="createGroup">新建</span>
              <span>删除</span>
              <span>修改(分组)</span>
            </div>
            <div class="edit-group-bd">
              <div class="title-group">常用回复</div>
              <div class="list-group">
                <div class="item-group" @click="chooseGroup">在忙的时候</div>
                <div class="item-group" @click="chooseGroup">在忙的时候</div>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="16">
          <div class="edit-reply">
            <div class="edit-reply-hd">
              <div class="hd-l">
                <el-button type="info" round>+ 新建</el-button>
              </div>
              <div class="hd-r">
                <span>删除</span>
                <span>修改(分组)</span>
              </div>
            </div>
            <div class="edit-reply-bd">
              <div class="title-reply">常用回复</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </Dialog>
</template>

<script>
export default {
  methods: {
    createGroup () {

    }
  }
}
</script>

<style lang="less" scoped>
  .edit-common-reply {
    height: 100%;
    background-color: #fff;
    margin: -15px;
    .edit-group {
      .edit-group-hd {
        height: 30px;
        display: flex;
        background-color: #fff;
        justify-content: flex-end;
        align-items: center;
        border-bottom: 1px solid @border-color;
        font-size: 12px;
        span {
          color: @color-primary;
          text-decoration: underline;
          margin: 0 7px;
        }
      }
      .title-group {
        background-color: #f7f7f7;
        height: 30px;
        line-height: 30px;
        padding: 0 15px;
      }
      .list-group {
        .item-group {
          height: 30px;
          line-height: 30px;
          padding: 0 15px;
          padding-left: 20px;
          &.active {
            background-color: @color-primary;
            color: #fff;
          }
        }
      }
    }
    .edit-reply {
      .edit-reply-hd {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .hd-l {
          span {

          }
        }
        .hd-r {
          span {
            margin-left: 10px;
            text-decoration: underline;
            color: @color-primary;
          }
        }
      }
    }
  }
</style>
