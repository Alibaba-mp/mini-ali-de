import { expect } from 'chai';
import { createStructuredSelector } from 'reselect';
import { Store } from '..';

const genModle = () => ({
  state: { items: [] },
  mutations: {
    add({ items }, { value }) {
      items.push({ value });
    }
  },
  actions: {
    add({ commit }, payload) {
      commit('add', payload);
    }
  }
});

describe('store-watch', () => {
  it(`watch by simple: watch('items', (newVal, oldVal) => {})`, async () => {
    const store = new Store(genModle());
    let i = 0;
    store.watch('items', (newVal, oldVal) => {
      /* eslint-disable-next-line */
      expect(oldVal).to.be.empty;
      expect(newVal).to.eql([{ value: 'learn de-watch' }]);
      ++i;
    });
    await store.dispatch('add', { value: 'learn de-watch' });
    expect(i).to.eql(1);
  });

  it(`watch by object-path: watch('items[0]', (newVal, oldVal) => {})`, async () => {
    const store = new Store(genModle());
    let i = 0;
    store.watch('items[0]', (newVal, oldVal) => {
      /* eslint-disable-next-line */
      expect(oldVal).to.be.undefined;
      expect(newVal).to.eql({ value: 'learn de-watch1' });
      ++i;
    });
    await store.dispatch('add', { value: 'learn de-watch1' });
    await store.dispatch('add', { value: 'learn de-watch2' });
    await store.dispatch('add', { value: 'learn de-watch3' });
    expect(i).to.eql(1);
  });

  it(`watch by object-path: watch('items.0', (newVal, oldVal) => {})`, async () => {
    const store = new Store(genModle());
    let i = 0;
    store.watch('items.0', (newVal, oldVal) => {
      /* eslint-disable-next-line */
      expect(oldVal).to.be.undefined;
      expect(newVal).to.eql({ value: 'learn de-watch' });
      ++i;
    });
    store.dispatch('add', { value: 'learn de-watch' });
    expect(i).to.eql(1);
  });

  it(`watch by selector: watch(state => state.items, (newVal, oldVal) => {})`, async () => {
    const store = new Store(genModle());
    let i = 0;
    store.watch(
      state => state.items,
      (newVal, oldVal) => {
        /* eslint-disable-next-line */
        expect(oldVal).to.be.empty;
        expect(newVal).to.eql([{ value: 'learn de-watch' }]);
        ++i;
      }
    );
    store.dispatch('add', { value: 'learn de-watch' });
    expect(i).to.eql(1);
  });

  it(`watch by reselect createStructuredSelector:

      const item0Selector = state => state.items[0];
      const item1Selector = state => state.items[1];
      const item0AndItem1Selector = createStructuredSelector({
        item0: item0Selector,
        item1: item1Selector,
      });
      watch(item0AndItem1Selector, (newVal, oldVal) => {})
      `, () => {
    const store = new Store(genModle());
    // watch by reselect createStructuredSelector
    const item0Selector = state => state.items[0];
    const item1Selector = state => state.items[1];

    const item0AndItem1Selector = createStructuredSelector({
      item0: item0Selector,
      item1: item1Selector
    });
    let i = 0;
    store.watch(item0AndItem1Selector, (newVal, oldVal) => {
      expect(oldVal).to.eql({
        item0: undefined,
        item1: undefined
      });
      expect(newVal).to.eql({
        item0: { value: 'learn de' },
        item1: undefined
      });
      ++i;
    });

    store.dispatch('add', { value: 'learn de' });
    expect(i).to.eql(1);
  });

  it(`unwatch by return function`, async () => {
    const store = new Store(genModle());
    let i = 0;
    const unwatch = store.watch(
      state => state.items,
      (newVal, oldVal) => {
        ++i;
      }
    );
    unwatch();

    await store.dispatch('add', { value: 'learn de-watch' });
    expect(i).to.eql(0);
  });

  it(`watch once`, async () => {
    const store = new Store(genModle());
    let i = 0;
    store.watch.once('items', (newVal, oldVal) => {
      /* eslint-disable-next-line */
      expect(oldVal).to.be.empty;
      expect(newVal).to.eql([{ value: 'learn de-watch' }]);
      ++i;
    });
    await store.dispatch('add', { value: 'learn de-watch' });
    // 这一次不会触发 watch 回调
    await store.dispatch('add', { value: 'learn de-watch again' });
    expect(i).to.eql(1);
  });

  it(`watch once by options`, async () => {
    const store = new Store(genModle());
    let i = 0;
    const once = true;
    store.watch(
      'items',
      (newVal, oldVal) => {
        /* eslint-disable-next-line */
        expect(oldVal).to.be.empty;
        expect(newVal).to.eql([{ value: 'learn de-watch' }]);
        ++i;
      },
      once
    );
    await store.dispatch('add', { value: 'learn de-watch' });
    // 这一次不会触发 watch 回调
    await store.dispatch('add', { value: 'learn de-watch again' });
    expect(i).to.eql(1);
  });

  it(`watch once no need unwatch`, async () => {
    const store = new Store(genModle());
    let i = 0;
    const onceUnwatch = store.watch.once('items', (newVal, oldVal) => {
      /* eslint-disable-next-line */
      expect(oldVal).to.be.empty;
      expect(newVal).to.eql([{ value: 'learn de-watch' }]);
      ++i;
    });
    await store.dispatch('add', { value: 'learn de-watch' });
    expect(i).to.eql(1);
    expect(onceUnwatch()).to.be.eql(true);
  });

  it(`watch but no handler`, async () => {
    const store = new Store(genModle());
    store.watch('items');
  });

  it(`store.when`, async () => {
    const store = new Store(genModle());
    let i = 0;
    const once = true;
    store.when(
      (state) => state.items.length === 2,
      (mutation, newState, oldState) => {
        /* eslint-disable-next-line */
        expect(newState.items).to.eql([{ value: 'learn de-watch' }, { value: 'learn de-watch again' }]);
        expect(oldState.items).to.eql([{ value: 'learn de-watch' }]);
        ++i;
      }
    );
    await store.dispatch('add', { value: 'learn de-watch' });
    // 这一次不会触发 watch 回调
    await store.dispatch('add', { value: 'learn de-watch again' });
    expect(i).to.eql(1);
  });
});
