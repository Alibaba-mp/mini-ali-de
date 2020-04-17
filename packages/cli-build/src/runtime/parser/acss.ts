import postcss from 'postcss';

export function acssParse(source: string, filePath: string) {
  const cssRoot = postcss.parse(source, { from: filePath });
  return cssRoot;
}
