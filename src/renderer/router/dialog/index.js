export default [
  {
    path: '/dialog/service',
    name: 'serviceDialog',
    component: require('@/components/serviceDialog').default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/media',
    name: 'mediaDialog',
    component: resolve => require(['@/components/mediaDialog'], resolve).default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/invite',
    name: 'inviteDialog',
    component: resolve => require(['@/components/inviteDialog'], resolve).default,
    meta: {
      pageType: 'invite',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/filter',
    name: 'filterDialog',
    component: resolve => require(['@/components/filterDialog'], resolve).default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/reason',
    name: 'reasonDialog',
    component: require('@/components/reasonDialog').default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/suggestion',
    name: 'suggestionDialog',
    component: resolve => require(['@/components/suggestionDialog'], resolve).default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/dialog/logout',
    name: 'logoutDialog',
    component: resolve => require(['@/components/logoutDialog'], resolve).default,
    meta: {
      rowLeftShow: false,
      rowRightShow: false
    }
  }
]
