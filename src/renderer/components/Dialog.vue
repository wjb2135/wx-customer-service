<template>
  <div class="dialog__wrapper">
    <div
      role="dialog"
      aria-modal="true"
      :aria-label="title || 'dialog'"
      class="dialog"
      :class="[customClass]"
      ref="dialog"
      :style="style">
      <div class="dialog__header drag">
        <slot name="title">
          <span class="dialog__title">{{ title }}</span>
        </slot>
        <button
          type="button"
          class="dialog__headerbtn no-drag"
          aria-label="Close"
          v-if="showClose"
          @click="handleClose">
          <i class="icon iconfont icon-close">&#xe69a;</i>
        </button>
      </div>
      <div class="dialog__body"><slot></slot></div>
      <div class="dialog__footer" v-if="$slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Dialog',
    props: {
      title: {
        type: String,
        default: ''
      },
      showClose: {
        type: Boolean,
        default: true
      },
      width: String,
      fullscreen: Boolean,
      customClass: {
        type: String,
        default: ''
      },
      beforeClose: Function
    },
    computed: {
      style () {
        let style = {};
        if (!this.fullscreen) {
          // style.marginTop = this.top;
          if (this.width) {
            style.width = this.width;
          }
        }
        return style;
      }
    },

    methods: {
      handleClose () {
        if (typeof this.beforeClose === 'function') {
          this.beforeClose(this.hide);
        } else {
          this.hide();
        }
      },
      hide (cancel) {
        if (cancel !== false) {
          this.$Win.closeWin();
        }
      }
    }
  };
</script>


<style lang="less" scoped>
  .dialog__wrapper {
    background: #fff;
    height: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
  }
  .dialog {
    display: flex;
    flex-direction: column;
    height: 100%;
    .dialog__header {
      height: 40px;
      background-color: @color-primary;
      color: #fff;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .dialog__body {
      padding: 15px;
      background-color: #fff;
      height: 100%;
      flex-shrink: 1;
      overflow: hidden;
      overflow-y: auto;
    }
    .dialog__footer {
      flex-shrink: 0;
      width: 100%;
      height: 50px;
      padding: 10px 15px;
      text-align: right;
      background-color: #fff;
      border-top: 1px solid @border-color;
      overflow: hidden;
    }
    .dialog__headerbtn {
      background: none;
      border: 0;
      cursor: pointer;
      color: #bad4ff;
    }
  }
</style>
