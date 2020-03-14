import { Store } from '@de2/store';

export interface IStoreConnect<
  S extends Store<any, any, any, any>,
  SS extends S['state'],
  SG extends S['getters'],
  SA extends S['actions'],
  SM extends S['mutations']
> {
  state?: Array<keyof SS> | Array<keyof SS | { [key: string]: keyof SS }> | { [key: string]: keyof SS } | { [key: string]: (state: SS) => SS[keyof SS] };
  getters?: Array<keyof SG> | Array<keyof SG | { [key: string]: keyof SG }> | { [key: string]: keyof SG } | { [key: string]: (state: SG) => SG[keyof SG] };
  actions?: Array<keyof SA> | Array<keyof SA | { [key: string]: keyof SA }> | { [key: string]: keyof SA };
  mutations?: Array<keyof SM> | Array<keyof SM | { [key: string]: keyof SM }> | { [key: string]: keyof SM };
}
