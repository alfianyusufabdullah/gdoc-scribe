import { StructuralElement, ProcessedBlock, ListItemNode, TocItem, ParagraphElement, Transformer } from './types';
export declare const slugify: (text: string) => string;
export declare const getParagraphText: (elements: ParagraphElement[]) => string;
export declare const processContent: (content: StructuralElement[], transformers?: Transformer[]) => ProcessedBlock[];
export declare const buildListTree: (items: StructuralElement[]) => ListItemNode[];
export declare const extractHeadings: (content: StructuralElement[]) => TocItem[];
export interface InlineContent {
    type: 'text' | 'code';
    content: string;
}
export declare const parseInlineContent: (text: string) => InlineContent[];
