import { expect } from 'chai';
import { Store, use } from '..';

describe('store-use', () => {
  it('use a custom plugin accuracy', () => {
    const myCustomPlugin1 = store => {
      ['getState', 'commit', 'dispatch'].forEach(item =>
        expect(store).to.have.property(item)
      );
    };
    use(myCustomPlugin1);
    /* eslint-disable no-new */
    new Store();
  });

  it('use custom plugins by a array', () => {
    const myCustomPlugin2 = store => {};
    const myCustomPlugin3 = store => {};
    use([myCustomPlugin2, myCustomPlugin3]);
    /* eslint-disable no-new */
    new Store();
  });

  it('unuse a custom plugin', () => {
    const myCustomPlugin4 = store => {};
    const unuse = use(myCustomPlugin4);
    unuse();
    unuse();
    expect(Store.plugins.length).to.be.equal(3);

    const myCustomPlugin5 = store => {};
    const myCustomPlugin6 = store => {};
    const unuse1 = use([myCustomPlugin5, myCustomPlugin6]);
    unuse1();
    expect(Store.plugins.length).to.be.equal(3);
  });
});
