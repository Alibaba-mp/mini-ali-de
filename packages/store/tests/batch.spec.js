import chai from 'chai';
/**
 * @see https://www.npmjs.com/package/chai-as-promised
 */
import chaiAsPromised from 'chai-as-promised';
import { Store } from '..';

chai.use(chaiAsPromised);
const expect = chai.expect;

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
  }
});

describe('store-batch', () => {
  it(`no batch mutation`, () => {
    const store = new Store(genModule());
    let i = 0;
    store.subscribe(mutation => {
      i++;
    });
    store.commit('add', { value: 'learn de' });
    store.commit('add', { value: 'learn de-batch-mutation' });

    expect(i).to.equal(2);
  });

  it(`batch mutation`, () => {
    const store = new Store({...genModule(), batch: true });
    let i = 0;
    store.subscribe(mutation => {
      i++;
    });
    store.commit('add', { value: 'learn de' });
    store.commit('add', { value: 'learn de-batch-mutation' });

    const tp = new Promise(resolve => setTimeout(() => resolve(i), 100));
    return tp.then(res => expect(res).to.equal(1));
    // return expect(Promise.resolve(tp)).to.eventually.equal(1);
  });

  it(`batch mutation collect time`, () => {
    const store = new Store({...genModule(), batch: { timestep: 20 } });
    let i = 0;
    store.subscribe(mutation => {
      i++;
    });
    store.commit('add', { value: 'learn de' });
    store.commit('add', { value: 'learn de-batch-mutation' });

    const tp = new Promise(resolve => setTimeout(() => resolve(i), 110));
    return tp.then(res => expect(res).to.equal(1));
    // return expect(Promise.resolve(tp)).to.eventually.equal(1);
  });

  it(`batch mutation subscribe oldValue`, () => {
    const store = new Store({...genModule(), batch: true });
    store.subscribe((mutation, newValue, oldValue) => {
      expect(oldValue.items.length).to.equal(1);
      expect(newValue.items.length).to.equal(2);
    });

    store.commit('add', { value: 'learn de' });
    store.commit('add', { value: 'learn de-batch-mutation' });
  });

  it(`batch mutation watch oldValue`, () => {
    const module = Object.assign({}, genModule(), {
      state: { items: [{ value: 'deatult' }] }
    });
    const store = new Store({...module, batch: true });

    let flag = false;
    store.watch('items', (newValue, oldValue) => {
      if (flag) {
        expect(oldValue.length).to.equal(3);
        expect(newValue.length).to.equal(5);
      } else {
        expect(oldValue.length).to.equal(1);
        expect(newValue.length).to.equal(3);
      }
    });

    store.commit('add', { value: 'learn de' });
    store.commit('add', { value: 'learn de-batch-mutation' });

    const tp = new Promise(resolve =>
      setTimeout(() => {
        flag = true;
        store.commit('add', { value: '300' });
        store.commit('add', { value: '400' });
        resolve();
      }, 100)
    );

    return Promise.resolve(tp);
  });

  it(`commitIM`, () => {
    const store = new Store({...genModule(), batch: true });
    let i = 0;
    store.subscribe(mutation => {
      i++;
    });
    store.commitIM('add', { value: '1' });
    store.commit('add', { value: '2' });
    store.commitIM('add', { value: '3' });
    store.commit('add', { value: '4' });

    const tp = new Promise(resolve => setTimeout(() => resolve(i), 100));
    return tp.then(res => expect(res).to.equal(3));
  });
});
