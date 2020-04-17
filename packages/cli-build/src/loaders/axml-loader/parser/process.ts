import { ParserFile } from '@de2/compiler';
import { DeAxmlParser } from './parser';
import { DeAxmlTraverser } from './traverser';

/**
 * @param filePath
 * @param content
 */
export function processAxml(filePath: string, content: string) {
  const file = new ParserFile(filePath, content);
  const parser = new (DeAxmlParser as any)(file);
  const miniNode = parser.parse();
  const traverser = new (DeAxmlTraverser as any)(miniNode);
  traverser.walk();
  return {
    axmlRequests: traverser.getAxmlImportRequests(),
    sjsRequests: traverser.getSjsImportRequests(),
  };
}
