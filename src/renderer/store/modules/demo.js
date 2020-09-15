const state = {
  main: 0,
  init: {}
}

const actions = {
  DEMO (context, params) {
    // 这里所有操作无效，除了commit
    console.log('3. action - commit => mutations')
    context.commit('DEMO', params)
  }
}

const mutations = {
  DEMO (state, params) {
    console.log('3. action - commit => mutations')
    console.log('4. 改变state,页面重新渲染')
    state.init = params
  }
}

export default {
  state,
  actions,
  mutations
}
