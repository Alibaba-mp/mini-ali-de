import { Configuration } from 'webpack';

// tslint:disable-next-line:interface-name
export interface DEBuildConfig {
  webpackConfig: Configuration;
  deConfig: {
    input: string;
    output: string;
    [key: string]: any;
  };
  [key: string]: any;
}
