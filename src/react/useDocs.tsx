import React, { useMemo } from 'react';
import { GoogleDoc, StructuralElement, InlineObjects, Lists, ProcessedBlock, ClassNames, Transformer } from '../core/types';
import { processContent, extractHeadings } from '../core/utils';
import { BlockErrorBoundary } from './ErrorBoundary';
import {
    ParagraphRenderer,
    CodeBlockRenderer,
    ListGroup,
    TableRenderer,
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
                props = { items: block.items, inlineObjects, lists, renderers, classNames };
            } else if (block.type === 'code_block') {
                Component = renderers.code_block || CodeBlockRenderer;
                props = { block: block, classNames };
            }
        } else {
            // It's a StructuralElement
            if (block.paragraph) {
                Component = renderers.paragraph || ParagraphRenderer;
                props = { paragraph: block.paragraph, inlineObjects, renderers, classNames };
            } else if (block.table) {
                Component = renderers.table || TableRenderer;
                props = { table: block.table, inlineObjects, lists, renderContent: recursiveRender, classNames };
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
