import { StructuralElement, ProcessedBlock, ListItemNode, TocItem, ParagraphElement } from './types';
export declare const slugify: (text: string) => string;
export declare const getParagraphText: (elements: ParagraphElement[]) => string;
export declare const processContent: (content: StructuralElement[]) => ProcessedBlock[];
export declare const buildListTree: (items: StructuralElement[]) => ListItemNode[];
export declare const extractHeadings: (content: StructuralElement[]) => TocItem[];
