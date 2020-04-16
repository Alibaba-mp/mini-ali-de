import { IConstructor } from './../utils';

export type IDePipe<T extends any[], K> = (...args: T) => K;

export interface IDePipeline<DEP extends Record<string, IDePipe<any, any>>, T extends any[], K = any> {
  initPipe(depPipes: DEP): void;
  invokePipes(...args: T): K;
}

export function invokePipeline<DEP extends Record<string, IDePipe<any, any>>, T extends any[], K = any>(
  PipeLineKlass: IConstructor<IDePipeline<DEP, T, K>>,
  dep: DEP,
  t: T
): K {
  const pipeline = new PipeLineKlass();
  pipeline.initPipe(dep);
  return pipeline.invokePipes(...t);
}
