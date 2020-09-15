const state = {
  sysConfig: '', // 应用初始化信息
  appUpgrade: '',
  customSetting: ''
}

const actions = {
  setSysConfig ({commit}, params) {
    commit('set_sysConfig', params)
  },
  setAppUpgrade ({commit}, params) {
    commit('set_appUpgrade', params)
  },
  setCustomSetting ({commit}, params) {
    commit('set_customSetting', params)
  },
  clearAllAppState ({
    commit
  }, params) {
    commit('clearAllAppState', params)
  }
}

const mutations = {
  set_sysConfig (state, params) {
    state.sysConfig = params
  },
  set_appUpgrade (state, params) {
    state.appUpgrade = params
  },
  set_customSetting (state, params) {
    state.customSetting = params
  },
  clearAllAppState (state, params) {
    state.sysConfig = ''
    state.appUpgrade = ''
    state.customSetting = ''
  }
}

const getters = {
  sysConfig: state => state.sysConfig,
  appUpgrade: state => state.appUpgrade,
  customSetting: state => state.customSetting
}

export default {
  state,
  actions,
  mutations,
  getters
}
