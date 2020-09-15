const state = {
  visitorUserList: [],
  audio: null,
  newUser: null,
  hasCreatedSessionWin: false,
  inviteFormChat: {
    id: '',
    type: 'text',
    content: '',
    data: {}
  },
  inviteUserList: []
}

const actions = {
  setNewUser ({commit}, params) {
    commit('set_new_user', params)
  },
  setVisitorUserList ({commit}, params) {
    commit('set_visitor_user_list', params)
  },
  setAudio ({commit}, params) {
    commit('set_audio', params)
  },
  setHasCreatedSessionWin ({commit}, params) {
    commit('set_has_created_session_win', params)
  },
  setInviteFormChat ({commit}, params) {
    commit('set_invite_form_chat', params)
  },
  setInviteUserList ({commit}, params) {
    commit('set_invite_user_list', params)
  },
  clearAllVisitorState ({
    commit
  }, params) {
    commit('clearAllChatState', params)
  }
}

const mutations = {
  set_new_user (state, params) {
    state.newUser = params
  },
  set_visitor_user_list (state, params) {
    state.visitorUserList = params
  },
  set_audio (state, params) {
    state.audio = params
  },
  set_has_created_session_win (state, params) {
    state.hasCreatedSessionWin = params
  },
  set_invite_form_chat (state, params) {
    state.inviteFormChat = params
  },
  set_invite_user_list (state, params) {
    state.inviteUserList = params
  },
  clearAllVisitorState (state, params) {
    state.visitorUserList = ''
    state.audio = ''
    state.newUser = ''
    state.hasCreatedSessionWin = ''
    state.inviteFormChat = {
      id: '',
      type: 'text',
      content: '',
      data: {}
    }
    state.inviteUserList = []
  }
}

const getters = {
  visitorUserList: state => state.visitorUserList,
  audio: state => state.audio,
  newUser: state => state.newUser,
  hasCreatedSessionWin: state => state.hasCreatedSessionWin,
  inviteFormChat: state => state.inviteFormChat,
  inviteUserList: state => state.inviteUserList
}

export default {
  state,
  actions,
  mutations,
  getters
}
