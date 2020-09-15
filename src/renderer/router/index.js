import Vue from 'vue'
import Router from 'vue-router'
import login from './login/index'

import home from './home/index' // 首页
import session from './session/index' // 会话
import history from './history/index' // 历史记录
import friend from './friend/index' // 好友对话
import visitor from './visitor/index' // 访客管理
import crm from './crm/index' // CRM
import invite from './invite/index' // 邀请管理
import monitor from './monitor/index' // 会话监控
import setting from './setting/index' // 设置
import dialog from './dialog/index'
import about from './about/index'

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/setPwd',
      name: 'setPwd',
      component: resolve => require(['@/components/setPwd'], resolve).default,
      meta: {
        rowLeftShow: false,
        rowRightShow: false
      }
    },
    {
      path: '/user',
      name: 'user',
      component: resolve => require(['@/views/user/index'], resolve).default,
      meta: {
        rowLeftShow: false,
        rowRightShow: false
      }
    },
    {
      path: '*',
      redirect: '/'
    },
    ...dialog,
    ...monitor,
    ...setting,
    ...session,
    ...crm,
    ...history,
    ...friend,
    ...login,
    ...home,
    ...visitor,
    ...invite,
    ...about
  ]
})

// router.beforeEach((to, from, next) => {
//   const code = +localStorage.getItem('code')
//   if (code) { // 本地是否有code，1 未登录，0 登录
//     next({path: '/login'})
//   } else {
//     if (to.meta.isLoginPage) { // 判断是否在登录页
//       next({path: '/'})
//     } else {
//       next()
//     }
//   }
// })
export default router
