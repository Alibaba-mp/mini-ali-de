import { MarkupGenerator } from '@de2/compiler';
import { CodeGenerator } from '@de2/compiler';
import { MarkupNode, MiniFileBlock, MiniNode, walk } from '@de2/compiler';

export function axmlGenerate(miniNode: MarkupNode) {
  const generate = new MarkupGenerator();
  const code = generate.generate(miniNode);
  return code;
}
