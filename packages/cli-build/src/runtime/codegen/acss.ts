import postcss from 'postcss';

export function acssGenerate(root: postcss.Root) {
  const result = root.toResult();
  return result.css;
}
