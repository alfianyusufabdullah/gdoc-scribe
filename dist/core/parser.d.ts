import { TextStyle, ParagraphStyle, Lists } from './types';
export interface SemanticTag {
    tag: string;
    attrs?: Record<string, string>;
}
export interface ListTagResult {
    tag: string;
    styleType: string;
}
export declare const getTextTags: (style: TextStyle | undefined) => SemanticTag[];
export declare const getHeadingTag: (style: ParagraphStyle | undefined) => string;
export declare const getListTagAndStyle: (listId: string | null | undefined, nestingLevel: number | null | undefined, docLists: Lists | null | undefined) => ListTagResult;
export declare const getAlignmentStyle: (alignment: string | undefined) => string | undefined;
