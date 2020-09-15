export default [
  {
    path: '/',
    redirect: '/home',
    meta: {
      pageType: 'home',
      rowLeftShow: true,
      rowRightShow: true
    }
  }, {
    path: '/home',
    name: 'home',
    component: resolve => require(['@/views/home/index'], resolve).default,
    meta: {
      pageType: 'home',
      rowLeftShow: true,
      rowRightShow: true
    }
  }
]
