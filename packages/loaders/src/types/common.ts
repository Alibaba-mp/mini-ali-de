// tslint:disable-next-line:no-shadowed-variable
type ArgumentTypes<T> = T extends (...args: infer T) => any ? T : never;

type Callback<T, R = void> = (err: any, result: T) => R;

enum BaseBlockNames {
  template = 'template',
  script = 'script',
  style = 'style',
  dependency = 'dependency',
}

enum BaseLangs {
  template = 'html',
  script = 'js',
  style = 'css',
}

enum BaseBlockTypes {
  template = 'DE_SFC_TEMPLATE',
  script = 'DE_SFC_SCRIPT',
  style = 'DE_SFC_STYLE',
  dependency = 'DE_SFC_DEPENDENCY',
}
