# Hooks

> beta

## 简介

De Hooks 是一个不依赖 React 脱离任何框架在小程序中使用 Hooks 来构建代码的工具库，它遵循 React Hooks [规则](https://zh-hans.reactjs.org/docs/hooks-rules.html):

* 只在最顶层使用 Hook（不要在循环，条件或嵌套函数中调用 Hook）
* 不要在普通的 JavaScript 函数中调用 Hook（只能在 hooks 提供的 Page/Component 函数内使用）

> [React Hooks 简介](https://zh-hans.reactjs.org/docs/hooks-intro.html)

## 安装

```sh
tnpm i @de2/hooks
```

## 使用

### 引入

```js
import {
  Page,  // 使用类似 React Hooks 的方式来写页面
  Component, // 使用类似 React Hooks 的方式来写组件
  useState, // 和 React Hooks useState 一致
  useEffect, // 和 React Hooks useEffect 一致
  useLayoutEffect, // 和 React Hooks useLayoutEffect 一致
  useReducer, // 和 React Hooks useReducer 一致
  useCallback, // 和 React Hooks useCallback 一致
  useMemo, // 和 React Hooks useMemo 一致
  useMethods, // https://github.com/pelotom/use-methods
  useRef, // 和 React Hooks useRef 一致，新增 callback 用于在 ref 变化时回调
  useLifeCycle, // 小程序生命周期的副作用 hook
  useOnLoad, // 页面 onLoad... hook
  useDidMount, // 组件 didMount... hook
} from '@de2/hooks';
```

### 简单使用

useState + useEffect

* component.axml

```html
<view class="counter">
  <view>Count: {{ count }}</view>
  <button onTap="increment">+</button>
  <button onTap="decrement">-</button>
</view>
```

* component.ts

```typescript
import { Component, useEffect, useState } from '@de2/hooks';

Component(function() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Counter count: ', count);
  }, [count]);

  return {
    count,
    decrement: () => setCount(count - 1),
    increment: () => setCount(count + 1),
  };
});
```

### 高级使用

useReducer

* component.ts

```typescript
import { Component, useEffect, useReducer } from '@de2/hooks';

const initialState = { count: 0 };
const reducer = (state: { count: number }, action: { type: string }) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error('action type is not found!');
  }
};

Component(function() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Reducer count:', state.count);
    }, 1000);
    // 清除副作用
    return () => clearInterval(timer);
  }, [state.count]);

  return {
    count: state.count,
    increment: () => dispatch({ type: 'increment' }),
    decrement: () => dispatch({ type: 'decrement' }),
  };
});
```

useMethods

* component.ts

```typescript
import { Component, useMethods, useEffect } from '@de2/hooks';

const initialState = { count: 0 };
const methods = (state: any) => ({
  increment() {
    state.count++;
  },
  decrement() {
    state.count--;
  },
});

Component(() => {
  const [{ count }, { increment, decrement }] = useMethods(methods, initialState);

  useEffect(() => {
    console.log('Method Count:', count);
  }, [count]);

  return {
    count,
    decrement,
    increment,
  };
});
```

useLifeCycle

* page.ts

```typescript
import { Page, useState, useEffect, useOnLoad, useLifeCycle } from '@de2/hooks';

Page(() => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Counter count: ', count);
  }, [count]);

  useOnLoad(() => {
    console.log('Page onLoad');
  });

  useLifeCycle('onReady', () => {
    console.log('Page onReady');
  });

  return {
    count,
    increment: () => setCount(count + 1),
    decrement: () => setCount(count - 1),
  };
});
```

## API

* **Page**\<S\>(create: () => Record<string, any>, initialState?: (() => S) | S): void
* **Component**\<S\>(create: () => Record<string, any>, initialState?: (() => S) | S): void
* **useState**\<S\>(initialState: (() => S) | S): [S, (newStateOrStateTransformer: ((state: S) => S) | S) => void]
* **useEffect**(create: () => (() => void) | void, deps: any[] | void | null): void
* **useLayoutEffect**(create: () => (() => void) | void, deps: any[] | void | null): void
* **useReducer**\<S, I, A\>(
  reducer: (state: S, action: A) => S,
  initialState: any,
  initializer?: (state: I) => S
): [S, (s: S, action: A) => TDispatch\<S\>]
* **useRef**\<T\>(initialValue: T | null, callback?: (newValue: T | null, lastValue: T | null) => void): IMutableRefObject<T | null>;
* **useMemo**\<T\>(create: () => T, deps: any[] | void | null): T
* **useCallback**\<T\>(callback: T, deps: any[] | void | null): T
* **useMethods**: immer in hooks [https://github.com/pelotom/use-methods](https://github.com/pelotom/use-methods)

* **useLifeCycle**(lifeCycleName: TLifeCycle, callback: (...args: any[]) => any) {
* **Page LifeCycle:**
  useOnLoad,
  useShow,
  useReady,
  useHide,
  useUnload,
  useTitleClick,
  usePullDownRefresh,
  useReachBottom,
  useShareAppMessage,

* **Component LifeCycle:**
  useOnInit,
  useDeriveDataFromProps,
  useDidMount,
  useDidUpdate,
  useDidUnmount,

## 参考

### React Hooks

```js
import { useState, useEffect } from 'react';
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('count update: ', count);
  }, [count]);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

### Vue Composition API

```js
// Vue
import { value, computed, watch, onMounted } from 'vue'
const Counter = {
  template: `
    <div>
      <span>count is {{ count }}</span>
      <span>plusOne is {{ plusOne }}</span>
      <button @click="increment">count++</button>
    </div>
  `,
  setup() {
    // reactive state
    const count = value(0)
    // computed state
    const plusOne = computed(() => count.value + 1)
    // method
    const increment = () => { count.value++ }
    // watch
    watch(() => count.value * 2, val => {
      console.log(`count * 2 is ${val}`)
    })
    // lifecycle
    onMounted(() => {
      console.log(`mounted`)
    })
    // expose bindings on render context
    return {
      count,
      plusOne,
      increment
    }
  }
}
```
