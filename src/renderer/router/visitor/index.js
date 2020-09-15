export default[
  {
    path: '/visitor',
    name: 'visitor',
    component: resolve => require(['@/views/visitor/index'], resolve).default,
    meta: {
      pageType: 'visitor',
      rowLeftShow: true,
      rowRightShow: true
    }
  }
]
