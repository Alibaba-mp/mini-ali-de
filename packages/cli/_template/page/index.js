import { page } from '@ali/de-core';
import store from './store';

page({
  $store: store,
  onLoad() {
    console.log('Page onLoad =>', this.data.message);
  },
});
