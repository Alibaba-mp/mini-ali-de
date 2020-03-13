export type TOnShareAppMessageOptions =
  | {
      from: 'button';
      target: Record<string, any>;
      webViewUrl?: string;
    }
  | {
      from: 'menu';
      webViewUrl?: string;
    };

export interface IOnShareAppMessageResult {
  title: string;
  desc?: string;
  path: string;
  content?: string;
  imageUrl?: string;
  bgImgUrl?: string;
  success?(): void;
  fail?(): void;
}

export type TSetDataMethod<D> = (data: Partial<D>, callback?: () => void) => void;

export type IPageScrollEvent =
  | [
      {
        readonly scrollTop: number;
        readonly scrollHeight: number;
      },
      null,
      null
    ]
  | {
      readonly scrollTop: number;
      readonly scrollHeight: number;
    };
