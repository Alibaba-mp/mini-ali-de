import { expect } from 'chai';
import { component, Store } from '../lib';

describe('component', () => {
  it('component & connector & Store', () => {
    global.Component = function(option) {
      expect(option.data).to.be.eql({ b: 555 });
      let i = 0;
      option.setData = function(data) {
        i++;
        this.data = { ...option.data, ...data };
        if (i == 1) {
          // expect(this.data).to.be.eql({ ga: 888, b: 555 });
          expect(this.data).to.be.eql({ b: 555, alias: 666, uu: 667 });
        }
        // if (i === 2) {
        //   expect(this.data).to.be.eql({ ga: 888, b: 555, alias: 666, uu: 667 });
        // }
      };
      option.didMount();
      // expect(i).to.be.eql(2);
      expect(i).to.be.eql(1);
    };

    const store = new Store({
      state: {
        a: 666
      },
      getters: {
        uu(state) {
          return ++state.a;
        }
      },
      mutations: {
        updateA(state, payload) {
          state.a = payload;
        }
      }
    });
    // const gstore = new Store({
    //   state: {
    //     ga: 888
    //   },
    //   mutations: {
    //     updateGa(state, payload) {
    //       state.ga = payload;
    //     }
    //   }
    // });

    component({
      // $global: gstore,
      $store: store,

      connector: {
        state: { alias: 'a' },
        getters: ['uu'],
      },
      props: {},
      data: {
        b: 555
      },
      didMount() {
        // expect(this.data).to.be.eql({ uu: 667, ga: 888, b: 555, alias: 666 });
        expect(this.data).to.be.eql({ uu: 667, b: 555, alias: 666 });
      }
    });
  });
});
