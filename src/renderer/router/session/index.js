export default [
  {
    path: '/session',
    name: 'sessionIndex',
    component: resolve => require(['@/views/session'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: true,
      rowRightShow: true
    }
  }, {
    path: '/session/new',
    name: 'sessionNew',
    component: require('@/views/session/new').default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/chooseKf',
    name: 'sessionChooseKf',
    component: resolve => require(['@/components/session/chooseKf'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/setVisitorTag',
    name: 'sessionSetVisitorTag',
    component: resolve => require(['@/components/session/setVisitorTag'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/createInvite',
    name: 'sessionCreateInvite',
    component: resolve => require(['@/components/session/createInvite'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/setWeChatGroup',
    name: 'sessionSetWeChatGroup',
    component: resolve => require(['@/components/session/setWeChatGroup'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/userInfo',
    name: 'sessionUserInfo',
    component: resolve => require(['@/components/session/userInfo'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/createLink',
    name: 'sessionUserInfo',
    component: require('@/components/session/createLink').default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/recordAudio',
    name: 'sessionRecordAudio',
    component: resolve => require(['@/components/session/recordAudio'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/playVideo',
    name: 'sessionPlayVideo',
    component: resolve => require(['@/components/session/playVideo'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/transfer',
    name: 'sessionTransfer',
    component: resolve => require(['@/components/session/transfer'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/cooperation',
    name: 'sessionCooperation',
    component: resolve => require(['@/components/session/cooperation'], resolve).default,
    meta: {
      pageType: 'session',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/shortcut',
    name: 'shortcutCapture',
    component: resolve => require(['@/components/shortcutCapture/index'], resolve).default,
    meta: {
      pageType: 'shortcut',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/editQuickReply',
    name: 'editQuickReply',
    component: resolve => require(['@/components/session/editQuickReply/index'], resolve).default,
    meta: {
      pageType: 'editQuickReply',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/editQuickReply/createReply',
    name: 'editQuickReply',
    component: resolve => require(['@/components/session/editQuickReply/createReply'], resolve).default,
    meta: {
      pageType: 'editQuickReply',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/editQuickReply/createGroup',
    name: 'editQuickReply',
    component: resolve => require(['@/components/session/editQuickReply/createGroup'], resolve).default,
    meta: {
      pageType: 'editQuickReply',
      rowLeftShow: false,
      rowRightShow: false
    }
  }, {
    path: '/session/editQuickReply/moveReplay',
    name: 'editQuickReply',
    component: resolve => require(['@/components/session/editQuickReply/moveReplay'], resolve).default,
    meta: {
      pageType: 'editQuickReply',
      rowLeftShow: false,
      rowRightShow: false
    }
  }
]
