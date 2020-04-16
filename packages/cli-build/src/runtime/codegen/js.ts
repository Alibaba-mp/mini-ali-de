import * as babel from '@babel/core';
import generator from '@babel/generator';
export function jsGenerator(parserResult: babel.ParseResult) {
  const { code } = generator(parserResult);
  return code;
}
