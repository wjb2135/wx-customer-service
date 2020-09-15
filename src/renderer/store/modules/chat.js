const state = {
  moniterMessage: '', // 轮询消息
  moniterClient: '', // 轮询带接待
  needRefreshShList: false, // 是否刷新聊天用户列表
  hasNewClient: false, // 是否有新到访客
  defaultExpandedKeys: '', // 默认展开的客户列表
  newAddCooperationCustomService: '', // 新增协作成员
  cooperationCustomService: '', // 协作成员
  activeReplyIds: '',
  nowUser: '',
  fastreplyGroup: '', // 快捷短语
  ossUrl: '' // 视频播放地址
}

const actions = {
  setMoniterMessage ({commit}, params) {
    commit('set_moniterMessage', params)
  },
  setMoniterClient ({commit}, params) {
    commit('set_moniterClient', params)
  },
  setNeedRefreshShList ({commit}, params) {
    commit('set_needRefreshShList', params)
  },
  setHasNewClient ({commit}, params) {
    commit('set_hasNewClient', params)
  },
  setDefaultExpandedKeys ({commit}, params) {
    commit('set_defaultExpandedKeys', params)
  },
  setNewAddCooperationCustomService ({commit}, params) {
    commit('set_newAddCooperationCustomService', params)
  },
  setCooperationCustomService ({commit}, params) {
    commit('set_cooperationCustomService', params)
  },
  setActiveReplyIds ({commit}, params) {
    commit('set_activeReplyIds', params)
  },
  setNowUser ({commit}, params) {
    commit('set_nowUser', params)
  },
  setFastreplyGroup ({commit}, params) {
    commit('set_fastreplyGroup', params)
  },
  setKnowledgeGroup ({commit}, params) {
    commit('set_knowledgeGroup', params)
  },
  setOssUrl ({commit}, params) {
    commit('set_ossUrl', params)
  },
  clearAllChatState ({
    commit
  }, params) {
    commit('clearAllChatState', params)
  }
}

const mutations = {
  set_moniterMessage (state, params) {
    state.moniterMessage = params
  },
  set_moniterClient (state, params) {
    state.moniterClient = params
  },
  set_needRefreshShList (state, params) {
    state.needRefreshShList = params
  },
  set_hasNewClient (state, params) {
    state.hasNewClient = params
  },
  set_defaultExpandedKeys (state, params) {
    state.defaultExpandedKeys = params
  },
  set_newAddCooperationCustomService (state, params) {
    state.newAddCooperationCustomService = params
  },
  set_cooperationCustomService (state, params) {
    state.cooperationCustomService = params
  },
  set_activeReplyIds (state, params) {
    state.cooperationCustomService = params
  },
  set_nowUser (state, params) {
    state.nowUser = params
  },
  set_fastreplyGroup (state, params) {
    state.fastreplyGroup = params
  },
  set_knowledgeGroup (state, params) {
    state.knowledgeGroup = params
  },
  set_ossUrl (state, params) {
    state.ossUrl = params
  },
  clearAllChatState (state, params) {
    state.moniterMessage = ''
    state.moniterClient = ''
    state.needRefreshShList = ''
    state.hasNewClient = ''
    state.defaultExpandedKeys = ''
    state.newAddCooperationCustomService = ''
    state.cooperationCustomService = ''
    state.activeReplyIds = ''
    state.nowUser = ''
    state.fastreplyGroup = ''
    state.knowledgeGroup = ''
  }
}

const getters = {
  moniterMessage: state => state.moniterMessage,
  moniterClient: state => state.moniterClient,
  needRefreshShList: state => state.needRefreshShList,
  hasNewClient: state => state.hasNewClient,
  defaultExpandedKeys: state => state.defaultExpandedKeys,
  newAddCooperationCustomService: state => state.newAddCooperationCustomService,
  cooperationCustomService: state => state.cooperationCustomService,
  activeReplyIds: state => state.activeReplyIds,
  nowUser: state => state.nowUser,
  fastreplyGroup: state => state.fastreplyGroup,
  knowledgeGroup: state => state.knowledgeGroup,
  ossUrl: state => state.ossUrl
}

export default {
  state,
  actions,
  mutations,
  getters
}
