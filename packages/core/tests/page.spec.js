import { expect } from 'chai';
import { page, Store } from '../lib';

describe('page', () => {
  it('mixin merge data and props & function stack exec', () => {
    let loggerOnLoadCalls = 0;
    let testOnLoadCalls = 0;
    let pageOnLoadCalls = 0;
    global.Page = function(option) {
      expect(option.data).to.be.eql({ test: 123 });
      let i = 0;
      option.setData = function(data) {
        i++;
        this.data = { ...option.data, ...data };
      };
      option.onLoad();
      // expect(i).to.be.eql(4);
      expect(i).to.be.eql(2);
      // expect(option.data).to.be.eql({ ga: 7777, test: 123, a: 888 });
      expect(option.data).to.be.eql({ test: 123, a: 888 });
      expect(loggerOnLoadCalls).to.be.eql(1);
      expect(testOnLoadCalls).to.be.eql(1);
      expect(pageOnLoadCalls).to.be.eql(1);

      expect(option.testString).to.be.eql('testString');
      expect(option.testObject).to.be.eql({ logger: 999, test: 666 });
    };
    
    const loggerMixin = {
      onLoad() {
        loggerOnLoadCalls++;
      },
      testString: 'loggerString',
      testObject: { logger: 999 },
    };
    const testMixin = {
      data: {
        test: 123,
      },
      testString: 'testString',
      testObject: { test: 666 },
      onLoad() {
        testOnLoadCalls++;
      },
    };
    const store = new Store({
      state: {
        a: 666
      },
      mutations: {
        updateA(state, payload) {
          state.a = payload;
        },
      },
      actions: {
        upa({ commit }, payload) {
          commit('updateA', payload);
        },
      }
    });

    // const gstore = new Store({
    //   state: {
    //     ga: 777
    //   },
    //   mutations: {
    //     updateGa(state, payload) {
    //       state.ga = payload;
    //     }
    //   },
    //   actions: {
    //     upga({ commit }, payload) {
    //       commit('updateGa', payload);
    //     }
    //   }
    // });

    page({
      mixins: [loggerMixin, testMixin],
      // $global: gstore,
      $store: store,
      onLoad() {
        pageOnLoadCalls++;
        // expect(this.data).to.be.eql({ ga: 777, test: 123, a: 666 });
        expect(this.data).to.be.eql({ test: 123, a: 666 });
        this.$store.dispatch('upa', 888);
        // this.dispatch('$global.upga', 7777);
      }
    });
  });
});
