export default[
  {
    path: '/history',
    name: 'history',
    component: resolve => require(['@/views/history/index'], resolve).default,
    meta: {
      pageType: 'history',
      rowLeftShow: true,
      rowRightShow: true
    }
  }
]
