const state = {
  _TOKEN: '', // 登录凭证
  baseUserInfo: '', // 登录用户信息
  encrptyKey: '', // 加密KEY
  windowChangeLoading: false, // 窗口切换的时候隐藏界面
  logoutStatus: 0
}

const actions = {
  setToken ({commit}, params) {
    commit('set_TOKEN', params)
  },
  setBaseUserInfo ({commit}, params) {
    commit('set_baseUserInfo', params)
  },
  setEncrptyKey ({commit}, params) {
    commit('set_encrptyKey', params)
  },
  onlineStatus ({commit}, params) {
    commit('online_status', params)
  },
  timeSetting ({commit}, params) {
    commit('time_setting', params)
  },
  windowChangeLoading ({commit}, params) {
    commit('window_change_loading', params)
  },
  logoutStatus ({commit}, params) {
    commit('logout_status', params)
  }
}

const mutations = {
  set_TOKEN (state, params) {
    state._TOKEN = params
    console.log(params)
  },
  set_baseUserInfo (state, params) {
    state.baseUserInfo = params
  },
  set_encrptyKey (state, params) {
    state.setEncrptyKey = params
  },
  online_status (state, params) {
    state.baseUserInfo.online_status = params
  },
  time_setting (state, params) {
    state.baseUserInfo.moniter_time = params
  },
  window_change_loading (state, params) {
    state.windowChangeLoading = params
  },
  logout_status (state, params) {
    state.logoutStatus = params
  }
}

const getters = {
  _TOKEN: state => state._TOKEN,
  baseUserInfo: state => state.baseUserInfo,
  encrptyKey: state => state.encrptyKey
}

export default {
  state,
  actions,
  mutations,
  getters
}
