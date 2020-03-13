import { IConnectorProps, IConnectProps } from '@de/relation';
import { isEmpty } from '@de/shared';

export function connectProps2MapProps(connector: IConnectorProps) {
  if (!connector || isEmpty(connector)) {
    return;
  }

  const $connect: IConnectProps = {};
  Object.keys(connector).forEach(item => {
    switch (item) {
      case 'state':
        $connect.mapState = connector.state;
        break;
      case 'getters':
        $connect.mapGetters = connector.getters;
        break;
      case 'actions':
        $connect.mapActions = connector.actions;
        break;
      case 'mutations':
        $connect.mapMutations = connector.mutations;
        break;
        // case 'computed':
        //   $connect.computed = connector.computed;
        //   break;
        // case 'watch':
        //   $connect.watch = connector.watch;
        //   break;
        // case '$$resetState':
        //   $connect.$$resetState = connector.$$resetState;
        //   break;
        // case '$$middlewares':
        //   $connect.$$middlewares = connector.$$middlewares;
        break;
      default:
        break;
    }
  });

  return $connect;
}
