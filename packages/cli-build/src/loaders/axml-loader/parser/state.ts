import { MiniConditionBranch, MiniNode, MiniNodeTraverseState, MiniScope } from '@de2/compiler';

export class DeAXMLTraverseState extends MiniNodeTraverseState {
  // public readonly markupParent: MarkupNode;
  // public readonly slotName: string;
  // public readonly slotScope: string;
  // public readonly childIndex: number;
  // public readonly childLength: number;
  // public readonly context: FragmentProcessorContext;

  constructor(opt: {
    // markupParent: MarkupNode;
    parent?: MiniNode;
    scopeStack: any[];
    // slotName?: string;
    // slotScope?: string;
    condition?: MiniConditionBranch;
    // childIndex?: number;
    // childLength?: number;
    // context: FragmentProcessorContext;
  }) {
    super(opt.parent, opt.scopeStack, opt.condition);
    // this.markupParent = opt.markupParent;
    // this.slotName = opt.slotName;
    // this.slotScope = opt.slotScope;
    // this.childIndex = opt.childIndex;
    // this.childLength = opt.childLength;
    // this.context = opt.context;
  }

  public replace(opt: {
    // markupParent?: MarkupNode;
    parent?: MiniNode;
    scope?: MiniScope;
    // slotName?: string;
    // slotScope?: string;
    bypassCondition?: MiniConditionBranch;
    // childIndex?: number;
    // childLength?: number;
  }): this {
    return new DeAXMLTraverseState({
      // childIndex: opt.childIndex === undefined ? this.childIndex : opt.childIndex,
      // childLength: opt.childLength === undefined ? this.childLength : opt.childLength,
      condition: opt.bypassCondition,
      // // context: this.context,
      // // markupParent: opt.markupParent || this.markupParent,
      parent: opt.parent || this.parent,
      scopeStack: opt.scope ? [...this.scopeStack, opt.scope] : this.scopeStack,
      // slotName: opt.slotName === undefined ? this.slotName : opt.slotName,
      // slotScope: opt.slotScope === undefined ? this.slotScope : opt.slotScope,
    }) as any;
  }
}
