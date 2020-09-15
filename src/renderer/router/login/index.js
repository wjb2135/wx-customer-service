export default [
  {
    path: '/login',
    name: 'login',
    component: resolve => require(['@/views/login/index'], resolve).default,
    meta: {
      pageType: 'login',
      rowLeftShow: false,
      rowRightShow: false
    }
  }
]
