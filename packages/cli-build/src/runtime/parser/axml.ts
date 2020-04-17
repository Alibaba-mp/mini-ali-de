import { MarkupParser, ParserFile } from '@de2/compiler';
class DeAxmlParser extends MarkupParser {}

export function axmlParse(source: string, file: string) {
  const miniParser = new (DeAxmlParser as any)(new ParserFile(file, source));
  const miniNode = miniParser.parse();
  return miniNode;
}
