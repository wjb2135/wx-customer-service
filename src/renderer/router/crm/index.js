export default [
  {
    path: '/crm',
    name: 'crm',
    component: resolve => require(['@/views/crm/index'], resolve).default,
    meta: {
      pageType: 'crm',
      rowLeftShow: true,
      rowRightShow: true
    }
  }, {
    path: '/crm/collect',
    name: 'crmCollect',
    component: resolve => require(['@/views/crm/inc/collect'], resolve).default,
    meta: {
      pageType: 'crm',
      rowLeftShow: false,
      rowRightShow: false
    }
  }
]
