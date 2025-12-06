import React, { useMemo } from 'react';
import { GoogleDoc, StructuralElement, Paragraph, Table, ListItemNode, TocItem, InlineObjects, Lists, TextRun } from '../core/types';
import { processContent, buildListTree, extractHeadings, getParagraphText, slugify } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, SemanticTag } from '../core/parser';

interface UseDocsResult {
    html: React.ReactNode;
    toc: TocItem[];
}

export const useDocs = (doc: GoogleDoc | null | undefined): UseDocsResult => {
    const toc = useMemo(() => {
        if (!doc?.body?.content) return [];
        return extractHeadings(doc.body.content);
    }, [doc]);

    const html = useMemo(() => {
        if (!doc?.body?.content) return null;
        return renderContentBlocks(doc.body.content, doc.inlineObjects, doc.lists);
    }, [doc]);

    return { html, toc };
};

// --- Internal Rendering Logic ---

function renderContentBlocks(content: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: Lists | null): React.ReactNode[] {
    const blocks = processContent(content);
    return blocks.map((block, index) => {
        if ('type' in block && block.type === 'list_group') {
            return <ListGroup key={index} items={block.items} inlineObjects={inlineObjects} lists={lists} />;
        }
        const element = block as StructuralElement;
        if (element.paragraph) return <ParagraphRenderer key={index} paragraph={element.paragraph} inlineObjects={inlineObjects} />;
        if (element.table) return <TableRenderer key={index} table={element.table} inlineObjects={inlineObjects} lists={lists} />;
        return null;
    });
}

function ParagraphRenderer({ paragraph, inlineObjects }: { paragraph: Paragraph; inlineObjects?: InlineObjects | null }) {
    const style = paragraph.paragraphStyle;
    const tagName = getHeadingTag(style);
    const Tag = tagName as keyof React.JSX.IntrinsicElements;

    const alignment = getAlignmentStyle(style?.alignment || undefined);
    const cssStyle = alignment ? { textAlign: alignment as any } : undefined;

    let id: string | undefined;
    if (tagName.startsWith('h')) {
        const text = getParagraphText(paragraph.elements || []);
        if (text) id = slugify(text);
    }

    return (
        <Tag id={id} style={cssStyle}>
            {
                paragraph.elements?.map((el, idx) => (
                    <React.Fragment key={idx} >
                        {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                        {el.inlineObjectElement && <ImageRenderer objectId={el.inlineObjectElement.inlineObjectId} inlineObjects={inlineObjects} />}
                    </React.Fragment>
                ))
            }
        </Tag>
    );
}

function TextRunRenderer({ textRun }: { textRun: TextRun }) {
    let content = textRun.content || '';
    if (!content) return null;
    content = content.replace(/\u000b/g, '');

    const tags = getTextTags(textRun.textStyle);

    // Recursive wrapping
    const wrapWithTags = (text: string, tagDefs: SemanticTag[]): React.ReactNode => {
        if (tagDefs.length === 0) return text;
        const [currentTag, ...rest] = tagDefs;
        const Tag = currentTag.tag as keyof React.JSX.IntrinsicElements;
        return <Tag {...(currentTag.attrs || {})}>{wrapWithTags(text, rest)}</Tag>;
    };

    return <>{wrapWithTags(content, tags)}</>;
}

function ListGroup({ items, inlineObjects, lists }: { items: StructuralElement[]; inlineObjects?: InlineObjects | null; lists?: Lists | null }) {
    const tree = buildListTree(items);
    return <ListTree nodes={tree} inlineObjects={inlineObjects} lists={lists} />;
}

function ListTree({ nodes, inlineObjects, lists }: { nodes: ListItemNode[]; inlineObjects?: InlineObjects | null; lists?: Lists | null }) {
    if (nodes.length === 0) return null;

    const firstNode = nodes[0];
    const listId = firstNode.item.paragraph?.bullet?.listId;
    const level = firstNode.level;

    const { tag, styleType } = getListTagAndStyle(listId, level, lists);
    const Tag = tag as keyof React.JSX.IntrinsicElements;
    const style = { listStyleType: styleType };

    return (
        <Tag style={style}>
            {
                nodes.map((node, idx) => (
                    <li key={idx} >
                        {
                            node.item.paragraph?.elements?.map((el, elIdx) => (
                                <React.Fragment key={elIdx} >
                                    {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                                </React.Fragment>
                            ))
                        }
                        {node.children.length > 0 && <ListTree nodes={node.children} inlineObjects={inlineObjects} lists={lists} />}
                    </li>
                ))
            }
        </Tag>
    );
}

function TableRenderer({ table, inlineObjects, lists }: { table: Table; inlineObjects?: InlineObjects | null; lists?: Lists | null }) {
    return (
        <table>
            <tbody>
                {
                    table.tableRows?.map((row, rIdx) => (
                        <tr key={rIdx} >
                            {
                                row.tableCells?.map((cell, cIdx) => (
                                    <td key={cIdx} colSpan={cell.tableCellStyle?.columnSpan || 1} rowSpan={cell.tableCellStyle?.rowSpan || 1} >
                                        {cell.content && renderContentBlocks(cell.content, inlineObjects, lists)}
                                    </td>
                                ))
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

function ImageRenderer({ objectId, inlineObjects }: { objectId: string | null | undefined; inlineObjects?: InlineObjects | null }) {
    const [isOpen, setIsOpen] = React.useState(false);

    if (!objectId || !inlineObjects) return null;
    const embeddedObject = inlineObjects[objectId]?.inlineObjectProperties?.embeddedObject;
    if (!embeddedObject?.imageProperties?.contentUri) return null;

    const src = embeddedObject.imageProperties.contentUri;

    return (
        <>
            <img
                src={src}
                alt="Embedded"
                onClick={() => setIsOpen(true)
                }
                style={{ cursor: 'pointer' }}
            />
            {
                isOpen && (
                    <div
                        style={
                            {
                                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                                backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 9999, cursor: 'pointer'
                            }
                        }
                        onClick={() => setIsOpen(false)
                        }
                    >
                        <img src={src} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                    </div>
                )}
        </>
    );
}
