import { prompt, Questions } from 'inquirer';

export async function question<QT>(prompts: Questions<QT>): Promise<QT> {
  return new Promise<QT>((resolve, reject) => {
    prompt(prompts).then(resolve, reject);
  });
}
