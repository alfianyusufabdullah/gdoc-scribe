import { TextStyle, ParagraphStyle, Lists, InlineObjects, Dimension, Color } from './types';
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
export declare const getImageData: (objectId: string | null | undefined, inlineObjects: InlineObjects | null | undefined) => {
    src: string;
    alt: string;
} | null;
export declare const getDimensionStyle: (dimension: Dimension | undefined | null) => string | null;
export declare const getColorStyle: (color: Color | undefined | null) => string | null;
