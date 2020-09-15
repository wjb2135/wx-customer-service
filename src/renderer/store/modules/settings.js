const state = {
  closeMsgSound: false // 是否关闭消息提示声
}

const actions = {
  setCloseMsgSound ({
    commit
  }, params) {
    commit('set_closeMsgSound', params)
  },
  clearAllSettingsState ({
    commit
  }, params) {
    commit('clearAllSettingsState', params)
  }
}

const mutations = {
  set_closeMsgSound (state, params) {
    state.closeMsgSound = params
  },
  clearAllSettingsState (state, params) {
    state.closeMsgSound = false
  }
}

const getters = {
  closeMsgSound: state => state.closeMsgSound
}

export default {
  state,
  actions,
  mutations,
  getters
}
