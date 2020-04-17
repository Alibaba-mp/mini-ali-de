import extractZipFn from 'extract-zip';

export async function extractZip(source: string, target: string) {
  return new Promise((resolve, reject) => {
    extractZipFn(
      source,
      {
        dir: target,
      },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
