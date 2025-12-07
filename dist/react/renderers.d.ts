import { default as React } from 'react';
import { Paragraph, TextRun, StructuralElement, Table, InlineObjects, Lists, ClassNames, ImageProps, CodeBlockProps, ParagraphProps, ListGroupProps, TableProps } from '../core/types';
export interface RendererRegistry {
    paragraph?: React.ComponentType<ParagraphProps<React.ReactNode>>;
    list_group?: React.ComponentType<ListGroupProps<React.ReactNode>>;
    code_block?: React.ComponentType<CodeBlockProps>;
    table?: React.ComponentType<TableProps<React.ReactNode>>;
    image?: React.ComponentType<ImageProps>;
}
export interface RendererProps {
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}
export type RenderContentFn = (content: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: Lists | null) => React.ReactNode;
export declare function CodeBlockRenderer({ content, language, className }: CodeBlockProps): React.JSX.Element;
export declare function ParagraphContent({ paragraph, inlineObjects, renderers, classNames }: {
    paragraph: Paragraph;
    inlineObjects?: InlineObjects | null;
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}): React.JSX.Element;
export declare function ParagraphRenderer({ children, style, text, className }: ParagraphProps<React.ReactNode>): React.JSX.Element;
export declare function TextRunRenderer({ textRun }: {
    textRun: TextRun;
}): React.JSX.Element | null;
export declare function ListGroup({ children, type, className }: ListGroupProps<React.ReactNode>): React.JSX.Element;
export declare function ListGroupContent({ items, inlineObjects, lists, renderers, classNames }: {
    items: StructuralElement[];
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}): React.JSX.Element | null;
export declare function TableRenderer({ children, className }: TableProps<React.ReactNode>): React.JSX.Element;
export declare function TableContent({ table, inlineObjects, lists, renderContent, classNames }: {
    table: Table;
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
    renderContent: RenderContentFn;
    classNames?: ClassNames;
}): React.JSX.Element;
export declare function ImageRenderer({ src, alt, className }: ImageProps): React.JSX.Element;
