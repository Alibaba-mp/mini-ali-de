import { createLogger, createSetDataLogger, Store } from 'mini-ali-de';

export default new Store({
  state: {
    message: 'init',
    loading: false,
  },
  mutations: {
    updateMessage(state, msg) {
      state.message = msg;
    },
  },
  actions: {
    handleOk({ commit }) {
      commit({ loading: true });
      setTimeout(() => {
        commit('updateMessage', 'updated');
        commit({ loading: false });
      }, 1000);
    },
  },
  // 开发环境调试日志插件，上线时一般会注释掉
  plugins: [createLogger(), createSetDataLogger()],
});
