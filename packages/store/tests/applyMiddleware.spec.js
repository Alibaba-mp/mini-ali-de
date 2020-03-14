import { expect } from 'chai';
import { Store, applyMiddleware } from '..';

describe('store-applyMiddleware', () => {
  it('applyMiddleware visit store、mutation、payload accurately', () => {
    let i = 0;
    const testMiddleware = store => next => (mutation, payload) => {
      ++i;
      /* eslint-disable no-unused-expressions */
      expect(typeof store === 'object').to.be.true;
      expect(typeof store.getState === 'function').to.be.true;
      expect(typeof store.dispatch === 'function').to.be.true;
      expect(typeof store.commit === 'function').to.be.true;

      const state = store.getState();
      expect(state.count === 0).to.be.true;
      expect(payload.value === 1).to.be.true;
      expect(mutation === 'add').to.be.true;

      payload.value += 1;
      next(mutation, payload);
    };
    const middlewares = [testMiddleware];

    const store = new Store({
      state: { count: 0 },
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
      plugins: [applyMiddleware(middlewares)]
    });

    let j = 0;
    const applyMiddlewareUnsubscribe = store.subscribe(
      (mutation, nextState, prevState) => {
        ++j;
        expect(prevState.count).to.be.equal(0);
        expect(nextState.count).to.be.equal(2);
      }
    );
    store.dispatch('add', { value: 1 }).then(() => {
      expect(i).to.be.equal(1);
      expect(j).to.be.equal(1);
      applyMiddlewareUnsubscribe();
    });
  });

  it('no middleware', () => {
    const store = new Store({
      state: {}
    });
    expect(applyMiddleware()(store)).to.be.undefined;
  });

  it('middleware function args', () => {
    const store = new Store({
      state: {}
    });
    const testMiddleware = store => next => (mutation, payload) => {
      next(mutation, payload);
    };
    expect(applyMiddleware(testMiddleware)(store)).to.be.not.throw;
  });
});
