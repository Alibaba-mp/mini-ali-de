import { expect } from 'chai';
import { Store } from '..';

const genModule = () => ({
  state: { items: [] },
  mutations: {
    add({ items }, { value }) {
      items.unshift({ value });
    }
  },
  actions: {
    add({ commit }, payload) {
      commit('add', payload);
    }
  },
  getters: {
    itemsLen(state) {
      return state.items.length;
    },
    getItemByValue: state => value => {
      return state.items.filter(todo => todo.value === value);
    }
  }
});

describe('store-getters', () => {
  it(`get property's value`, () => {
    const store = new Store(genModule());
    store.commit('add', { value: 'learn de' });

    expect(store.getters.itemsLen).to.be.equal(1);
  });

  it('get value by call function', () => {
    const store = new Store(genModule());
    store.commit('add', { value: 'learn de' });

    const item = store.getters.getItemByValue('learn de');
    expect(item.length).to.be.equal(1);
    expect(item).to.be.eql([{ value: 'learn de' }]);
  });

  it('get submodule getters value by store.getters["moduleA/itemsALen"]', () => {
    const moduleA = {
      state: {
        itemsA: []
      },
      mutations: {
        add({ itemsA }, { value }) {
          itemsA.unshift({ text: value + '@moduleA' });
        }
      },
      getters: {
        itemsALen(state) {
          return state.itemsA.length;
        },
        itemsCountLen(state, getters, rootState, rootGetters) {
          return getters.itemsALen + rootGetters.itemsLen;
        }
      }
    };
    const module = genModule();
    module.modules = { moduleA };
    const store = new Store(module);
    store.commit('moduleA/add', { value: 'submodule getters1' });
    store.commit('moduleA/add', { value: 'submodule getters2' });

    const itemsALen = store.getters['moduleA/itemsALen'];
    expect(itemsALen).to.be.equal(2);
  });

  it('get submodule getters value by store.getters.moduleA.itemsLen', () => {
    const moduleA = {
      state: {
        itemsA: []
      },
      mutations: {
        add({ itemsA }, { value }) {
          itemsA.unshift({ text: value + '@moduleA' });
        }
      },
      getters: {
        itemsALen(state) {
          return state.itemsA.length;
        },
        itemsCountLen(state, getters, rootState, rootGetters) {
          return getters.itemsALen + rootGetters.itemsLen;
        }
      }
    };
    const module = genModule();
    module.modules = { moduleA };
    const store = new Store(module);
    store.commit('add', { value: 'rootmodule getters' });
    store.commit('moduleA/add', { value: 'submodule getters1' });
    store.commit('moduleA/add', { value: 'submodule getters2' });

    const itemsALen = store.getters['moduleA/itemsALen'];
    const _itemsALen = store.getters.moduleA.itemsALen;
    const itemsCountLen = store.getters['moduleA/itemsCountLen'];
    const _itemsCountLen = store.getters.moduleA.itemsCountLen;
    expect(itemsALen).to.be.equal(2);
    expect(itemsCountLen).to.be.equal(3);
    expect(itemsALen).to.be.equal(_itemsALen);
    expect(itemsCountLen).to.be.equal(_itemsCountLen);
  });

  it('visit modules getters and rootGetters', () => {
    const moduleA = {
      state: {
        itemsA: []
      },
      mutations: {
        add({ itemsA }, { value }) {
          itemsA.unshift({ text: value + '@moduleA' });
        }
      },
      getters: {
        itemsALen(state) {
          return state.itemsA.length;
        },
        visitGetters(state, getters, rootState, rootGetters) {
          expect(getters.itemsALen).to.be.equal(1);
          expect(rootGetters['moduleA/itemsALen']).to.be.equal(1);
          expect(rootGetters.itemsLen).to.be.equal(2);

          expect(state.itemsA.length).to.be.equal(1);
          expect(rootState.moduleA.itemsA.length).to.be.equal(1);
          expect(rootState.items.length).to.be.equal(2);
        }
      },
      actions: {
        add({ dispatch, commit, state, getters, rootState, rootGetters }) {
          expect(getters.itemsALen).to.be.equal(1);
          expect(rootGetters['moduleA/itemsALen']).to.be.equal(1);
          expect(rootGetters.itemsLen).to.be.equal(2);

          expect(state.itemsA.length).to.be.equal(1);
          expect(rootState.moduleA.itemsA.length).to.be.equal(1);
          expect(rootState.items.length).to.be.equal(2);
        }
      }
    };
    const module = genModule();
    module.modules = { moduleA };

    const store = new Store(module);
    store.commit('add', { value: 'learn de' });
    store.dispatch('add', { value: 'learn de-getters' });
    store.commit('moduleA/add', { value: 'submodule getter' });
    store.dispatch('moduleA/add');

    // eslint-disable-next-line
    store.getters['moduleA/visitGetters'];
  });
});
