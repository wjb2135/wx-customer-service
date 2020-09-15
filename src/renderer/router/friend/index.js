export default [
  {
    path: '/friend',
    name: 'friend',
    component: resolve => require(['@/views/friend/index'], resolve).default,
    meta: {
      pageType: 'friend',
      rowLeftShow: true,
      rowRightShow: true
    }
  }
]
