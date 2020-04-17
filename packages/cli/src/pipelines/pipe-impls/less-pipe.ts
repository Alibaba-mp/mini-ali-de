import * as pipes from '@de2/loaders';
import { IDeBuildPipeInputArgs, IDeBuildWebpackConfigPipe } from '../interface';

export const lessPipe: IDeBuildWebpackConfigPipe = (option: IDeBuildPipeInputArgs) => {
  return pipes.lessPipe(option);
};
