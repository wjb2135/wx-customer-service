export default [
  {
    path: '/monitor',
    name: 'monitor',
    component: resolve => require(['@/views/monitor/index'], resolve).default,
    meta: {
      pageType: 'monitor',
      rowLeftShow: true,
      rowTopShow: true,
      rowRightShow: true
    }
  }, {
    path: '/monitor/filter',
    name: 'monitorFilter',
    component: resolve => require(['@/views/monitor/filterDialog'], resolve).default,
    meta: {
      pageType: 'monitor'
    }
  }
]
