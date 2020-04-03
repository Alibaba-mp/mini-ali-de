# 状态管理
## Store
De 的核心是 Store（你可以把它理解成一个数据仓库），Store 有以下职责：

* 维持应用的 State，并提供获取 State 的接口
* 提供更新 State 的接口
* 提供监听 State 变化的接口

### 创建一个 Store
创建一个 Store 非常简单，仅需要提供一个初始 State 对象和一些 Mutation 即可：

```js
import { Store } from 'mini-ali-de';

const store = new Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++;
    }
  }
});
```

### 通过 Store 获取及更新 State
现在你可以通过 `store.state/store.getState()` 来获取 State 对象，并通过提交 Mutation 方法触发 State 更新：

```js
// 通过 store.state 获取 State 对象
console.log(store.state.count) // 输出 0
// 通过 store.commit 提交 increment 更新 State 对象
store.commit('increment');
// 通过 store.getState() 获取 State 对象
console.log(store.getState().count) // 输出 1
```

### 监听 State 的变化
你还可以通过 Store 提供的  `subscribe`  接口来监听 State 的变化，这个方法通常在 Plugin 中使用。

```js
store.subscribe((mutation, newState, oldState) => {
  // 输出 { type: 'increment', payload: { num: 1 } }, { count: 1 }, { count: 0 }
  console.log(mutation, newState, oldState);
});
```

### 在小程序中注入 Store
在小程序中注入 Store，可以使用 De 封装了的 app，page，component。

```js
// 在 App 中注入 Store
import { app } from 'mini-ali-de';
import store from '/store';

app({
  $store: store,

  onLaunch() {
    this.$store.xxx
  }
});

// 在 Page 中注入 Store
import { page } from 'mini-ali-de';
import store from './store';

page({
  $store: store,
  onLoad() {}
});

// 在 component 中注入 Store
import { component } from 'mini-ali-de';
import store from './store';

component({
  $store: store, // 可以不传，默认会使用组件所在的页面的 store
  connector: {
    state: ['xxx'],
    actions: ['getMessage'],
    mutations: ['updateMessage']
  },
  didMount() {
    this.$store.xxx;
    this.getMessage();
    this.updateMessage();
  }
});
```

## State
State 对象是用来存储应用状态的，**唯一改变 State 的方式就是触发 Mutation。**

### 在 Store 中定义 State
State 通常使用一个普通对象来定义，对象的内容包含着应用的业务状态。

```js
const store = new Store({
  state: {
    todos: [
      { id: 1, done: true },
      { id: 2, done: false }
    ]
  }
});
```

### 小程序中使用State

```js
import { page } from 'mini-ali-de';

page({
  $store: store,
  connector: {
    state: ['value']
  },
  onLoad(): {
    this.data.value;
  }
})
```

使用 De 来做状态管理并不意味着你需要将所有的状态放入 store 中。虽然将所有的状态放到 store 会使状态变化更显式和易调试，但也会使代码变得冗长和不直观。如果有些状态严格属于单个页面/组件，也可以作为页面/组件的局部状态。你应该根据你的应用开发需要进行权衡和确定。如果一些状态变化是可预测的(变化的地方唯一), 比如接收 onLoad 的参数设置页面状态，这时你可以不把状态放在 store 中维护。

## Getter
有时候我们需要从 State 中派生出一些状态，例如对列表进行过滤并计数：

```js
const store = new Store({
  state: {
    todos: [
      { id: 1, done: true },
      { id: 2, done: false }
    ]
  }
});
const doneTodos = store.state.todos.filter(todo => todo.done);
```

如果有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数然后在多处导入它——无论哪种方式都不是很理想。为此，De 提供了 Getter，可以认为是 Store 的计算属性。

### 在 Store 中定义 Getter

```js
const store = new Store({
  state: {
    todos: [
      { id: 1, done: true },
      { id: 2, done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done);
    }
  }
});
```
### 通过属性访问
Getter 会暴露为 store.getters 对象，你可以以属性的形式访问这些值：

```js
store.getters.doneTodos // { id: 1, done: true }
```

Getter 也接受其他 getter 作为第二个参数：

```js
getters: {
  doneTodos: state => {
    return state.todos.filter(todo => todo.done);
  },
  doneTodosCount: (state, getters) => {
    return getters.doneTodos.length
  }
}
store.getters.doneTodosCount // -> 1
```

Getter 还可以接受 rootState、rootGetters 作为第三、四个参数，便于在子 Module 中访问 rootState 和 rootGetters 或者其他子 Module 的状态和 getters。

> 如果不明白子 Module 是什么概念，不要着急，在下文中我们会详细介绍。

```js
modules: {
  moduleA: {
    getters: {
      doneTodosCount: (state, ctxGetters, rootState, rootGetters) => {
        return ctxGetters.doneTodos.length
      }
    }
  }
}
```

### 通过方法访问
你也可以通过让 getter 返回一个函数，来实现给 getter 传参。在你对 store 里的数组进行查询时非常有用。

```js
getters: {
  // ...
  getTodoById: state => id => {
    return state.todos.find(todo => todo.id === id)
  }
}
store.getters.getTodoById(2) // -> { id: 2, done: false }
```

### 在小程序中使用 Getter
```js
import { page } from 'mini-ali-de';
page({
  $store: store,
  connector: {
    getters: ['myGetter']
  },
  onLoad(): {
    this.data.myGetter;
  }
})
```

## Mutation
### 在 Store 中定义 Mutation
Mutation 非常类似于事件：每个 mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```js
const store = new Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state) {
      // 变更状态
      state.count++
    }
  }
})
```
你不能直接调用一个 Mutation handler。这个选项更像是事件注册：“当触发一个类型为 increment 的 mutation 时，调用此函数。”要触发一个 Mutation handler，你需要以相应的 type 调用 `store.commit` 方法：

```js
store.commit('increment')
```

### 提交负载(Payload)
你可以向 `store.commit` 传入额外的参数，即 Mutation 的载荷（payload）：

```js
const store = new Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state, n) {
    	state.count += n
    }
  }
});

store.commit('increment', 10)
```

在大多数情况下，载荷应该是一个对象，这样可以包含多个字段并且记录的 Mutation 会更易读：

```js
const store = new Store({
  state: {
    count: 1
  },
  mutations: {
    increment (state, payload) {
    	state.count += payload.amount
    }
  }
});

store.commit('increment', {
  amount: 10
})
```

commit 还支持对象风格的提交方式：
```js
store.commit({
  type: 'increment',
  amount: 10
})
```

此外 commit 还支持**隐式 Mutation**（如果未显示声明 Mutation，会使用 De 默认的 Mutation 把 payload 合并到 State 中）。

```js
const store = new Store({
  state: {
    count: 1
  }
});
store.commit({
  amount: 10
});
console.log(store.state.amount) // 输出10
```

### Mutation 需遵守规则

- 最好提前在你的 Store 中初始化好所有所需属性。
- **Mutation 必须是同步函数**

### 小程序中使用
```js
import { page } from 'mini-ali-de';
page({
  connector: {
    mutations: ['updateMessage']
  },
  onLoad() {
    this.updateMessage();
  }
})
```

## Action
Action 类似于 mutation，不同在于：

* Action 提交的是 mutation，而不是直接变更状态。
* Action 可以包含任意异步操作。

### 在 Store 中定义 Action

```js
const store = new Store({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  }
})
```

Action 函数接受一个与 Store 实例具有相同方法和属性的 context 对象，因此你可以调用 `context.commit` 提交一个 Mutation，或者通过 `context.state` 和 `context.getters` 来获取 State 和 Getter。当我们在之后介绍到 Module 时，你就知道 context 对象为什么不是 Store 实例本身了。

### 分发 Action
Action 通过 store.dispatch 方法触发：

```js
store.dispatch('increment')
```

乍一眼看上去感觉多此一举，我们直接分发 mutation 岂不更方便？实际上并非如此，还记得 **mutation 必须同步执行这个限制么**？Action 就不受约束！我们可以在 action 内部执行异步操作：

```js
actions: {
  async increment ({ commit }) {
    const amount = await getFromServer();
    commit('increment', amount);
  }
}
```

Actions 支持同样的载荷方式和对象方式进行分发：

```js
// 以载荷形式分发
store.dispatch('increment', {
  amount: 10
})
// 以对象形式分发
store.dispatch({
  type: 'increment',
  amount: 10
})
```

还支持 redux-thunk 函数方式进行分发:

```js
actions: {
  add({ commit }, n) {
		commit('add', n)
  }
}
const addFromServer = (arg1, ...args) => async (dispatch, getState) => {
  const n = await getFromServer();
  return dispatch('add', n);
  // console.log(arg1, args); -> 'arg1', ['arg2']
  // return getFromServer().then(n => dispatch('add', n));
}
await store.dispatch(addFromServer, 'arg1', 'arg2');
```

### 小程序中使用

```js
import { page } from 'mini-ali-de';
page({
  connector: {
    actions: ['getMessage']
  },
  onLoad() {
    this.getMessage();
  }
})
```

## Module
当 Store 的状态繁重或者各个状态隔离性较强时，把所有的状态放在一起使得业务变得复杂，不便于维护，所以 De 支持和 Vuex 类似的子模块管理方式（和 Vuex 不同的是 De 默认 namespace = true）。

### 在 Store 中定义 Module

```js
const moduleA = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}
const moduleB = {
  state: { ... },
  mutations: { ... },
  actions: { ... }
}
const store = new Store({
  state: { ... },
  mutations: { ... },
  actions: { ... },
  modules: {
    moduleA,
    moduleB
  }
})
store.state // -> 全部状态
store.state.moduleA // -> moduleA 的状态
store.state.moduleB // -> moduleB 的状态
```

### Module 中访问全局状态
对于模块内部的 Action，Action 函数同样接受 context 参数。局部状态通过 `context.state` 访问，根节点状态则通过 `context.rootState`访问：

```js
const moduleA = {
  // ...
  actions: {
    incrementIfOddOnRootSum({state, commit, dispatch, rootState}) {
      if ((state.count + rootState.count) % 2 === 1) {
        commit('increment')
      }
    }
  }
};
```

### 命名空间
当模块被注册后，它的所有 Getter、Action 及 Mutation，都会自动根据模块注册的路径命名。

```js
const moduleA = {
  state: {
    aCount: 0
  },
  mutations: {
    add(state, n) {
      state.aCount += n;
    }
  },
  actions: {
    add({state, commit, dispatch, rootState}, n) {
      commit('add', n)
    }
  }
};
const store = new Store({
  state: {
    count: 0
  },
  mutations: {
    add(state, n) {
      state.count += n;
    }
  },
  actions: {
    add({commit}, n) {
      commit('add', n);
    }
  },
  modules: {
    moduleA
  }
});
store.dispatch('add', 1); // store.state.count = 1;
store.dispatch('moduleA/add', 2); // store.state.moduleA.aCount = 1;
```

### 模块间触发
和 Vuex 一致，支持在 dispath 和 commit 中添加第三个配置参数 `{ root: true }` 来触发全局 actions/mutations, 也可以在不同的 modules 之间相互触发

```js
const moduleA = {
  state: {
    aCount: 0
  },
  mutations: {
    add(state, n) {
      state.aCount += n;
    }
  },
  actions: {
    add({state, commit, dispatch, rootState}, n) {
      commit('add', n); // commit 自身 add
      commit('add', n, { root: true }); // commit 全局 add
      commit('moduleB/add', n, { root: true }); // commit moduleB add
      dispatch('add', n, { root: true }); // dispatch 全局 add
      dispatch('moduleB/add', n, { root: true }); // dispatch moduleB add
    }
  }
};
const moduleB = {
  state: {
    bCount: 0
  },
  mutations: {
    add(state, n) {
      state.bCount += n;
    }
  },
  actions: {
    add({state, commit, dispatch, rootState}, n) {
      commit('add', n);
    }
  }
};
const store = new Store({
  state: {
    count: 0
  },
  mutations: {
    add(state, n) {
      state.count += n;
    }
  },
  actions: {
    add({commit}, n) {
      commit('add', n);
    }
  },
  modules: {
    moduleA,
    moduleB
  }
});
```

## Deps
用于小程序页面之间交互。当前 store 依赖的其他 store 实例，可触发依赖 store 的 action 和 commit 等等。让各 store 实例彼此互相独立，状态互不干扰。

### 在 Store 中定义 Deps

```js
// dep/Store.js
const depStore = new Store({
  actions: {
    todo() {};
  }
})

// The Store depend dep/Store.js
import depStore from './dep/store';
const store = new Store({
  state: {},
  deps: { dep: depStore }
});
store.dispatch("dep.todo");
```

### 结合Module一起使用

```js
// dep/Store.js
const depStore = new Store({
  actions: {
    todo() {}
  },
  modules:{
    moduleA: {
      actions: {
        moduleFunc() {}
      }
    }
  }
});

// The Store depend dep/Store.js
import depStore from './dep/store';
const store = new Store({
  state: {},
  deps: { dep: depStore }
});
store.dispatch("dep.todo/moduleFunc");
```

### Module 和 Dep 的选择
通过 modules 我们可以对每个页面维护一个 module，整个小程序使用单 store 方式构建。页面之间的交互直接通过模块之间的相互 dispath 来进行。那么问题来了: 我们应该怎样去选择 deps 和 modules 呢？对此我们的建议是：

* 页面之间交互异常复杂，状态共享很多时采用单 store 模式，通过 modules 的方式
* 页面之间交互比较简单、或者说页面之间相对独立没有交互时，采用多 store 模式，通过 deps 的方式

## Plugin
### 在 Store 中定义插件
De 支持 plugin 机制，在实例化 Store 时，传入的 Plugin 会依次加载。Plugin 就是一个函数，它接收 Store 作为唯一参数，在每次 Mutation 后会回调 Plugin 函数：

```js
const myPlugin = store => {
  // 当 store 初始化后调用
  store.subscribe((mutation, oldState, newState) => {
    // 每次 mutation 之后调用
  });
};
const store = new Store({
  state: { ... },
  mutations: { ... },
  actions: { ... },
  plugins: [myPlugin], // 插件
});
```

## Middleware
每次执行 `commit/dispatch/store.XXX` 等 store 方法时均会将中间件函数全部按顺序执行。<br />为什么相对于 Vuex 增加中间件?

* 更方便 commit/dispatch 的拦截/中断/修正/过滤
* 扩展性更好，可以对 store 的任何方法添加中间件
* vuex-logger 在启用 batch 时，多次 commit 只会打印一次日志

```js
import { Store, applyMiddleware } from 'mini-ali-de';
// 这儿和 redux 中间件写法完全一致，原则上和 redux 中间件可以通用
const logger = store => next => (mutation, payload, ...args) => {
  // 每次 commit 都会执行到这儿, mutation 可能是 Object/String
  console.log(mutation);
  next(mutation, payload, ...args)
};
const reportError = store => next => (action, payload, ...args) => {
  // 每次 diapatch 都会执行到这儿, action 可能是 Object/String
  try {
  	next(action, payload, ...args);
  } catch(e) {
    // reportError(e.stack);
	  console.log(e.stack);
  }
};
const pluginCommitMiddleware = applyMiddleware([logger]); // hook 默认为 'commit'
const pluginDispatchMiddleware = applyMiddleware([reportError], { hook: 'dispatch' });
const store = new Store({
  state: {},
  mutations: {},
}, {
  plugins: [
    pluginCommitMiddleware,
    pluginDispatchMiddleware
  ]
});
```
打印日志和本地持久化中间件实例

### 日志中间件样例

```js
/**
 * 日志中间件
 */
const { detailedDiff } = require("deep-object-diff");
const loggerMiddleware = store => next => (mutation, payload) => {
  let prevState;
  let nextState;
  console.group(`mutation: ${mutation}`);
  console.log('payload: ', payload);
  console.log('prevState: ', prevState = store.getState());
  next(mutation, payload);
  console.log('nextState: ', nextState = store.getState());
  const diffs = detailedDiff(prevState, nextState);
  console.log('diffs: ', diffs);
  console.groupEnd();
};
```
### 本地持久化中间件样例

```js
/**
 * 本地持久化中间件
 */
const deepEqual = require('deep-equal');
const storageMiddleware = store => next => (mutation, payload) => {
  const prevState = store.getState();
  next(mutation, payload);
  const nextState = store.getState();
  /**
   * 异步持久化
   */
  if (!deepEqual(prevState, nextState)) {
    setTimeout(() => localStorage.setItem('TODO', JSON.stringify(store.getState())));
  }
};
```
