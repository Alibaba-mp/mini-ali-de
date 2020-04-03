# API 参考
## Store
创建状态管理 store 实例：

```js
import { Store } from 'mini-ali-de';

const store = new Store({
  state: {},	   // 初始状态
  mutations: {}, // 状态改变方法
  actions: {},	 // 需要触发的事件
  modules: {},   // 子 module
  getters: {},   // store 计算属性
  plugins: [],   // 插件
  deps: {},      // store 依赖的其他实例
  batch: true,   // 是否开启批量更新
});
```

## Store 构造参数
### state
##### 类型：Object | Function
##### 说明：
store 实例的根 state 对象。
如果你传入返回一个对象的函数，其返回的对象会被用作根 state。这在你想要重用 state 对象，尤其是对于重用 module 来说非常有用。

### mutations
##### 类型：{ [type: string]: Function }
##### 说明：
在 store 上注册 mutation，处理函数总是接受 state 作为第一个参数（如果定义在模块中，则为模块的局部状态），payload 作为第二个参数（可选）。

### actions
##### 类型：{ [type: string]: Function }
##### 说明：
在 store 上注册 action。处理函数总是接受 context 作为第一个参数，payload 作为第二个参数（可选）。
context 对象包含以下属性：

```json
{
  commit,     // 等同于 `store.commit`
  dispatch,   // 等同于 `store.dispatch`
  state,      // 等同于 `store.state`，若在模块中则为局部状态
  rootState,  // 等同于 `store.state`，只存在于模块中
  getters,    // 等同于 `store.getters`
  rootGetters // 等同于 `store.getters`，只存在于模块中
}
```

### modules
##### 类型：Object
##### 说明：
包含了子模块的对象，会被合并到 store:
与根模块的选项一样，每个模块也包含 state 和 mutations 选项。模块的状态使用 key 关联到 store 的根状态。模块的 mutation 和 getter 只会接收 module 的局部状态作为第一个参数，而不是根状态，并且模块 action 的 context.state 同样指向局部状态。

  ```js
  const moduleA = {
	state: { ... },
	mutations: { ... },
	actions: { ... },
	getters: { ... },
	modules: { ... }
  }
  const store = new Store({
	state: { ... },
	mutations: { ... },
	actions: { ... },
	modules: {
	  moduleA
	}
  });
  ```

### getters
##### 类型：{ [type: string]: Function }
##### 说明：
在 store 上注册 getter，getter 方法接受以下参数：
* state,     // 如果在模块中定义则为模块的局部状态
* getters,   // 等同于 store.getters

当定义在一个模块里时,方法会多出两个参数：
* state,       // 如果在模块中定义则为模块的局部状态
* getters,     // 等同于 store.getters
* rootState    // 等同于 store.state
* rootGetters  // 所有 getters
 
注册的 getter 暴露为 store.getters。子 modules 的 getters 可通过 store.getters['moduleA/getterA'], 或者 store.getters.moduleA.getterA 这样来来访问。

### deps
##### 类型：{ [type: string]: Function }
##### 说明：
当前 store 依赖的其他 store 实例，可触发依赖 store 的 action 和 commit 等等。让各 store 实例彼此互相独立，状态互不干扰。基本使用:

```js
import testStore from './test/store';
const store = new Store({
  state: {},
  actions: {
    callTestAddTodo({ dispatch, commit }) {
      commit('test.addTodoMut');
      dispatch('test.addTodoAct');
    }
  },
  deps: { test: testStore }
});

// Page/Component 里你可以这样调用:
this.$dispatch('test.addTodoAct');
```

结合 module 一起使用:

```js
import testStore from './test/store';
const store = new Store({
  state: {},
  actions: {
    callTestAddTodo({ dispatch, commit }) {
      commit('test.todo/addMut');
      dispatch('test.todo/addAct');
    }
  },
  deps: { test: testStore }
});
// Page/Component 里你可以这样调用:
this.$dispatch('test.todo/addAct');
```

### plugins
##### 类型：{ [type: string]: Function }
##### 说明：
store 接受 plugins 选项，你也可以通过 use 方法去加载全局的插件，在实例化 store 时，第二个参数里传入的插件会依次加载。plugin 就是一个函数，它接收 store 作为唯一参数。

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

## Store 实例属性
### state
* 类型：Object（只读）
* 说明：state属性存储

### getters
* 类型：Object（只读）
* 说明：暴露出注册的 getter

## Store 实例方法
### commit
`commit(type: string, payload?: any, options?: Object)`

##### 入参

| 参数 | 解释 |
| --- | --- |
| type | 对应 mutation 中的方法名 |
| payload | 传给 mutation 的参数 |
| options<br />- root<br />- meta | 拓展参数，meta 可携带额外信息，若设置 root 为 true，允许在命名空间模块里提交根的 mutation |

##### 返回

void

##### 说明
提交 mutation。

```js
store.commit('increment', {
  amount: 10
})
```

`commit(mutation: { type: string, [key: string]?: any }, options?: Object)`

##### 入参

| 参数 | 解释 |
| --- | --- |
| mutation<br />- type<br /> | 对象风格的 mutation 提交方式：<br />如果参数中包含 type，则找到对应 type 的 mutation，<br />如果参数中不包含 type，则启用隐式 mutation，把整个参数当作payload，提交到 state 上。 |
| options<br />- root<br />- meta | 拓展参数， meta 可携带额外信息，若设置 root 为 true，允许在命名空间模块里提交根的 mutation |

##### 返回

void

##### 说明
提交 mutation。

```js
store.commit({
  type: 'increment', 
  amount: 10
});
```

`commit(payload: { [key: string]?: any }, options?: Object)`

##### 入参

| 参数 | 解释 |
| --- | --- |
| payload | 隐式 mutation 提交方式：把整个参数当作payload，提交到 state 上。 |
| options<br />- root<br />- meta | 拓展参数， meta 可携带额外信息，若设置 root 为 true，允许在命名空间模块里提交根的 mutation |

##### 返回

void

##### 说明
提交 mutation。

```js
store.commit({
  amount: 11
});
```

### dispatch
`dispatch(type: string, payload?: any, options?: Object)`

##### 入参

| 参数 | 解释 |
| --- | --- |
| type | 对应 action 中的方法名 |
| payload | 传给 action 的参数 |
| options<br />- root<br /> | 拓展参数，若设置root为true，允许在命名空间模块里提交根的 action |

##### 返回

返回一个解析所有被触发的 action 处理器的 Promise

##### 说明

```js
store.dispatch('increment', {
  amount: 10
})
```

`dispatch(action: { type: string, [key: string]?: any }, options?: Object)`

##### 入参

| 参数 | 解释 |
| --- | --- |
| action | 对象风格的 action 提交方式： |
| options<br />- root<br /> | 拓展参数，若设置root为true，允许在命名空间模块里提交根的 action |

##### 返回

返回一个解析所有被触发的 action 处理器的 Promise

##### 说明

```js
store.dispatch('increment', {
  amount: 10
})
```
### replaceState
`replaceState(state: Object)`

##### 入参
state: 被替换的state

##### 返回
void

> **注意：** 替换 store 的根状态，一般用状态合并或时光旅行调试，业务代码里慎用

### subscribe
`subscribe(handler: Function): Function`

##### 入参
* handler: handler 会在每个 mutation 完成后调用,接收以下三个参数
    - mutation， mutaion 参数
    - newState，经过 mutaion 之后的 state
    - oldState， mutation 之前的state
    
##### 返回

unsubscribe: Function。 要停止订阅，调用此方法返回的函数即可停止订阅。

##### 说明
订阅 store 的 mutation:

```js
let unsubscribe = store.subscribe((mutation, newState, oldState) => {
  console.log(mutation.type)
  console.log(mutation.payload)
  console.log(newState, oldState)
});
unsubscribe();
```

### watch
`watch(pathOrSelector: String|Function, onChange: Function)`

##### 入参
* pathOrSelector: 要观察的属性路径
* onChange：属性变化时触发的回调，函数接收两个参数
    - newValue: 属性改变后的值
    - oldValue：属性改变前的值

##### 返回
unwatch 函数，要停止监听，调用此方法返回的函数即可停止监听。

##### 说明
观察 state 中属性值的变化：

```js
 const unwatch = store.watch('count', (newCount, oldCount) => { // TODO: });
 store.watch('objectA.propertyB', (newB, oldB) => { // TODO: });
 store.watch(state => state.objectA.propertyB, (newB, oldB) => { // TODO: });
```

### watch.once
`watch.once(pathOrSelector: String|Function, onChange: Function)`

和 watch 用法一致，不过只绑定一次，回调执行后解绑。

### commitIM
和 commit 用法完全一致，立即提交数据更新。仅仅在启用了 batch 批量更新时有效。

## applyMiddleware
`applyMiddleware(middlewares: Function|Function[], hook: String): Plugin`

##### 入参
* middlewares
* hook

##### 返回
* plugin

##### 说明
中间件应用，返回 plugin 传入到 Store 构造器中或者 use 函数中

```js
import { Store, applyMiddleware, createLoggerMiddleware } from 'mini-ali-de';
const logger = applyMiddleware(createLoggerMiddleware);
const store = new Store(...option, { plugins: [logger] })
```

## use
`use(plugins: Function|Function[]): Function`

##### 入参
* plugins

#####  返回
unuse 函数，要卸载全局插件，调用此方法返回的函数即可。

##### 说明
use 方法是全局使用插件，调用后所有实例化的 Store 都将应用这些插件

```js
import { use, createLogger } from 'mini-ali-de';
const unuseLogger = use(createLogger());
```


## app
`app({ $store:store, onLaunch(){} })`

##### 入参
* options:  Object
    - $store: Store 实例
    - [key: string]: any; 在小程序 App 中声明的方法和生命周期方法
 
##### 说明
app 是基于小程序 App 做的一层封装

```js
import { app } from 'mini-ali-de';
import store from '/store';

app({
  $store: store,

  onLaunch() {
    this.$store.xxx
  }
});
```

## page
`page({ $store:store, onLoad(){} })`

##### 入参
* options:  Object
    - $store: Store 实例
    - connector: Object， 连接 Page 和 Store
      - state
      - actions
      - getters
      - mutations
    - [key: string]: any; 在小程序 Page 中声明的方法和生命周期方法

##### 说明
page 是基于小程序 Page 做的一层封装

```js
import { page } from 'mini-ali-de';
import store from './store';

page({
  $store: store,
  onLoad() {
    this.$store.xxx
  }
})
```

## component
`component({ $store:store, didMount(){} })`

##### 入参
* options:  Object
    - $store: Store 实例
    - connector: Object， 连接 Page 和 Store
      - state
      - actions
      - getters
      - mutations
    - [key: string]: any; 在小程序自定义组件中声明的方法和生命周期方法

##### 说明
component 是基于小程序 Component 做的一层封装

```js
import { component } from 'mini-ali-de';
import store from './store';

component({
  connector: {
    state: ['todos'],
    actions: ['updateTodo']
  },
  didMount() {
    this.$store.xxx
    this.updateTodo();
  }
});
```

## connector
connector 可以在 page 和 component 中使用

```js
import { component, page } from 'mini-ali-de';
import store from './store';

// 组件中使用
component({
  connector: {},
});

// 页面中使用
page({
  $store: store,
  connector: {},
});
```

```js
interface IStoreConnect<
  S extends Store<any, any, any, any>,
  SS extends S['$module']['state'],
  SG extends S['$getters'],
  SA extends S['$actions'],
  SM extends S['$mutations']
> {
  state?: Array<keyof SS> | Array<keyof SS | { [key: string]: keyof SS }> | { [key: string]: keyof SS } | { [key: string]: (state: SS) => SS[keyof SS] };
  getters?: Array<keyof SG> | Array<keyof SG | { [key: string]: keyof SG }> | { [key: string]: keyof SG } | { [key: string]: (state: SG) => SG[keyof SG] };
  actions?: Array<keyof SA> | Array<keyof SA | { [key: string]: keyof SA }> | { [key: string]: keyof SA };
  mutations?: Array<keyof SM> | Array<keyof SM | { [key: string]: keyof SM }> | { [key: string]: keyof SM };
}

connector: {
  state: ['a', 'b'];
  state: ['a', { b: 'b' }];
  state: [{ a: 'a' }, { b: 'b' }];
  state: { a: 'a', b: 'b' };
  state: { a: state => state.a, b: state=> state.b };
  
  // getters 和 state 完全一样
  getters: ['a', 'b'];
  getters: ['a', { b: 'b' }];
  getters: [{ a: 'a' }, { b: 'b' }];
  getters: { a: 'a', b: 'b' };
  getters: { a: state => state.a, b: state=> state.b };
  
  // actions
  actions: ['a', 'b'];
  actions: ['a', { b: 'b' }];
  actions: [{ a: 'a' }, { b: 'b' }];
  actions: { a: 'a', b: 'b' };

  // mutations
  mutations: ['a', 'b'];
  mutations: ['a', { b: 'b' }];
  mutations: [{ a: 'a' }, { b: 'b' }];
  mutations: { a: 'a', b: 'b' };
}
```
