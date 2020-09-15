export default[
  {
    path: '/user',
    name: 'user',
    component: resolve => require(['@/views/user'], resolve).default,
    meta: {
      pageType: 'user',
      rowLeftShow: true,
      rowRightShow: true
    }
  }
]
