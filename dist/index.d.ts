import { default as default_2 } from 'react';

export declare const buildListTree: (items: StructuralElement[]) => ListItemNode[];

export declare interface Bullet {
    listId?: string | null;
    nestingLevel?: number | null;
    textStyle?: TextStyle;
}

export declare interface ClassNames {
    paragraph?: string;
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    list_group?: string;
    list_item?: string;
    code_block?: string;
    table?: string;
    table_row?: string;
    table_cell?: string;
    image?: string;
}

export declare interface CodeBlock {
    type: 'code_block';
    language: string;
    content: string;
}

export declare interface CodeBlockProps {
    content: string;
    language: string;
    className?: string;
    original?: {
        block: CodeBlock;
    };
}

export declare interface Color {
    rgbColor?: {
        red?: number | null;
        green?: number | null;
        blue?: number | null;
    };
}

export declare interface Dimension {
    magnitude?: number | null;
    unit?: string | null;
}

export declare const extractHeadings: (content: StructuralElement[]) => TocItem[];

export declare const GDocContent: default_2.FC<GDocViewerProps>;

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

export declare const GDocViewer: default_2.FC<GDocViewerProps>;

export declare interface GDocViewerProps extends UseDocsOptions {
    doc: GoogleDoc | null;
    className?: string;
}

export declare const getAlignmentStyle: (alignment: string | undefined) => string | undefined;

export declare const getColorStyle: (color: Color | undefined | null) => string | null;

export declare const getDimensionStyle: (dimension: Dimension | undefined | null) => string | null;

export declare const getHeadingTag: (style: ParagraphStyle | undefined) => string;

export declare const getImageData: (objectId: string | null | undefined, inlineObjects: InlineObjects | null | undefined) => {
    src: string;
    alt: string;
    title?: string;
} | null;

export declare const getListTagAndStyle: (listId: string | null | undefined, nestingLevel: number | null | undefined, docLists: Lists | null | undefined) => ListTagResult;

export declare const getParagraphText: (elements: ParagraphElement[]) => string;

export declare const getTextTags: (style: TextStyle | undefined) => SemanticTag[];

export declare interface GoogleDoc {
    title?: string | null;
    body?: {
        content?: StructuralElement[];
    };
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
}

export declare interface HorizontalRule {
    textStyle?: Record<string, unknown>;
}

export declare interface ImageProps {
    src: string;
    alt: string;
    title?: string;
    className?: string;
    original?: {
        objectId: string | null | undefined;
        inlineObjects?: InlineObjects | null;
    };
}

export declare interface InlineContent {
    type: 'text' | 'code';
    content: string;
}

export declare interface InlineObjectElement {
    inlineObjectId?: string | null;
    textStyle?: TextStyle;
}

export declare interface InlineObjectProperties {
    embeddedObject?: {
        imageProperties?: {
            contentUri?: string | null;
        };
        size?: {
            width?: {
                magnitude?: number | null;
                unit?: string | null;
            };
            height?: {
                magnitude?: number | null;
                unit?: string | null;
            };
        };
        title?: string | null;
        description?: string | null;
    };
}

export declare interface InlineObjects {
    [key: string]: {
        inlineObjectProperties?: InlineObjectProperties | null;
    };
}

export declare interface List {
    listProperties?: ListProperties;
}

export declare interface ListGroupBlock {
    type: 'list_group';
    listId?: string;
    items: StructuralElement[];
}

export declare interface ListGroupProps<T = any> {
    children: T;
    type: 'ordered' | 'unordered';
    className?: string;
    original?: {
        items: StructuralElement[];
        lists?: Lists | null;
    };
}

export declare interface ListItemNode {
    item: StructuralElement;
    children: ListItemNode[];
    level: number;
}

export declare interface ListProperties {
    nestingLevels?: NestingLevel[];
}

export declare interface Lists {
    [key: string]: List;
}

export declare interface ListTagResult {
    tag: string;
    styleType: string;
}

export declare interface NestingLevel {
    bulletAlignment?: string | null;
    glyphType?: string | null;
    glyphFormat?: string | null;
    glyphSymbol?: string | null;
    startNumber?: number | null;
    textStyle?: TextStyle;
}

export declare interface OptionalColor {
    color?: Color;
}

export declare interface Paragraph {
    elements?: ParagraphElement[];
    paragraphStyle?: ParagraphStyle;
    bullet?: Bullet;
}

export declare interface ParagraphElement {
    startIndex?: number | null;
    endIndex?: number | null;
    textRun?: TextRun;
    inlineObjectElement?: InlineObjectElement;
    person?: Person;
    horizontalRule?: HorizontalRule;
    richLink?: RichLink;
}

export declare interface ParagraphProps<T = any> {
    children: T;
    style?: ParagraphStyle;
    text: string;
    className?: string;
    original?: {
        paragraph: Paragraph;
    };
}

export declare interface ParagraphStyle {
    namedStyleType?: string | null;
    alignment?: string | null;
    indentStart?: Dimension;
    indentEnd?: Dimension;
    indentFirstLine?: Dimension;
    spaceAbove?: Dimension;
    spaceBelow?: Dimension;
    shading?: Shading;
}

export declare const parseInlineContent: (text: string) => InlineContent[];

export declare interface Person {
    personId?: string | null;
    personProperties?: {
        name?: string | null;
        email?: string | null;
    };
    textStyle?: TextStyle;
}

export declare const processContent: (content: StructuralElement[], transformers?: Transformer_2[]) => ProcessedBlock[];

export declare type ProcessedBlock = StructuralElement | ListGroupBlock | CodeBlock;

declare interface RendererRegistry {
    paragraph?: default_2.ComponentType<ParagraphProps<default_2.ReactNode>>;
    list_group?: default_2.ComponentType<ListGroupProps<default_2.ReactNode>>;
    code_block?: default_2.ComponentType<CodeBlockProps>;
    table?: default_2.ComponentType<TableProps<default_2.ReactNode>>;
    image?: default_2.ComponentType<ImageProps>;
}

export declare interface RichLink {
    richLinkId?: string | null;
    richLinkProperties?: RichLinkProperties;
    textStyle?: TextStyle;
}

export declare interface RichLinkProperties {
    title?: string | null;
    uri?: string | null;
    mimeType?: string | null;
}

declare interface ScribeOptions {
    renderers?: VanillaRenderers;
    transformers?: Transformer_2[];
    classNames?: ClassNames;
}

export declare interface SectionBreak {
    sectionStyle?: {
        columnSeparatorStyle?: string | null;
        contentDirection?: string | null;
        sectionType?: string | null;
    };
}

export declare interface SemanticTag {
    tag: string;
    attrs?: Record<string, string>;
}

export declare interface Shading {
    backgroundColor?: OptionalColor;
}

export declare const slugify: (text: string) => string;

export declare interface StructuralElement {
    startIndex?: number | null;
    endIndex?: number | null;
    paragraph?: Paragraph;
    table?: Table;
    sectionBreak?: SectionBreak;
}

export declare interface Table {
    rows?: number | null;
    columns?: number | null;
    tableRows?: TableRow[];
    tableStyle?: Record<string, unknown>;
}

export declare interface TableCell {
    content?: StructuralElement[];
    tableCellStyle?: TableCellStyle;
    startIndex?: number | null;
    endIndex?: number | null;
}

export declare interface TableCellStyle {
    columnSpan?: number | null;
    rowSpan?: number | null;
    backgroundColor?: {
        color?: Color;
    };
}

export declare interface TableProps<T = any> {
    children: T;
    className?: string;
    original?: {
        table: Table;
    };
}

export declare interface TableRow {
    tableCells?: TableCell[];
    startIndex?: number | null;
    endIndex?: number | null;
}

export declare interface TextRun {
    content?: string | null;
    textStyle?: TextStyle;
}

export declare interface TextStyle {
    bold?: boolean | null;
    italic?: boolean | null;
    underline?: boolean | null;
    strikethrough?: boolean | null;
    fontSize?: {
        magnitude?: number | null;
        unit?: string | null;
    };
    foregroundColor?: {
        color?: Color;
    };
    link?: {
        url?: string | null;
        bookmarkId?: string | null;
        headingId?: string | null;
        bookmark?: {
            id?: string | null;
            tabId?: string | null;
        };
        heading?: {
            id?: string | null;
            tabId?: string | null;
        };
    };
}

export declare interface TocItem {
    id: string;
    text: string;
    level: number;
}

declare type Transformer_2 = (blocks: ProcessedBlock[]) => ProcessedBlock[];
export { Transformer_2 as Transformer }

export declare const useDocs: (doc: GoogleDoc | null | undefined, options?: UseDocsOptions) => UseDocsResult;

declare interface UseDocsOptions {
    renderers?: RendererRegistry;
    transformers?: Transformer_2[];
    classNames?: ClassNames;
}

declare interface UseDocsResult {
    html: default_2.ReactNode;
    toc: {
        id: string;
        text: string;
        level: number;
    }[];
}

declare interface VanillaRenderers {
    paragraph?: (props: ParagraphProps<HTMLElement | DocumentFragment>) => HTMLElement;
    list_group?: (props: ListGroupProps<HTMLElement | DocumentFragment>) => HTMLElement;
    code_block?: (props: CodeBlockProps) => HTMLElement;
    table?: (props: TableProps<HTMLElement | DocumentFragment>) => HTMLElement;
    image?: (props: ImageProps) => HTMLElement | null;
}

export { }
