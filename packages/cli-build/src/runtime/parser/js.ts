import * as babel from '@babel/core';

export function jsParse(JS: string, appxRootPath: string, filePath: string) {
  return new Promise<babel.ParseResult>((resolve, reject) => {
    babel.parse(
      JS,
      {
        filename: filePath,
        sourceRoot: appxRootPath,
      },
      (error: Error, result: babel.ParseResult) => {
        if (error) {
          return reject(error);
        } else {
          return resolve(result);
        }
      }
    );
  });
}
