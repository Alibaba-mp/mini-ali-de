import { expect } from 'chai';
import { Store } from '@de/store';
import { connect4P, connect4C, Provider } from '..';

const genModule = () => ({
  state: { count: 0 },
  getters: {
    countAll(state) {
      return state.count + state.moduleA.countA;
    }
  },
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
      state: { countA: 0 },
      mutations: {
        add(state, { value }) {
          state.countA += value;
        }
      },
      actions: {
        add({ commit }, payload) {
          commit('add', payload);
        }
      }
    }
  }
});

describe('relation', () => {
  it('resume', () => {
    // store
    const store = new Store(genModule());

    var onResumeCalls = 0;
    var onReadyCalls = 0;
    var onShowCalls = 0;
    // page
    const option = {
      onLoad() {
        this.rootAdd({ value: 1 });
        this.moduleAAdd({ value: 2 });
      },
      onResume() {
        onResumeCalls++;
      },
      onShow() {
        onShowCalls++;
      },
      onReady() {
        onReadyCalls++
      }
    };

    Page(
      connect4P(store, {
        mapState: {
          count: 'count',
          countA: state => state.moduleA.countA
        },
        mapActions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        }
      })(option)
    );

    function Page(option) {
      let i = 0;
      // let j = 0;
      let k = 0;

      option.setData = function(data) {
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ countA: 2 });
        }

        if (i === 4) {
          expect(data).to.be.eql({ __DE_RESUME__: true });
        }
      };

      store.$setDataHook = function({ mutation }, isSpliceData) {
        expect(isSpliceData).to.not.equal(true);
        expect(mutation.type).to.be.equal(k === 0 ? 'add' : 'moduleA/add');
        k++;
      };
      option.onLoad();
      option.onShow();
      option.onReady();
      expect(i).to.be.equal(4);
      // expect(j).to.be.equal(2);
      expect(k).to.be.equal(2);

      option.onShow();
      expect(onResumeCalls).to.be.equal(1);
      expect(onReadyCalls).to.be.equal(1);
      expect(onShowCalls).to.be.equal(2);
    }
  });

  it('connect', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.rootAdd({ value: 1 });
        this.moduleAAdd({ value: 2 });
      }
    };

    Page(
      connect4P(store, {
        mapState: {
          count: 'count',
          countA: state => state.moduleA.countA
        },
        mapActions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        }
      })(option)
    );

    function Page(option) {
      let i = 0;
      // let j = 0;
      let k = 0;

      option.setData = function(data) {
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ countA: 2 });
        }
      };

      // option.$setDataHook = function({ context, mutation }, isSpliceData) {
      //   expect(isSpliceData).to.not.equal(true);
      //   expect(mutation.type).to.be.equal(j === 0 ? 'add' : 'moduleA/add');
      //   j++;
      // };
      store.$setDataHook = function({ mutation }, isSpliceData) {
        expect(isSpliceData).to.not.equal(true);
        expect(mutation.type).to.be.equal(k === 0 ? 'add' : 'moduleA/add');
        k++;
      };
      option.onLoad();
      expect(i).to.be.equal(3);
      // expect(j).to.be.equal(2);
      expect(k).to.be.equal(2);
    }
  });

  it('$spliceData', () => {
    // store
    const store = new Store({
      ...genModule(),
      actions: {
        add({ commit }, payload) {
          commit('add', payload, {
            meta: {
              splicePath: 'count',
              spliceData: []
            }
          });
        }
      }
    });

    // page
    const option = {
      onLoad() {
        this.rootAdd({ value: 1 });
      }
    };

    Page(
      connect4P(store, {
        mapState: {
          count: 'count'
        },
        mapActions: {
          rootAdd: 'add'
        }
      })(option)
    );

    function Page(option) {
      let i = 0;
      // let j = 0;
      let k = 0;

      // option.$setDataHook = function({ context, mutation }, isSpliceData) {
      //   expect(isSpliceData).to.be.equal(true);
      //   expect(mutation.type).to.be.equal('add');
      //   j++;
      // };
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.$spliceData = function() {
        i++;
      };
      store.$setDataHook = function({ mutation }, isSpliceData) {
        expect(isSpliceData).to.be.equal(true);
        expect(mutation.type).to.be.equal('add');
        k++;
      };
      option.onLoad();
      expect(i).to.be.equal(1);
      // expect(j).to.be.equal(1);
      expect(k).to.be.equal(1);
    }
  });

  it('$$middlewares', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.rootAddCommit({ value: 11 });
        this.moduleAAddCommit({ value: 22 });
      }
    };

    const myMiddleware = (store, extMap = {}) => app => {
      const myMiddlewareArgs = extMap.myMiddleware;
      expect(myMiddlewareArgs).to.be.eql({
        key: 'value'
      });
      const mapped = {};
      // do somethong

      return { ...app, ...mapped };
    };

    Page(
      connect4P(store, {
        mapState: {
          count: state => state.count,
          countA: state => state.moduleA.countA
        },
        mapActions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        },
        mapMutations: {
          rootAddCommit: 'add',
          moduleAAddCommit: 'moduleA/add'
        },
        myMiddleware: {
          key: 'value'
        },
        $$middlewares: [myMiddleware]
      })(option)
    );

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 11 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ countA: 22 });
        }
      };
      option.onLoad();
      expect(i).to.be.equal(3);
    }
  });

  it('$$middlewares and mapMutations', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.rootAddCommit({ value: 11 });
        this.moduleAAddCommit({ value: 22 });
      }
    };

    const myMiddleware = (store, extMap = {}) => app => {
      const myMiddlewareArgs = extMap.myMiddleware;
      expect(myMiddlewareArgs).to.be.eql({
        key: 'value'
      });
      const mapped = {};
      // do somethong

      return { ...app, ...mapped };
    };

    Page(
      connect4P(store, {
        mapState: {
          count: state => state.count,
          countA: state => state.moduleA.countA
        },
        mapActions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        },
        mapMutations: {
          rootAddCommit: 'add',
          moduleAAddCommit: 'moduleA/add'
        },
        myMiddleware: {
          key: 'value'
        },
        $$middlewares: [myMiddleware]
      })(option)
    );

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 11 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ countA: 22 });
        }
      };
      option.onLoad();
      expect(i).to.be.equal(3);
    }
  });

  it('mapState mapActions is null', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.$store.dispatch('add', { value: 111 });
        this.$store.dispatch('moduleA/add', { value: 222 });
      }
    };
    Page(connect4P(store)(option));

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', options.data, { ...options.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 111 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ 'moduleA.countA': 222 });
        }
      };
      option.onLoad();
      expect(i).to.be.equal(3);
    }
  });

  it('mapState mapActions is array', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.add({ value: 1111 });
        this['moduleA/add']({ value: 2222 });
      }
    };
    Page(
      connect4P(store, {
        mapState: ['count', { moduleAcountA: 'moduleA.countA' }],
        mapActions: ['add', 'moduleA/add']
      })(option)
    );

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1111 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ moduleAcountA: 2222 });
        }
      };
      option.onLoad({ source: 'antforest' });
      expect(i).to.be.equal(3);
    }
  });

  it('mapMutations is array', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.add({ value: 1111 });
      }
    };
    Page(
      connect4P(store, {
        mapMutations: ['add']
      })(option)
    );

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1111 });
        }
      };
      option.onLoad({ source: 'antforest' });
      expect(i).to.be.equal(2);
    }
  });

  it('mapGetters is a array', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.$store.dispatch('add', { value: 1 });
        this.$store.dispatch('moduleA/add', { value: 2 });
      }
    };
    Page(
      connect4P(store, {
        mapGetters: ['countAll']
      })(option)
    );

    function Page(option) {
      let i = 0;
      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1, countAll: 1 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ 'moduleA.countA': 2, countAll: 3 });
        }
      };
      option.onLoad();
    }
  });

  it('mapGetters is a object', () => {
    // store
    const store = new Store(genModule());

    // page
    const option = {
      onLoad() {
        this.$store.dispatch('add', { value: 1 });
        this.$store.dispatch('moduleA/add', { value: 2 });
      }
    };
    Page(
      connect4P(store, {
        mapGetters: { countA: 'countAll' }
      })(option)
    );

    function Page(option) {
      let i = 0;
      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1, countA: 1 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ 'moduleA.countA': 2, countA: 3 });
        }
      };
      option.onLoad();
    }
  });

  it('onUnload unsubscribe', () => {
    // store
    const store = new Store({
      state: { count: 0 },
      getters: {
        countAll(state) {
          return state.count + state.moduleA.countA;
        }
      },
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
          state: { countA: 0 },
          mutations: {
            add(state, { value }) {
              state.countA += value;
            }
          },
          actions: {
            add({ commit }, payload) {
              commit('add', payload);
            }
          }
        }
      }
    });

    // page
    const option = {
      onLoad(q) {
        expect(q.source).to.be.equal('antforest');
        this.$store.dispatch('add', { value: 111 });
        this.onUnload();
        this.$store.dispatch('moduleA/add', { value: 222 });
      },
      onUnload() {}
    };
    Page(connect4P(store)(option));

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        this.data = { ...option.data, ...data };
        ++i;
      };
      option.onLoad({ source: 'antforest' });
      expect(i).to.be.equal(2);
    }
  });

  it('connect in Component', () => {
    // store
    const store = new Store(genModule());

    // component
    const option = {
      props: {},
      $page: { $store: store },
      didMount() {
        this.rootAdd({ value: 1 });
        this.moduleAAdd({ value: 1 });

        this.rootAddCommit({ value: 2 });
        this.moduleAAddCommit({ value: 2 });

        this.didUnmount();
        this.moduleAAddCommit({ value: 100 });
      },
      didUpdate() {},
      didUnmount() {}
    };
    Component(
      connect4C(store, {
        mapState: {
          count: state => state.count,
          countA: state => state.moduleA.countA
        },
        mapActions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        },
        mapMutations: {
          rootAddCommit: 'add',
          moduleAAddCommit: 'moduleA/add'
        }
      })(option)
    );

    function Component(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 2) {
          expect(data).to.be.eql({ count: 1 });
        }
        if (i === 3) {
          expect(data).to.be.eql({ countA: 1 });
        }
        if (i === 4) {
          expect(data).to.be.eql({ count: 3 });
        }
        if (i === 5) {
          expect(data).to.be.eql({ countA: 3 });
        }
      };
      option.didMount();
      expect(i).to.be.equal(5);
      option.didUpdate();
    }
  });

  it('Provider', () => {
    // store
    const store = new Store(genModule());
    let cCalled = 0;
    let pCalled = 0;
    // page
    const option = {};
    App(Provider(store)(option));

    const pageOption = {
      onLoad() {
        pCalled = 1;
        expect(this.data.count).to.be.equal(0);
      }
    };
    Page(
      connect4P({
        mapState: { count: state => state.count }
      })(pageOption)
    );

    const compOptions = {
      props: {},
      $page: { $store: store },
      didMount() {
        cCalled = 1;
        expect(this.data.countA).to.be.equal(0);
      }
    };
    Component(
      connect4C({
        mapState: {
          countA: state => state.moduleA.countA
        }
      })(compOptions)
    );

    function App(option) {
      ['$store', '$state', '$dispatch', '$commit'].forEach(item => {
        expect(option).to.have.property(item);
      });
    }
    function Page(option) {
      expect(option.data).to.be.equal(undefined);
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.onLoad();
    }
    function Component(option) {
      expect(option.data).to.be.equal(undefined);
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.didMount();
    }
    expect(pCalled).to.be.equal(1);
    expect(cCalled).to.be.equal(1);
  });

  it('Provider for component2', () => {
    global.my = {
      canIUse(x) {
        return x === 'component2';
      }
    };
    // store
    const store = new Store(genModule());
    // page
    const option = {};
    App(Provider(store)(option));
    let cCalled = 0;
    let pCalled = 0;
    const pageOption = {
      onLoad() {
        pCalled = 1;
        expect(this.data.count).to.be.equal(0);
      }
    };
    Page(
      connect4P({
        mapState: { count: state => state.count }
      })(pageOption)
    );
    const compOptions = {
      $page: { $store: store },
      onInit() {
        cCalled = 1;
        expect(this.data.countA).to.be.equal(0);
      },
      setData: function(data) {
        this.data = { ...option.data, ...data };
      }
    };
    Component(
      connect4C({
        mapState: {
          countA: state => state.moduleA.countA
        }
      })(compOptions)
    );
    function App(option) {
      ['$store', '$state', '$dispatch', '$commit'].forEach(item => {
        expect(option).to.have.property(item);
      });
    }
    function Page(option) {
      expect(option.data).to.be.equal(undefined);
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.onLoad();
    }
    function Component(option) {
      expect(option.data).to.be.equal(undefined);
      option.onInit();
    }
    expect(pCalled).to.be.equal(1);
    expect(cCalled).to.be.equal(1);
    global.my = undefined;
  });

  /*
  it('$connect', () => {
    // store
    const store = new Store(genModule());

    // page
    var change = 0;
    const option = {
      $connect: {
        state: {
          count: 'count',
          countA: state => state.moduleA.countA
        },
        actions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        },
        computed: {
          countAll(state) {
            return state.count + state.moduleA.countA;
          }
        },
        watch: {
          count() {
            change++;
            // console.log('count change');
          },
          moduleA: {
            countA() {
              change++;
              // console.log('$connect moduleA.countA change');
            }
          }
        }
      },
      onLoad() {
        var i = 0;
        this.$watch('moduleA.countA', () => {
          ++i;
          // console.log('moduleA.countA change');
        });
        this.rootAdd({ value: 1 });
        this.moduleAAdd({ value: 2 });

        expect(i).to.be.eql(1);
      }
    };

    Page(connect4P(store)(option));

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        // console.log('>>>: ', option.data, { ...option.data, ...data });
        this.data = { ...option.data, ...data };
        ++i;
        if (i === 1) {
          expect(data).to.be.eql({ count: 1, countAll: 1 });
        }
        if (i === 2) {
          expect(data).to.be.eql({ countA: 2, countAll: 3 });
        }
      };
      option.onLoad();
      expect(i).to.be.equal(2);
      expect(change).to.be.equal(2);
      option.onUnload();
    }
  });

  it('$connect in Component', () => {
    // store
    const store = new Store(genModule());

    // page
    var change = 0;
    const option = {
      $connect: {
        state: {
          count: 'count',
          countA: state => state.moduleA.countA
        },
        actions: {
          rootAdd: 'add',
          moduleAAdd: 'moduleA/add'
        },
        computed: {
          countAll(state) {
            return state.count + state.moduleA.countA;
          }
        },
        watch: {
          count() {
            change++;
            // console.log('count change');
          },
          moduleA: {
            countA() {
              change++;
              // console.log('$connect moduleA.countA change');
            }
          }
        }
      },
      didMount() {
        this.$page = this.$page || {};
        this.props = this.props || {};
        var i = 0;
        this.$watch('moduleA.countA', () => {
          ++i;
          // console.log('moduleA.countA change');
        });
        this.methods.rootAdd({ value: 1 });
        this.methods.moduleAAdd({ value: 2 });
        expect(this.$state.count).to.be.eql(1);
        expect(i).to.be.eql(1);
        expect(change).to.be.equal(2);
      },
      didUpdate() {},
      didUnmount() {}
    };

    Component(connect4C(store)(option));

    function Component(option) {
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.didMount();
      option.didUpdate();
      option.didUnmount();
    }
  });
  */

  // it('computed & watch', () => {
  //   // store
  //   const store = new Store(genModule());

  //   // page
  //   var change = 0;
  //   const option = {
  //     onLoad() {
  //       var i = 0;
  //       this.$watch('moduleA/countA', () => {
  //         ++i;
  //       });
  //       this.$watch('moduleA.countA', () => {
  //         ++i;
  //       });
  //       this.$dispatch('add', { value: 1 });
  //       this.$dispatch('moduleA/add', { value: 2 });
  //       expect(i).to.be.eql(2);
  //     }
  //   };

  //   Page(
  //     connect4P(store, {
  //       mapState: ['count', { countA: 'moduleA/countA' }],
  //       computed: {
  //         countAll: function(state) {
  //           return this.data.count + this.data.countA;
  //         }
  //       },
  //       watch: {
  //         count: function(newVal, oldVal) {
  //           expect(newVal).to.be.eql(1);
  //           expect(oldVal).to.be.eql(0);
  //           change++;
  //         },
  //         moduleA: {
  //           countA: function(newVal, oldVal) {
  //             expect(newVal).to.be.eql(2);
  //             expect(oldVal).to.be.eql(0);
  //             change++;
  //           }
  //         },
  //         'moduleA/countA': function(newVal, oldVal) {
  //           expect(newVal).to.be.eql(2);
  //           expect(oldVal).to.be.eql(0);
  //           change++;
  //         }
  //       }
  //     })(option)
  //   );

  //   function Page(option) {
  //     let i = 0;

  //     option.setData = function(data) {
  //       this.data = { ...option.data, ...data };
  //       ++i;
  //       if (i === 2) {
  //         expect(data).to.be.eql({ count: 1, countAll: 1 });
  //       }
  //       if (i === 3) {
  //         expect(data).to.be.eql({ countA: 2, countAll: 3 });
  //       }
  //     };
  //     option.onLoad();
  //     expect(i).to.be.equal(3);
  //     expect(change).to.be.equal(3);
  //     option.onUnload();
  //   }
  // });

  it('watch sub module', () => {
    // store
    const store = new Store(genModule());

    // page
    var change = 0;
    const option = {
      onLoad() {
        var i = 0;
        this.$watch('moduleA/countA', () => {
          ++i;
        });
        this.$watch('moduleA.countA', () => {
          ++i;
        });
        this.$dispatch('moduleA/add', { value: 2 });
        expect(i).to.be.eql(2);
      }
    };

    Page(
      connect4P(store, {
        mapState: { countA: 'moduleA/countA' },
        // watch: {
        //   moduleA: {
        //     countA: function(newVal, oldVal) {
        //       change++;
        //     }
        //   },
        //   'moduleA/countA': function(newVal, oldVal) {
        //     change++;
        //   }
        // }
      })(option)
    );

    function Page(option) {
      option.setData = function(data) {
        this.data = { ...option.data, ...data };
      };
      option.onLoad();
      // expect(change).to.be.equal(2);
      option.onUnload();
    }
  });

  it('list diff overflow maxLength', () => {
    // store
    global.process.env.NODE_ENV = 'development';
    const store = new Store({
      state: { list: Array.from({ length: 200 }, (v, k) => k) },
      mutations: {
        unshift(state, payload) {
          state.list.unshift(payload);
        }
      }
    });

    // page
    const option = {
      onLoad() {
        this.unshift(1001);
      }
    };

    Page(
      connect4P(store, {
        mapState: ['list'],
        mapMutations: ['unshift']
      })(option)
    );

    function Page(option) {
      let i = 0;

      option.setData = function(data) {
        this.data = { ...option.data, ...data };
        ++i;
        if (i == 2) {
          expect(data['list[0]']).to.be.eql(1001);
          expect(Object.keys(data).length).to.be.eql(201);
        }
      };

      option.onLoad();
      expect(i).to.be.equal(2);
    }
  });
});
