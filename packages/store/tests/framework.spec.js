import { expect } from 'chai';
import produce from 'immer';
import { Store } from '..';

// process.on('unhandledRejection', () => {
//   // TODO
// });

describe('framework', () => {
  const defaultGlobalState = { count: 0 };
  const defaultModuleAState = { countA: 0 };
  const genModule = () => ({
    state: defaultGlobalState,
    mutations: {
      add(state, { value }) {
        state.count += value;
      }
    },
    actions: {
      add({ commit }, payload) {
        commit('add', payload);
      }
    },
    modules: {
      moduleA: {
        state: defaultModuleAState,
        mutations: {
          add(state, { value }) {
            state.countA += value;
          }
        },
        actions: {
          add({ commit }, payload) {
            commit('add', payload);
          },
          addRoot({ commit }, payload) {
            commit('add', payload, { root: true });
          }
        }
      }
    }
  });

  it('new Store to store instance', () => {
    expect(() => new Store(genModule())).to.not.throw(Error);

    const store = new Store(genModule());
    ['getState', 'commit', 'dispatch'].forEach(item =>
      expect(store).to.have.property(item)
    );
    expect(store.state).to.be.an('object');
  });

  it('commit、 dispatch、unsubscribe call accurately', () => {
    const store = new Store(genModule());

    const dispatchUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.count).to.be.equal(0);
        expect(nextState.count).to.be.equal(1);
      }
    );
    store.dispatch('add', { value: 1 });
    dispatchUnsubscribe();

    const commitUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.count).to.be.equal(1);
        expect(nextState.count).to.be.equal(3);
      }
    );
    store.commit('add', { value: 2 });
    commitUnsubscribe();
  });

  it('commit with a meta', () => {
    const store = new Store(genModule());
    const commitUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(mutation.meta).to.be.eql({ log: true });
      }
    );
    store.commit('add', { value: 1 }, { meta: { log: true } });
    commitUnsubscribe();
  });

  it('commit by a object', () => {
    const store = new Store(genModule());
    const commitUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(mutation.type).to.be.eql('add');
        expect(mutation.payload).to.be.eql({ value: 1 });
      }
    );
    store.commit({ type: 'add', value: 1 });
    commitUnsubscribe();
  });

  it('commit/commit root without type', () => {
    const store = new Store({
      state: defaultGlobalState,
      mutations: {
        add(state, { value }) {
          state.count += value;
        }
      },
      actions: {
        add({ commit }, payload) {
          commit('add', payload);
        }
      },
      modules: {
        moduleA: {
          state: defaultModuleAState,
          mutations: {
            add(state, { value }) {
              state.countA += value;
            }
          },
          actions: {
            add({ commit }, payload) {
              commit(payload);
            },
            addRoot({ commit }, payload) {
              commit(payload, { root: true });
            }
          }
        }
      }
    });
    let i = 0;
    const commitUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        if (i === 0) {
          expect(mutation.type).to.be.eql('@@DeUpdateView');
          expect(mutation.payload).to.be.eql({ value: 1 });
        }
        if (i === 1) {
          expect(mutation.type).to.be.eql('moduleA/@@DeUpdateView');
          expect(mutation.payload).to.be.eql({ value: 2 });
        }
        if (i === 2) {
          expect(mutation.type).to.be.eql('@@DeUpdateView');
          expect(mutation.payload).to.be.eql({ value: 3 });
        }
        i++;
      }
    );
    store.commit({ value: 1 });
    store.dispatch('moduleA/add', { value: 2 });
    store.dispatch('moduleA/addRoot', { value: 3 });

    expect(i).to.be.eql(3);
    commitUnsubscribe();
  });

  it('dispatch by a object', () => {
    const store = new Store(genModule());
    const dispatchUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(mutation.type).to.be.eql('add');
        expect(mutation.payload).to.be.eql({ value: 2 });
      }
    );
    store.dispatch({ type: 'add', value: 2 });
    dispatchUnsubscribe();
  });

  it('subscribe callback arguments', () => {
    const store = new Store(genModule());

    const unsubscribe = store.subscribe((mutation, nextState, prevState) => {
      expect(mutation.type).to.be.equal('add');
      expect(mutation.payload).to.be.eql({ value: 1 });
    });
    store.dispatch('add', { value: 1 });
    unsubscribe();
  });

  it('dispatch subModule', () => {
    const store = new Store(genModule());
    const subModuleUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.moduleA.countA).to.be.equal(0);
        expect(nextState.moduleA.countA).to.be.equal(3);
      }
    );
    store.dispatch('moduleA/add', { value: 3 });
    subModuleUnsubscribe();
  });

  it('dispatch subModule by root=true', () => {
    const store = new Store(genModule());
    const addRootUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.count).to.be.equal(0);
        expect(nextState.count).to.be.equal(3);
      }
    );
    store.dispatch('moduleA/addRoot', { value: 3 });
    addRootUnsubscribe();
  });

  it('async diapatch / thunk diapatch', async () => {
    const store = new Store(
      {
        state: defaultGlobalState,
        mutations: {
          add(state, { value }) {
            state.count += value;
          }
        },
        actions: {
          add({ commit }, payload) {
            commit('add', payload);
          }
        }
      },
      { produce }
    );
    const asyncUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.count).to.be.equal(0);
        expect(nextState.count).to.be.equal('0De');
      }
    );
    const asyncDiapatch = ({ query }) => dispatch => {
      return new Promise(resolve => {
        setTimeout(() => {
          dispatch('add', { value: query });
          resolve();
        }, 10);
      });
    };
    await store
      .dispatch(asyncDiapatch, { query: 'De' })
      .then(() => asyncUnsubscribe());
  });

  it('async diapatch exception handle', async () => {
    const store = new Store(
      {
        state: defaultGlobalState,
        mutations: {
          add(state, { value }) {
            state.count += value;
          }
        },
        actions: {
          add({ commit }, payload) {
            commit('add', payload);
          },
          add1({ dispatch }, payload) {
            return new Promise((resolve, reject) => {
              reject(new Error('add1 error'));
            });
          }
        }
      },
      { produce }
    );
    store.dispatch('add1').catch(error => {
      expect(() => {
        throw new Error(error);
      }).to.throw(/add1 error/);
    });
  });

  it('commit、 dispatch exception', () => {
    const store = new Store(genModule());
    expect(() => store.dispatch()).to.throw(/dispatch does not exist/);
    expect(() => store.dispatch('added')).to.not.throw(/action added does not exist/);

    // expect(() => store.commit()).to.throw(/commit does not exist/);
    expect(() => store.commit('added')).to.throw(/mutation added does not exist/);
  });

  it('dispatch myself', () => {
    const store = new Store({
      state: defaultGlobalState,
      mutations: {
        add(state, { value }) {
          state.count += value;
        }
      },
      actions: {
        add({ dispatch }, payload) {
          dispatch('add');
        }
      }
    });
    expect(() => store.dispatch('add')).to.throw(
      /Maximum call stack size exceeded/
    );
  });

  it('dispatch to a circle', () => {
    const store = new Store({
      state: defaultGlobalState,
      mutations: {
        add(state, { value }) {
          state.count += value;
        }
      },
      actions: {
        add({ dispatch }, payload) {
          dispatch('del');
        },
        del({ dispatch }, payload) {
          dispatch('add');
        }
      }
    });
    expect(() => store.dispatch('add')).to.throw(
      /Maximum call stack size exceeded/
    );
  });

  /*
  it('dispatch subModule by sep', async () => {
    // sep 不能是 '.'
    De.Store.setting.sep = '@';
    const store = new Store(genModule());
    const subModuleUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.moduleA.countA).to.be.equal(0);
        expect(nextState.moduleA.countA).to.be.equal(3);
      }
    );
    await store.dispatch('moduleA@add', { value: 3 });
    De.Store.setting.sep = '/';
    subModuleUnsubscribe();
  });
  */

  it('replaceState', async () => {
    const store = new Store(genModule());
    const oldState = store.state;
    const subModuleUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        if (mutation.type === '@@De.ReplaceState') {
          expect(prevState.moduleA.countA).to.be.equal(3);
          expect(nextState.moduleA.countA).to.be.equal(0);
        } else {
          expect(prevState.moduleA.countA).to.be.equal(0);
          expect(nextState.moduleA.countA).to.be.equal(3);
        }
      }
    );
    await store.dispatch('moduleA/add', { value: 3 });
    store.replaceState(oldState);
    subModuleUnsubscribe();
  });

  it('store.state = xxx throw error', async () => {
    const store = new Store(genModule());
    expect(() => (store.state = {})).to.throw(
      '[@@De] use store.replaceState() to replace store state'
    );
  });

  it('dispatch & commit dep store', async () => {
    const depStore = new Store(genModule());
    const store = new Store({
      ...genModule(),
      actions: {
        add({ commit, dispatch }, payload) {
          commit('add', payload);
          commit('depStore.moduleA/add', payload);
          dispatch('depStore.moduleA/add', payload);
        }
      },
      deps() {
        return { depStore };
      }
    });

    var calls = 0;
    const storeUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        expect(prevState.count).to.be.equal(0);
        expect(nextState.count).to.be.equal(3);
      }
    );
    const depStoreUnsubscribe = depStore.subscribe(
      (mutation, nextState, prevState) => {
        if (calls === 0) {
          expect(prevState.moduleA.countA).to.be.equal(0);
          expect(nextState.moduleA.countA).to.be.equal(3);
        } else if (calls === 1) {
          expect(prevState.moduleA.countA).to.be.equal(3);
          expect(nextState.moduleA.countA).to.be.equal(6);
        }
        calls++;
      }
    );
    await store.dispatch('add', { value: 3 });
    expect(calls).to.be.equal(2);
    storeUnsubscribe();
    depStoreUnsubscribe();
  });

  it('subscribeAction / unsubscribeAction', async () => {
    const store = new Store(genModule());

    var calls = 0;
    const unsubscribeAction = store.subscribeAction((action, state) => {
      if (calls === 0) {
        expect(action.type).to.be.equal('add');
        expect(action.payload).to.be.eql({ value: 1 });
        expect(state.count).to.be.equal(0);
      } else if (calls === 1) {
        expect(state.count).to.be.equal(1);
        expect(action.type).to.be.equal('moduleA/add');
        expect(action.payload).to.be.eql({ value: 2 });
      }
      calls++;
    });

    var c = 0;
    const unsubscribeAction1 = store.subscribeAction(() => c++);

    await store.dispatch('add', { value: 1 });
    await store.dispatch('moduleA/add', { value: 2 });
    expect(calls).to.be.equal(2);
    expect(c).to.be.equal(2);

    // test unsubscribeAction
    unsubscribeAction();
    await store.dispatch('add', { value: 3 });
    expect(calls).to.be.equal(2);

    unsubscribeAction1();
  });

  it('mutation use getIn/updateIn && action use getIn', async () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        add(state, { value }) {
          state.count += value;
        }
      },
      modules: {
        moduleA: {
          state: { countA: 0 },
          mutations: {
            add(state, { value }, { setIn, getIn, deleteIn, updateIn }) {
              expect(getIn(state, 'countA')).to.be.equal(0);
              const next = state.countA + value;
              updateIn(state, 'countA', next);
              // state.countA += value;
            }
          },
          actions: {
            addRoot({ commit, state, rootState, getIn }, payload) {
              expect(getIn(rootState, 'count')).to.be.equal(0);
              expect(getIn(state, 'countA')).to.be.equal(1);
              commit('add', payload, { root: true });
              expect(getIn(this.state, 'count')).to.be.equal(1);
            }
          }
        }
      }
    });

    let i = 0;
    const commitUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        if (i === 0) {
          expect(nextState.moduleA.countA).to.be.equal(1);
        }
        if (i === 1) {
          expect(nextState.count).to.be.equal(1);
        }
        i++;
      }
    );
    store.commit('moduleA/add', { value: 1 });
    store.dispatch('moduleA/addRoot', { value: 1 });
    expect(i).to.be.eql(2);
    commitUnsubscribe();
  });

  it('dispatch return value', async () => {
    const store = new Store({
      state: { count: 0 },
      mutations: {
        add(state, value) {
          state.count += value;
        }
      },
      actions: {
        getAddValue({ _ }, payload) {
          var value = ++payload;
          return value;
        },
        async add({ dispatch, commit }, payload) {
          const value = await dispatch('getAddValue', payload);
          commit('add', value);
        }
      }
    });

    const unsubscribe = store.subscribe((mutation, newState, oldState) => {
      expect(newState.count).to.be.equal(2);
    });
    await store.dispatch('add', 1);
    unsubscribe();
  });
});
