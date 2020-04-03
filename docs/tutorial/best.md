# 最佳实践

小程序页面共享 context，我们可以像 vue/react 的单页应用一样在页面间进行状态共享使得我们可以开发出交互性更强的应用。但是也埋下了一些坑：

* 页面/组件交互麻烦
* globalData 维护性差，不能响应式
* 页面的状态在离开页面后还存在于 context 中

为了解决这些问题 De 提供两种开发模式：

## 多 Store
### 背景
小程序页面多，页面之间的状态相对隔离，如果我们能在每个页面提供一个独立的 store 去管理会使逻辑更清晰。所以 De 默认采用多 Store 的开发方式

![多store](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*ugy7QZPvkyoAAAAAAAAAAABkARQnAQ)

### 优点
* 页面间状态隔离性好
* 多人协作开发更方便、容错性更好
* 和传统多页 H5 开发方式一致，小伙伴们更适应

### 缺点
* 页面间的交互性不如单 Store，但可以直接相互引用各个页面的 store 进行页面间的交互

### 实例

```js
// todo store
import { Store } from 'mini-ali-de';
import tStore from '../pages/test/store';

export default new Store({
  state: {},
  actions: {
    callTest({ dispatch, commit }) {
      tStore.dispatch('testAct'); // 触发 test 页面 testAct
    },
    callTodo({ dispatch, commit }) {
      tStore.commit('todoMut'); // 触发 test 页面 testAct
    },
  }
});
```

```js
// page
import { page } from 'mini-ali-de';
import store from './store';

page({
  $store: store,
  onLoad() {
    this.$store.dispatch('callTest');
  }
});
```

```js
// component
import { component } from 'mini-ali-de';

component({
  connector: {
    state: ['todos'],
    actions: ['clear'],
  },
  methods: {
    onClearCompletedTap() {
      this.clear();
    }
  }
});
```

## 单 Store
![单store](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*AY4TQorNisEAAAAAAAAAAABkARQnAQ)

### 优点
* 开发方式和传统 SPA 一致
* 页面间的交互非常方便：只需要触发相应 modules 的 action/mutations 即可
* 响应式更新：只需要你提交目标页面的 commit，目标页面视图层会及时更新

### 缺点
* Store 复杂度上升
* 页面间状态完全共享，可控性差
* commit 后的 diff 性能会相对多 Store 较差

### 示例

```js
// store
import { Store } from 'mini-ali-de';
import test from '../pages/test/store';
import todo from '../pages/todos/store';

export default new Store({
  state: {},
  modules: { test, todo }
});
```

```js
// app
import { app } from 'mini-ali-de';
import store from './store';

app({
  $store: store,
  onLaunch() {
    // this.$store.xxx
  }
});
```

```js
// page
import { page } from 'mini-ali-de';

// 单 store 的 page 和 component 不需要单独传入 store
page({
  onLoad() {
    // this.$store.xxx
  }
});
```

```js
// component
import { component } from 'mini-ali-de';

// 单 store 的 page 和 component 不需要单独传入 store
component({
  connector: {
    state: ['xxx']
  },
  didMount() {
    // this.$store.xxx;
  }
})
```
