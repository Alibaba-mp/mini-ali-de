import { flatDeepDiff } from '@de2/helpers';
import { IDic, isEmpty } from '@de2/shared';
import { ESTORE_TYPE, IEConnectProps, IExtendsStore } from './interface';
import { getMappedGetters, getMappedState } from './mapHelper';

declare var my: any;

const mapStateHOC = (is4C?: boolean) => (
  store: IExtendsStore | undefined,
  { mapState, mapGetters, $$storeType, /* $$useGlobal, */ $$componentInitHook = () => {} }: IEConnectProps
) => (options: IDic) => {
  const initState = store && store.getState ? store.getState() : {};

  function mapper() {
    if (!store) {
      return;
    }

    const state = store.getState();
    let mappedState = getMappedState(state, mapState);
    if ($$storeType === ESTORE_TYPE.MULTI && isEmpty(mappedState)) {
      mappedState = state;
    }
    const mappedGetters = getMappedGetters(store.getters, mapGetters);
    const mappedSG = { ...this.data, ...mappedState, ...mappedGetters };

    return mappedSG;
    // const pComputed = { ...computed, ...options.computed };
    // const xComputed = getComputed.call(this, pComputed, state, mappedSG);
    // return { ...mappedSG, ...xComputed };
  }

  // function watcher() {
  //   const self = this;
  //   const flatWatch = flatten({ ...watch, ...options.watch });
  //   const watchKeys = Object.keys(flatWatch);
  //   if (!watchKeys.length) {
  //     return;
  //   }
  //   return watchKeys.map(item => {
  //     const onChange = flatWatch[item];
  //     return store.watch(item, onChange.bind(self));
  //   });
  // }

  function reaction(mutation: any) {
    if (!this.__unsubscribe) {
      return;
    }

    const nextData = mapper.call(this);
    if (mutation && mutation.meta && mutation.meta.disableDiff) {
      this.setData(nextData);
      return;
    }

    const diff = flatDeepDiff(this.data, nextData);
    if (diff) {
      if (mutation && mutation.meta && mutation.meta.splicePath && mutation.meta.spliceData && typeof this.$spliceData === 'function') {
        /**
         * 用于查看 commit 引起 setData 的情况
         * data => nextData
         */
        const isSpliceData = true;
        /**
         * 用于 store 插件查看
         */
        if (typeof store.$setDataHook === 'function') {
          store.$setDataHook({ context: this, mutation }, isSpliceData);
        }
        this.$spliceData({
          [mutation.meta.splicePath]: mutation.meta.spliceData,
        });
        return true;
      }

      if (typeof store.$setDataHook === 'function') {
        store.$setDataHook({ context: this, nextData, mutation, diff });
      }
      this.setData(diff);
    }
  }

  // store 和 global 做一次关联
  // if ($$useGlobal && options.$store) {
  //   options.$store.$global = $$useGlobal;
  // }

  if (is4C) {
    const componentDidMount = options.didMount;
    const componentDidUnmount = options.didUnmount;
    const componentDidUpdate = options.didUpdate;
    const componentOnInit = options.onInit;
    const component2 = typeof my !== 'undefined' && my.canIUse('component2');

    const didMount = function(args: any) {
      store = store || this.$page.$store;
      if (!component2) {
        $$componentInitHook.call(this);
      }
      this.setData(mapper.call(this));
      this.__unsubscribe = store.subscribe(reaction.bind(this));
      // this.__watchers = watcher.call(this, true);
      const ref = this.props.ref || this.props.$ref || this.props.aref;
      if (ref && typeof ref === 'string') {
        this.$page.$refs = this.$page.$refs || {};
        this.$page.$refs[ref] = this;
      }
      if (typeof componentDidMount === 'function') {
        componentDidMount.call(this, args);
      }
    };

    const didUpdate = function(prevProps: IDic, prevData: IDic) {
      if (typeof componentDidUpdate === 'function') {
        componentDidUpdate.call(this, prevProps, prevData);
      }
    };

    const didUnmount = function(args: any) {
      if (typeof this.__unsubscribe === 'function') {
        this.__unsubscribe();
      }
      // if (this.__watchers) {
      //   this.__watchers.forEach((uw: () => void) => uw && uw());
      // }
      if (typeof componentDidUnmount === 'function') {
        componentDidUnmount.call(this, args);
      }
    };

    const onInit = function(args: any) {
      store = store || this.$page.$store;
      $$componentInitHook.call(this);
      this.setData(mapper.call(this));
      if (typeof componentOnInit === 'function') {
        componentOnInit.call(this, args);
      }
    };

    return {
      ...options,
      didMount,
      didUnmount,
      didUpdate,
      ...(component2 && { onInit }),
    };
  } else {
    const apponLoad = options.onLoad;
    const apponShow = options.onShow;
    const apponReady = options.onReady;
    const appOnUnload = options.onUnload;
    const onLoad = function(args: any) {
      this.setData(mapper.call(this));
      this.__unsubscribe = store.subscribe(reaction.bind(this));
      // this.__watchers = watcher.call(this);
      if (typeof apponLoad === 'function') {
        apponLoad.call(this, args);
      }
    };
    const onUnload = function(args: any) {
      if (typeof this.__unsubscribe === 'function') {
        this.__unsubscribe();
      }
      // if (this.__watchers) {
      //   this.__watchers.forEach((unwatch: () => void) => unwatch && unwatch());
      // }
      if (typeof appOnUnload === 'function') {
        appOnUnload.call(this, args);
      }
    };

    const onShow = function(args: any[]) {
      if (typeof apponShow === 'function') {
        apponShow.call(this, args);
      }
      if (this.data.__DE_RESUME__ && typeof options.onResume === 'function') {
        options.onResume.call(this, args);
      }
    };
    const onReady = function(args: any[]) {
      if (typeof apponReady === 'function') {
        apponReady.call(this, args);
      }
      this.setData({ __DE_RESUME__: true });
    };

    return {
      ...options,
      onLoad,
      onReady,
      onShow,
      onUnload,
    };
  }
};

export const mapState = mapStateHOC();
export const mapState4C = mapStateHOC(true);
