<template>
  <div>
    <header>
      <slot name="header"></slot>
      <slot name="nav"></slot>
    </header>
    <main class="content-wrap">
      <div>
        <slot name="left"></slot>
      </div>
      <slot>
        <router-view></router-view>
      </slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
<script>

export default {
  name: 'mainFrame'
}
</script>
<style lang="less" scoped>
  .content-wrap {
    display: flex;
  }
</style>