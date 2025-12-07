import { GoogleDoc, StructuralElement, Paragraph, Table, InlineObjects, TocItem, Transformer, CodeBlock, ClassNames } from '../core/types';
export interface VanillaRenderers {
    paragraph?: (p: Paragraph, inlineObjects?: InlineObjects | null) => HTMLElement;
    list_group?: (items: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: any) => HTMLElement;
    code_block?: (block: CodeBlock) => HTMLElement;
    table?: (table: Table, inlineObjects?: InlineObjects | null, lists?: any) => HTMLElement;
    image?: (objectId: string | null | undefined, inlineObjects?: InlineObjects | null) => HTMLElement | null;
}
export interface ScribeOptions {
    renderers?: VanillaRenderers;
    transformers?: Transformer[];
    classNames?: ClassNames;
}
export declare class GDocScribe {
    private doc;
    private inlineObjects;
    private options;
    constructor(doc: GoogleDoc, options?: ScribeOptions);
    getToc(): TocItem[];
    render(target: HTMLElement): void;
    private renderCodeBlock;
    private renderParagraph;
    private renderTextRun;
    private renderListGroup;
    private renderListTree;
    private renderTable;
    private renderImage;
    private openLightbox;
}
