export default[
  {
    path: '/invite',
    name: 'invite',
    component: resolve => require(['@/views/invite/index'], resolve).default,
    meta: {
      pageType: 'invite',
      rowLeftShow: true,
      rowTopShow: true,
      rowRightShow: true
    }
  }, {
    path: '/invite/task',
    name: 'inviteTask',
    component: resolve => require(['@/views/invite/batch/inc/task'], resolve).default,
    meta: {
      pageType: 'invite',
      rowLeftShow: false,
      rowTopShow: false,
      rowRightShow: false
    }
  }
]
