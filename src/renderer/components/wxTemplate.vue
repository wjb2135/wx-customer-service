<template>
  <div>
    <div class="title">{{template.title}}</div>
    <p v-for="(key, value) in templateContent" :key="value">
      <span v-if="key">{{key}}: </span>
      <span v-else>{{key}}</span>
      <span v-if="list.content[value] && list.content[value].color" :style="{color: list.content[value].color}">{{list.content[value] && list.content[value].value}}</span>
      <span v-else>{{list.content[value] && list.content[value].value}}</span>
    </p>
  </div>
</template>

<script>

export default {
  props: {
    list: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      template: this.list.weixin_template || this.list.template
    }
  },
  computed: {
    templateContent () {
      let con = {}
      if ('content' in this.template) {
        con = this.template.content
      } else {
        con = this.template
      }
      return con
    }
  }
}
</script>

<style lang="less" scoped>
  .title {
    margin-bottom: 10px;
  }
  p {
    min-height: 20px;
    span {
      display: inline-block;
      vertical-align: top;
      &:first-of-type {
        min-width: 80px;
      }
    }
  }
</style>