export default[
  {
    path: '/about',
    name: 'about',
    component: resolve => require(['@/views/about/index'], resolve).default,
    meta: {
      pageType: 'user',
      rowLeftShow: false,
      rowRightShow: false
    }
  }
]
