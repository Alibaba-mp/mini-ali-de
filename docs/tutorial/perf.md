# 优化增强

## 运行机制
响应式运行机制：用户操作界面通过 dispatch 发起一个 action（也可以直接通过 commit 操作状态变更），在 action 中通过 commit 操作 mutation 进行状态变更，数据变更（Store Change）后通知所有订阅（Subscribe）变更的页面和组件，页面/组件拿到变更后的数据和自身原有的数据（this.data）做一次对比（flatDeepDiff），然后检测是否需要通过 $spliceData 进行页面刷新，最后响应用户操作视图更新。

![](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*KD1SRZgyiwMAAAAAAAAAAABkARQnAQ)

## 性能优化
由于 De 接管了小程序的 setData 数据响应，所以我们可以在 De 框架层面对小程序做一些性能优化，通过小程序官方文档中提到的性能优化建议，我们能够总结出优化的方向主要有两个：

* 减少 ipc 通信成本
  - 1、最小化 setData 数据量
  - 2、最小化 setData 频次
  - 3、长列表采用 $spliceData 更新

* 减少渲染层 diff + patch 成本
  - 1、减少 page.setData
  - 2、尽量采用 component.setData

为了实现以上两个优化方向，De 做了以下几项工作：

### batch
**batch 可以减少 setData 频次**，当页面流程复杂时，我们可能需要进行逻辑拆分、这样会让 commit 分散，造成 setData 的次数很多，当开启 batch 时，在一帧内(16ms)不管触发多少次 commit 都只会触发一次 Store 改变 => 调用一次 setData => 引起一次视图刷新，从而极大地减少了 setData 频次。

```js
// 启用方法
import { Store } from 'mini-ali-de';

export default new Store({
  batch: true,
  //...
});
```

### flatDeepDiff
**flatDeepDiff 可以减少 setData 数据量**，当页面状态较多或者状态数据量很大时，由于小程序的跨进程通信需要将这些数据序列化和反序列化这个过程比较消耗性能，所以导致页面卡顿。De 会在每次 setData 前将组件/页面的状态进行深度对比，将对比后得到的 diff 数据进行 setData，从而提升小程序整体性能。

![flatDeepDiff](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/35272/1566245671060-ca2e9e08-9c35-43f8-8765-f9033aafead4.png) 
*flatDeepDiff 性能对比（objA 和 objB 均为 8k 的字符串）*

shallowEqual > flatDeepDiff + immer > _.isEquals > Object.equals > flatDeepDiff > JSON.stringify
可以看出 De 采用的 flatDeepDiff + immer 性能和 shallowEqual 是一个量级的，并且单独的 flatDeepDiff 性能也会比序列化反序列化更快

### $spliceData
**$spliceData 可以提升长列表性能**，De 在某一次 commit 时你可以指定其采用 $spliceData 进行视图更新

* 列表某一项删除、列表向前增加时

```js
commit(type, payload, {
  meta: {
    splicePath: 'path', // eg. 'todos'
    spliceData: [start, deleteCount, ...items] // eg. [0, 0, { completed: false, value: 'hello' }]
  }
});
// => this.$spliceData({ [splicePath]: spliceData })
```

> **约定**：如果其他组件/页面 connector 了 store 里的同一个状态，在使用 commit $spliceData 时，splicePath 不区分组件和页面，需要保持各组件/页面的一致性

* 列表更新(长度不变)、列表向后增加时

```js
prevList = { items: [{a: 1}, {a: 2}, {a: 3}, ..., {a: 1000}] }
nextList = { items: [{a: 1}, {a: 2}, {a: 3}, ..., {a: 1000}, ..., {a: 1020}] }
diff = { items[1001]: {a: 1001}, items[1002]: {a: 1002}, ..., items[1020]: {a: 1020} }
setData = setData(diff);
```

De 内部的 flatDeepDiff 会将长列表的 append 部分 diff 出来进行 setData(也可以通过方式1)

### connector
**connector 可以减少页面级 setData**，拆分模块组件后，通过 connector 将 Store 状态直接关联上组件，当进行组件状态更新时不再由页面 setData 后通过 props 传递到组件进行组件更新，而是直接调用组件 setData。同时还能减少页面状态，降低 De 底层进行 diff 操作的成本，提高应用整体性能

```js
// page connector
import { page } from 'mini-ali-de';
import store from './store';

page({
  $store: store,
  connector: {
    state: ['a', 'b']
  },
  onLoad() {
    // this.data.a
  }
})
````

```js
import { component } from 'mini-ali-de';
import store from './store';

component({
  connector: {
    state: ['c', 'd']
  },
  didMount() {
    // this.data.c
  }
})
````

## 功能增强

### lifecycle
增加 onResume 生命周期：页面激活时触发，和 onShow 的区别是页面初始化时仅触发 onShow，而不会触发 onResume
![lifecycle](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*N64MTIWHc1EAAAAAAAAAAABkARQnAQ)

```js
page({
  onResume() {
    // console.log('页面重新回到前台');
  }
});
```

### $refs
从小程序优化建议我们可以了解到，我们应该尽量避免整个 Page 的 setData, 所以在 Page 里面获取组件实例可以很好的操作组件实例。具体方法如下:

```js
// template
<view class="page-todos">
  <todo-user $ref="user" />
</view>

// script
page({
 // 注意：不能在 onLoad 中获取 refs，因为 onLoad 的时候组件还没有 didMount
 onReady() {
   const user = this.$refs.user;
 }
});
```

### mixins
和组件 mixins 一样，你可以在 page 中使用 mixins 进行公共逻辑要处理。

```js
const logMinin = {
  onLoad() {
    // 页面埋点等通用逻辑
  },
};

page({
  mixins: [logMinin],
  onLoad() {
    // TODO:
  }
});
```

### watch
状态变化监听，可以精确地监听状态树的每一个状态节点的变化

```js
page({
 onLoad() {
   this.$watch('loaded', () => {
     // TODO:
   });
 }
});
```

### logger
通过 De 的 logger 插件，你可以清楚地看到页面具体交互流水线(mutationLogger)，还可以很精确查看页面 setData 的数据(diffData)，而不用像 IDE/bugme 提供的 logger 把页面每次更新的全量状态打印。

![logger](https://intranetproxy.alipay.com/skylark/lark/0/2019/png/35272/1566272488644-942394c1-1b59-4465-8ade-a56a33f9e059.png) 

```js
import { createLogger, createSetDataLogger, Store } from 'mini-ali-de';

export default new Store({
  state: {},
  actions: {},
  plugins: [createLogger(), createSetDataLogger()]
});
````
