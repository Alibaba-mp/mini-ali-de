import * as path from 'path';
const appxDevPath = path.resolve(__dirname, './appx-dev.js');
const appxBuildPath = path.resolve(__dirname, './appx-build.js');
const phonePath = path.resolve(__dirname, './phone.js');
const initPath = path.resolve(__dirname, './init.js');
export default {
  'appx-build': appxBuildPath,
  'appx-dev': appxDevPath,
  init: initPath,
  phone: phonePath,
};
