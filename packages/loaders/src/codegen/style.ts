import less from 'less';
import _ from 'lodash';
import { log } from '../utils';

const con: StyleCons = {
  css: (data, options, callback) => callback(null, { data }),
  less: (data, options, callback) => {
    less.render(data, options, (err, output) => {
      callback(err, {
        data: _.get(output, 'css'),
        map: _.get(output, 'map') as any,
      });
    });
  },
};

const render = (lang: StyleLangs, data: StyleCodeGenParams['data'], options: StyleCodeGenParams['options']): Promise<StyleCodeGenResponse | never> =>
  new Promise((resolve, reject) => {
    con[lang](data, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

export default async function({ data, lang = 'css', options = {} }: StyleCodeGenParams) {
  if (!con[lang]) {
    const msg = `not support ${lang}`;
    log(msg);
    throw new Error(msg);
  }

  const res = await render(lang, data, options);
  return res;
}
