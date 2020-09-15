export default [
  {
    path: '/setting',
    name: 'setting',
    component: resolve => require(['@/views/setting/index'], resolve).default,
    meta: {
      pageType: 'setting',
      rowLeftShow: false,
      rowRightShow: false
    },
    children: [{
      path: 'personal',
      name: 'personal',
      component: resolve => require(['@/views/setting/personal'], resolve).default,
      meta: {
        pageType: 'setting',
        rowLeftShow: false,
        rowRightShow: false
      }
    },
    {
      path: 'conversation',
      name: 'conversation',
      component: resolve => require(['@/views/setting/conversation'], resolve).default,
      meta: {
        pageType: 'setting',
        rowLeftShow: false,
        rowRightShow: false
      }
    },
    {
      path: 'basic',
      name: 'basic',
      component: resolve => require(['@/views/setting/basic'], resolve).default,
      meta: {
        pageType: 'setting',
        rowLeftShow: false,
        rowRightShow: false
      }
    },
    {
      path: 'security',
      name: 'security',
      component: resolve => require(['@/views/setting/security'], resolve).default,
      meta: {
        pageType: 'setting',
        rowLeftShow: false,
        rowRightShow: false
      }
    }
    ]
  },
  {
    path: '/setting/template',
    name: 'template',
    component: resolve => require(['@/views/setting/template'], resolve).default,
    meta: {
      pageType: 'setting',
      rowLeftShow: false,
      rowRightShow: false,
      hidden: true
    }
  }, {
    path: '/setting/editTemplate',
    name: 'editTemplate',
    component: resolve => require(['@/views/setting/editTemplate'], resolve).default,
    meta: {
      pageType: 'setting',
      rowLeftShow: false,
      rowRightShow: false,
      hidden: true
    }
  }
]
