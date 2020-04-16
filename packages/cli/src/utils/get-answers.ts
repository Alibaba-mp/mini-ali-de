import * as inquirer from 'inquirer';
import * as path from 'path';
import { ErrorCollection } from './collection';

export default async function getAnswers(destDir: string, isDefault: boolean) {
  const metaFile = path.resolve(destDir, '.meta.js');
  const questions: inquirer.Question[] = require(metaFile).question;
  if (!isDefault) {
    console.log(0);
    try {
      const prompt = inquirer.createPromptModule();
      return await prompt(questions);
    } catch (e) {
      throw ErrorCollection.GET_META_ERROR(metaFile, e.message, e.stack);
    }
  } else {
    console.log(1);
    const answers: any = {};
    for (const question of questions) {
      answers[question.name] = question.default;
    }
    return answers;
  }
}
