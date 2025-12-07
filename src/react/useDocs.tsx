import React, { useMemo } from 'react';
import { GoogleDoc, StructuralElement, InlineObjects, Lists, ProcessedBlock, ClassNames, Transformer } from '../core/types';
import { processContent, extractHeadings, getParagraphText } from '../core/utils';
import { BlockErrorBoundary } from './ErrorBoundary';
import {
    ParagraphRenderer,
    ParagraphContent,
    CodeBlockRenderer,
    ListGroup,
    ListGroupContent,
    TableRenderer,
    TableContent,
    RenderContentFn,
    RendererRegistry
} from './renderers';

export interface UseDocsOptions {
    renderers?: RendererRegistry;
    transformers?: Transformer[];
    classNames?: ClassNames;
}

export interface UseDocsResult {
    html: React.ReactNode;
    toc: { id: string; text: string; level: number }[];
}

export const useDocs = (doc: GoogleDoc | null | undefined, options: UseDocsOptions = {}): UseDocsResult => {
    const toc = useMemo(() => {
        if (!doc?.body?.content) return [];
        return extractHeadings(doc.body.content);
    }, [doc]);

    const html = useMemo(() => {
        if (!doc?.body?.content) return null;
        return renderContentBlocks(doc.body.content, doc.inlineObjects, doc.lists, options);
    }, [doc, options]);

    return { html, toc };
};

// --- Internal Rendering Logic ---

function renderContentBlocks(
    content: StructuralElement[],
    inlineObjects?: InlineObjects | null,
    lists?: Lists | null,
    options: UseDocsOptions = {}
): React.ReactNode[] {
    const { renderers = {}, transformers = [], classNames = {} } = options;
    const blocks = processContent(content, transformers);

    // Helper for recursion that preserves options
    const recursiveRender: RenderContentFn = (c, i, l) => renderContentBlocks(c, i, l, options);

    return blocks.map((block: ProcessedBlock, index) => {
        let Component: React.ComponentType<any> | null = null;
        let props: any = {};

        if ('type' in block) {
            if (block.type === 'list_group') {
                Component = renderers.list_group || ListGroup;
                const children = <ListGroupContent items={block.items} inlineObjects={inlineObjects} lists={lists} renderers={renderers} classNames={classNames} />;
                props = {
                    children,
                    type: 'unordered', // Default, ListGroupContent handles specific styling
                    className: classNames.list_group,
                    original: { items: block.items, lists }
                };
            } else if (block.type === 'code_block') {
                Component = renderers.code_block || CodeBlockRenderer;
                props = {
                    content: block.content,
                    language: block.language,
                    className: classNames.code_block,
                    original: { block }
                };
            }
        } else {
            // It's a StructuralElement
            if (block.paragraph) {
                Component = renderers.paragraph || ParagraphRenderer;
                const children = <ParagraphContent paragraph={block.paragraph} inlineObjects={inlineObjects} renderers={renderers} classNames={classNames} />;
                const text = getParagraphText(block.paragraph.elements || []);
                props = {
                    children,
                    style: block.paragraph.paragraphStyle,
                    text,
                    className: classNames.paragraph, // Note: ParagraphRenderer resolves specific h1-h6 classes internally if not provided here, but for custom renderer we pass the base one.
                    original: { paragraph: block.paragraph }
                };
            } else if (block.table) {
                Component = renderers.table || TableRenderer;
                const children = <TableContent table={block.table} inlineObjects={inlineObjects} lists={lists} renderContent={recursiveRender} classNames={classNames} />;
                props = {
                    children,
                    className: classNames.table,
                    original: { table: block.table }
                };
            }
        }

        if (Component) {
            return (
                <BlockErrorBoundary key={index}>
                    <Component {...props} />
                </BlockErrorBoundary>
            );
        }
        return null;
    });
}
