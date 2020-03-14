import { Store } from '@de2/store';
import { IStoreConnect } from './connect';
import { IOnShareAppMessageResult, IPageScrollEvent, TOnShareAppMessageOptions, TSetDataMethod } from './shared';

interface IPageEvents {
  onBack?(): void;
  onKeyboardHeight?(): void;
  onOptionMenuClick?(): void;
  onPopMenuClick?(): void;
  onPullIntercept?(): void;

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh?(params: { from: 'manual' | 'code' }): void;
  onTitleClick?(): void;

  /**
   * 版本要求：基础库 1.11.0 或更高版本，若版本较低，建议做 兼容处理。
   * 点击标签（tab）时触发。
   */
  onTabItemTap?(item: { index: number; pagePath: string; text: string }): void;

  beforeTabItemTap?(): void;
}

interface IPageOptionsMethods
  extends Pick<IPageEvents, 'onPullDownRefresh' | 'onTitleClick' | 'onOptionMenuClick' | 'onPopMenuClick' | 'onPullIntercept' | 'onTabItemTap'> {
  /**
   * 生命周期函数--监听页面加载
   *
   * @param query query 参数为 my.navigateTo 和 my.redirectTo 中传递的 query 对象。
   */
  onLoad?(query: Record<string, string | number>): void;

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady?(): void;

  /**
   * 生命周期函数--监听页面显示
   */
  onShow?(): void;

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide?(): void;

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload?(): void;

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom?(): void;

  /**
   * 返回自定义分享信息
   */
  onShareAppMessage?(options: TOnShareAppMessageOptions): IOnShareAppMessageResult;

  /**
   * 页面滚动时触发
   *
   * @param event 滚动事件参数
   */
  onPageScroll?(event: IPageScrollEvent): void;
}

export interface IPageInstance<D, S extends Store<any, any, any, any>, SS extends S['state']> extends Record<string, any> {
  [key: string]: any;
  $store: S & { [key: string]: any };
  $dispatch: S['dispatch'];
  $commit: S['commit'];
  /**
   * 页面数据。
   */
  readonly data: D & { [key: string]: any };

  /**
   * 将数据从逻辑层发送到视图层，同时改变对应的 this.data 的值
   */
  setData: TSetDataMethod<D>;

  /**
   * 同setData，但是相比于setData，在处理长列表的时候，其具有更高的性能
   */
  $spliceData: (operations: { [k: string]: [number, number, ...any[]] }) => void;

  /**
   * Page 路径，对应 app.json 中配置的路径值。
   */
  readonly route: string;

  /**
   * 批量更新数据。
   */
  $batchedUpdates: (fn: () => void) => void;
}

/**
 * Page 实现的接口对象
 */
export type TPageOption<
  D,
  S extends Store<any, any, any, any>,
  SS extends S['state'],
  SG extends S['getters'],
  SA extends S['actions'],
  SM extends S['mutations']
> = IPageOptionsMethods & {
  mixins?: any[];
  $store?: S;
  connector?: IStoreConnect<S, SS, SG, SA, SM>;

  [key: string]: any;
  /**
   * 初始数据或返回初始化数据的函数, 为对象时所有页面共享。
   */
  data?: D;

  /**
   * 事件处理函数集合。
   */
  events?: IPageEvents;
} & ThisType<IPageInstance<D, S, SS>>;
