import * as pipes from '@de2/loaders';
import { IDeBuildPipeInputArgs, IDeBuildWebpackConfigPipe } from '../interface';

export const tsPipe: IDeBuildWebpackConfigPipe = (option: IDeBuildPipeInputArgs) => {
  return pipes.tsPipe(option);
};
