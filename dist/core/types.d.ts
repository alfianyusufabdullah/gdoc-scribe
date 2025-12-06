export interface Color {
    rgbColor?: {
        red?: number | null;
        green?: number | null;
        blue?: number | null;
    };
}
export interface TextStyle {
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
export interface TextRun {
    content?: string | null;
    textStyle?: TextStyle;
}
export interface InlineObjectElement {
    inlineObjectId?: string | null;
    textStyle?: TextStyle;
}
export interface Person {
    personId?: string | null;
    personProperties?: {
        name?: string | null;
        email?: string | null;
    };
    textStyle?: TextStyle;
}
export interface RichLinkProperties {
    title?: string | null;
    uri?: string | null;
    mimeType?: string | null;
}
export interface RichLink {
    richLinkId?: string | null;
    richLinkProperties?: RichLinkProperties;
    textStyle?: TextStyle;
}
export interface HorizontalRule {
    textStyle?: Record<string, unknown>;
}
export interface ParagraphElement {
    startIndex?: number | null;
    endIndex?: number | null;
    textRun?: TextRun;
    inlineObjectElement?: InlineObjectElement;
    person?: Person;
    horizontalRule?: HorizontalRule;
    richLink?: RichLink;
}
export interface Dimension {
    magnitude?: number | null;
    unit?: string | null;
}
export interface OptionalColor {
    color?: Color;
}
export interface Shading {
    backgroundColor?: OptionalColor;
}
export interface ParagraphStyle {
    namedStyleType?: string | null;
    alignment?: string | null;
    indentStart?: Dimension;
    indentEnd?: Dimension;
    indentFirstLine?: Dimension;
    spaceAbove?: Dimension;
    spaceBelow?: Dimension;
    shading?: Shading;
}
export interface Bullet {
    listId?: string | null;
    nestingLevel?: number | null;
    textStyle?: TextStyle;
}
export interface Paragraph {
    elements?: ParagraphElement[];
    paragraphStyle?: ParagraphStyle;
    bullet?: Bullet;
}
export interface TableCellStyle {
    columnSpan?: number | null;
    rowSpan?: number | null;
    backgroundColor?: {
        color?: Color;
    };
}
export interface TableCell {
    content?: StructuralElement[];
    tableCellStyle?: TableCellStyle;
    startIndex?: number | null;
    endIndex?: number | null;
}
export interface TableRow {
    tableCells?: TableCell[];
    startIndex?: number | null;
    endIndex?: number | null;
}
export interface Table {
    rows?: number | null;
    columns?: number | null;
    tableRows?: TableRow[];
    tableStyle?: Record<string, unknown>;
}
export interface SectionBreak {
    sectionStyle?: {
        columnSeparatorStyle?: string | null;
        contentDirection?: string | null;
        sectionType?: string | null;
    };
}
export interface StructuralElement {
    startIndex?: number | null;
    endIndex?: number | null;
    paragraph?: Paragraph;
    table?: Table;
    sectionBreak?: SectionBreak;
}
export interface InlineObjectProperties {
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
    };
}
export interface InlineObjects {
    [key: string]: {
        inlineObjectProperties?: InlineObjectProperties | null;
    };
}
export interface NestingLevel {
    bulletAlignment?: string | null;
    glyphType?: string | null;
    glyphFormat?: string | null;
    glyphSymbol?: string | null;
    startNumber?: number | null;
    textStyle?: TextStyle;
}
export interface ListProperties {
    nestingLevels?: NestingLevel[];
}
export interface List {
    listProperties?: ListProperties;
}
export interface Lists {
    [key: string]: List;
}
export interface GoogleDoc {
    title?: string | null;
    body?: {
        content?: StructuralElement[];
    };
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
}
export interface ListGroupBlock {
    type: 'list_group';
    listId?: string;
    items: StructuralElement[];
}
export interface CodeBlock {
    type: 'code_block';
    language: string;
    content: string;
}
export type ProcessedBlock = StructuralElement | ListGroupBlock | CodeBlock;
export interface ListItemNode {
    item: StructuralElement;
    children: ListItemNode[];
    level: number;
}
export interface TocItem {
    id: string;
    text: string;
    level: number;
}
