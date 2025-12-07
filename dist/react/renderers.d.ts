import { default as React } from 'react';
import { Paragraph, TextRun, StructuralElement, Table, InlineObjects, Lists, CodeBlock, ClassNames } from '../core/types';
export interface RendererRegistry {
    paragraph?: React.ComponentType<any>;
    list_group?: React.ComponentType<any>;
    code_block?: React.ComponentType<any>;
    table?: React.ComponentType<any>;
    image?: React.ComponentType<any>;
}
export interface RendererProps {
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}
export type RenderContentFn = (content: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: Lists | null) => React.ReactNode;
export declare function CodeBlockRenderer({ block, classNames }: {
    block: CodeBlock;
    classNames?: ClassNames;
}): React.JSX.Element;
export declare function ParagraphRenderer({ paragraph, inlineObjects, renderers, classNames }: {
    paragraph: Paragraph;
    inlineObjects?: InlineObjects | null;
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}): React.JSX.Element;
export declare function TextRunRenderer({ textRun }: {
    textRun: TextRun;
}): React.JSX.Element | null;
export declare function ListGroup({ items, inlineObjects, lists, renderers, classNames }: {
    items: StructuralElement[];
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
    renderers?: RendererRegistry;
    classNames?: ClassNames;
}): React.JSX.Element | null;
export declare function TableRenderer({ table, inlineObjects, lists, renderContent, classNames }: {
    table: Table;
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
    renderContent: RenderContentFn;
    classNames?: ClassNames;
}): React.JSX.Element;
export declare function ImageRenderer({ objectId, inlineObjects, classNames }: {
    objectId: string | null | undefined;
    inlineObjects?: InlineObjects | null;
    classNames?: ClassNames;
}): React.JSX.Element | null;
