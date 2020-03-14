import { Store } from '@de2/store';
import { IStoreConnect } from './connect';
import { IPageInstance } from './page';
import { TSetDataMethod } from './shared';

interface IComponentLifeCycleMethods<D, P> {
  /**
   * 组件生命周期函数，组件创建时触发
   */
  onInit?(): void;

  /**
   * 组件生命周期函数，组件创建时和更新前触发
   *
   * @param nextProps 接收到的 props 数据
   */
  deriveDataFromProps?(nextProps: Partial<P>): void;

  /**
   * 组件生命周期函数，组件创建完毕时触发
   */
  didMount?(): void;

  /**
   * 组件生命周期函数，组件更新完毕时触发
   */
  didUpdate?(prevProps: Partial<P>, prevData: Partial<D>): void;

  /**
   * 组件生命周期函数，组件删除时触发
   */
  didUnmount?(): void;
}

export interface IComponentInstance<P, D, S extends Store<any, any, any, any>, SS extends S['state']> extends Record<string, any> {
  $store: S & { [key: string]: any };
  $dispatch: S['dispatch'];
  $commit: S['commit'];
  /**
   * 组件内部状态
   */
  readonly data: D & { [key: string]: any };

  /**
   * 传入组件的属性
   */
  readonly props: P;

  /**
   * 设置data触发视图渲染
   */
  setData: TSetDataMethod<D>;

  /**
   * 组件所属页面实例
   */
  readonly $page: IPageInstance<any, any, any>;

  /**
   * 组件 id，可直接在组件 axml 中渲染值
   */
  readonly $id: number;

  /**
   * 组件路径
   */
  readonly is: string;

  /**
   * 设置data触发视图渲染
   */
  $spliceData: (operations: { [k: string]: [number, number, ...any[]] }) => void;
}

export type TComponentOption<
  P extends Record<string, any>,
  D,
  M,
  S extends Store<any, any, any, any>,
  SS extends S['state'],
  SG extends S['getters'],
  SA extends S['actions'],
  SM extends S['mutations']
> = IComponentLifeCycleMethods<D, P> & {
  /**
   * 组件间代码复用机制
   */
  mixins?: any[];
  $store?: S;
  connector?: IStoreConnect<S, SS, SG, SA, SM>;

  /**
   * 组件内部状态
   */
  data?: D;

  /**
   * 为外部传入的数据设置默认值
   */
  props?: P;

  /**
   * 组件的方法，可以是事件响应函数或任意的自定义方法
   */
  methods?: M & ThisType<IComponentInstance<P, D, S, SS> & M>;
} & ThisType<IComponentInstance<P, D, S, SS> & M>;
