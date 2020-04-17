import { MiniImportBlock, MiniImportSjsBlock, MiniIncludeBlock, MiniNode, MiniNodeTraverser } from '@de2/compiler';
import { DeAXMLTraverseState } from './state';

export class DeAxmlTraverser extends MiniNodeTraverser<any> {
  protected state: any = new DeAXMLTraverseState({
    parent: null,
    scopeStack: [],
  });

  private importAxmlRequests: Set<string> = new Set();
  private importSjsRequests: Set<string> = new Set();

  public beforeImportBlock(node: MiniImportBlock, state: DeAXMLTraverseState): DeAXMLTraverseState {
    const importRequest = node.src.value;
    this.importAxmlRequests.add(importRequest);
    return state;
  }
  public beforeImportSjsBlock(node: MiniImportSjsBlock, state: DeAXMLTraverseState): DeAXMLTraverseState {
    if (!node.from) {
      throw node.getStartLocation().getError(`import-sjs 内需要有 from 指定 sjs 路径`);
    }
    const importRequest = node.from.value;
    this.importSjsRequests.add(importRequest);
    return state;
  }
  public beforeIncludeBlock(node: MiniIncludeBlock, state: DeAXMLTraverseState): DeAXMLTraverseState {
    const importRequest = node.src.value;
    this.importAxmlRequests.add(importRequest);
    return state;
  }
  public getSjsImportRequests() {
    return Array.from(this.importSjsRequests);
  }
  public getAxmlImportRequests() {
    return Array.from(this.importAxmlRequests);
  }
}
