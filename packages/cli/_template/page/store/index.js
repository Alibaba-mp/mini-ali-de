import { createLogger, createSetDataLogger } from '@ali/de-core-plugins';
import { Store } from '@ali/de-core';

export default new Store({
  state: { message: 'New Page' },
  mutations: {},
  actions: {},
  plugins: [createLogger(), createSetDataLogger()],
});
