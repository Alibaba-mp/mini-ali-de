import { page } from 'mini-ali-de';
import store from './store';

page({
  $store: store,
  connector: {
    state: ['message', 'loading'],
  },
  onLoad() {
    console.log('Page onLoad');
  },
  handleOk() {
    this.$dispatch('handleOk');
  },
});
