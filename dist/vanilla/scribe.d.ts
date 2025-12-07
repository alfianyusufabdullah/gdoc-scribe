import { GoogleDoc, TocItem, Transformer, ClassNames, ParagraphProps, ListGroupProps, TableProps, ImageProps, CodeBlockProps } from '../core/types';
export interface VanillaRenderers {
    paragraph?: (props: ParagraphProps<HTMLElement | DocumentFragment>) => HTMLElement;
    list_group?: (props: ListGroupProps<HTMLElement | DocumentFragment>) => HTMLElement;
    code_block?: (props: CodeBlockProps) => HTMLElement;
    table?: (props: TableProps<HTMLElement | DocumentFragment>) => HTMLElement;
    image?: (props: ImageProps) => HTMLElement | null;
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
    private defaultRenderCodeBlock;
    private renderParagraphContent;
    private defaultRenderParagraph;
    private renderTextRun;
    private renderListGroupContent;
    private renderListTreeContent;
    private defaultRenderListGroup;
    private renderTableContent;
    private defaultRenderTable;
    private defaultRenderImage;
    private openLightbox;
}
