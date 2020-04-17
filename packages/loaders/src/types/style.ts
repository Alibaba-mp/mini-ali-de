type StyleLangs = 'css' | 'less';

type StyleCons = {
  [Lang in StyleLangs]: (data: string, options: StyleCodeGenParams['options'], callback: Callback<StyleCodeGenResponse>) => void;
};

// tslint:disable-next-line:interface-name
interface StyleCodeGenResponse {
  data: string;
  map?: any;
}

// tslint:disable-next-line:interface-name
interface StyleCodeGenParams {
  /**
   * @description 待编译的 style 字符串
   */
  data: string;
  lang?: StyleLangs;
  options?: any;
}
