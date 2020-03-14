import { IPActionPayload, IPMutationPayload } from '@de2/shared';
import { Store } from '../';
import { TAction, TMutation } from './';

export enum EMiddlewareHooks {
  COMMIT = 'commit',
  DISPATCH = 'dispatch',
  SUBSCRIBES = 'subscribe',
  EXEC_SUBSCRIBES = '_execSubscribes',
}

export type TMiddleware<S, G, M, A> = (
  store: Store<S, G, M, A>,
  opts: { hook?: EMiddlewareHooks }
) => (
  next: Store<S, G, M, A>[EMiddlewareHooks]
) => (mutation: TMutation<S, G, M, A> | TAction<S, G, M, A>, payload: IPMutationPayload | IPActionPayload, ...args: any[]) => void;
