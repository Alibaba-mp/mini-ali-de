## Mini Ali De 是什么?
Mini Ali De 不仅仅是小程序框架，也为小程序开发提供全链路、创新解决方案；它基于原生 DSL 进行优化增强完善生态，旨在提升性能和研发效率，让开发者更聚焦业务。

## 特性
- **原生 DSL**：上手简单，可控性强，灵活性高
- **状态管理**：脱离 Vue 的 Vuex API 对齐和增强，无学习成本
- **性能优化**：batch / flatDeepDiff 等，开发者无需考虑性能问题
- **数据响应**：watch / getters 等，组件、页面间进行响应式更新
- **Webpack 预编译[@de2/cli 提供]**：less / ts 等，有 Webpack 啥都能干（比如单文件开发等）
- **小程序增强**：mixin / onResume / logger，托管 App / Page/ Component 功能增强想象空间大
- **渐进接入**：可逐个页面接入，能够兼容原生代码，即部分页面为原生小程序，部分页面为 mini-ali-de
- **稳定性**：拥有森林/庄园/运动/新春等支付宝 top10 亿级小程序，阿里巴巴各大 bu 使用

## 理念
舍弃业界主流小程序框架（wepy、mpvue、taro）将其他语法规范编译成小程序语法规范的方案，采用原生小程序语法规范进行增强、优化的方式来提高小程序开发效率。主要的设计理念有：

- **全透明不包装**：采用小程序原生 DSL，具有可预、可控性
- **约束&约定&扩展**：约束约定和扩展相结合的方式，统一技术栈的同时保持项目的扩展性
- **高性能**：保证小程序底层性能，在上层进行 batch 和 diff 等一系列性能优化
- **轻量级**：以模块和插件形式提供功能，减少运行时开销的同时更灵活的组合使用模块

## 例子

```xml
<!-- axml -->
<view class="container">
  <view class="message">{{count}}</view>
  <button class="btn" onTap="increment">+</button>
</view>
```

```css
/* acss */
.container { width: 100%; }
.message { margin: 10px; text-align: center; }
.btn { margin: 10px; }
```

```js
// js
import { page, Store } from 'mini-ali-de';
// store
const store = new Store({
  state: { count: 0 },
  mutations: {
    increment(state, { num }) {
      state.count += num;
    }
  }
});
// page
page({
  $store: store,
  increment() {
    this.$commit('increment', { num: 1 });
  }
});
```

点击按钮  +  , 按钮上面的数字将会相应的 +1。
**注意**：实际开发过程中，store 应单独抽离，不应该放在页面的 js 中，推荐使用 mini-ali-de 官方提供的脚手架进行业务开发。

![demo](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*AcMqQrBSyqoAAAAAAAAAAABkARQnAQ) 

## 链接
- [支付宝小程序开发文档](https://mini.open.alipay.com/channel/miniIndex.htm)
- [小程序开发工具](https://docs.alipay.com/mini/ide/overview)

## 钉钉群

![钉钉群](https://gw.alipayobjects.com/mdn/social_tod/afts/img/A*B_3UTrnyuw0AAAAAAAAAAABkARQnAQ)
