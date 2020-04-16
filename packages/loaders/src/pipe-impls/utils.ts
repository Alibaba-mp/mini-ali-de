import _ from 'lodash';
import { resolve } from 'path';

export const r = (p: string) => resolve(__dirname, '../loaders/', p);
