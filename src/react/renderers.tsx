import React from 'react';
import { Paragraph, TextRun, StructuralElement, Table, ListItemNode, InlineObjects, Lists, ClassNames, ImageProps, CodeBlockProps, ParagraphProps, ListGroupProps, TableProps } from '../core/types';
import { buildListTree, getParagraphText, slugify, parseInlineContent } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, getImageData, getDimensionStyle, getColorStyle } from '../core/parser';

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

export function CodeBlockRenderer({ content, language, className }: CodeBlockProps) {
    return (
        <pre className={className}>
            <code className={language ? `language - ${language} ` : undefined}>
                {content}
            </code>
        </pre>
    );
}

// --- Internal Helper Components for Default Rendering ---

export function ParagraphContent({ paragraph, inlineObjects, renderers, classNames }: { paragraph: Paragraph; inlineObjects?: InlineObjects | null; renderers?: RendererRegistry; classNames?: ClassNames }) {
    const ImageComponent = renderers?.image || ImageRenderer;
    return (
        <>
            {paragraph.elements?.map((el, idx) => (
                <React.Fragment key={idx} >
                    {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                    {el.inlineObjectElement && (() => {
                        const objectId = el.inlineObjectElement.inlineObjectId;
                        const imageData = getImageData(objectId, inlineObjects);
                        if (!imageData) return null;
                        return (
                            <ImageComponent
                                src={imageData.src}
                                alt={imageData.alt}
                                title={imageData.title}
                                className={classNames?.image}
                                original={{ objectId, inlineObjects }}
                            />
                        );
                    })()}
                </React.Fragment>
            ))}
        </>
    );
}

export function ParagraphRenderer({ children, style, text, className }: ParagraphProps<React.ReactNode>) {
    const Tag = getHeadingTag(style) as keyof React.JSX.IntrinsicElements;
    const cssStyle: React.CSSProperties = {};

    const alignment = getAlignmentStyle(style?.alignment || undefined);
    if (alignment) cssStyle.textAlign = alignment as any;

    // Indentation
    if (style?.indentStart) {
        const val = getDimensionStyle(style.indentStart);
        if (val) cssStyle.paddingLeft = val;
    }
    if (style?.indentEnd) {
        const val = getDimensionStyle(style.indentEnd);
        if (val) cssStyle.paddingRight = val;
    }
    if (style?.indentFirstLine) {
        const val = getDimensionStyle(style.indentFirstLine);
        if (val) cssStyle.textIndent = val;
    }

    // Spacing
    if (style?.spaceAbove) {
        const val = getDimensionStyle(style.spaceAbove);
        if (val) cssStyle.marginTop = val;
    }
    if (style?.spaceBelow) {
        const val = getDimensionStyle(style.spaceBelow);
        if (val) cssStyle.marginBottom = val;
    }

    // Shading
    if (style?.shading?.backgroundColor?.color) {
        const bgColor = getColorStyle(style.shading.backgroundColor.color);
        if (bgColor) {
            cssStyle.backgroundColor = bgColor;
            cssStyle.padding = '10px';
            cssStyle.borderRadius = '4px';
        }
    }

    let id: string | undefined;
    if (Tag.startsWith('h')) {
        if (text) id = slugify(text);
    }

    return (
        <Tag id={id} style={cssStyle} className={className}>
            {children}
        </Tag>
    );
}

export function TextRunRenderer({ textRun }: { textRun: TextRun }) {
    if (!textRun.content) return null;

    // Handle newlines
    const content = textRun.content.replace(/\u000b/g, ''); // Remove vertical tab

    const tags = getTextTags(textRun.textStyle);

    // Helper to wrap content with tags
    const wrapWithTags = (text: string): React.ReactNode => {
        if (tags.length === 0) return <>{text}</>;

        return tags.reduceRight((acc, tagDef) => {
            const Tag = tagDef.tag as keyof JSX.IntrinsicElements;
            return <Tag {...tagDef.attrs}>{acc}</Tag>;
        }, <>{text}</>);
    };

    // Use shared inline parsing logic
    const parts = parseInlineContent(content);

    return (
        <>
            {parts.map((part, index) => {
                if (part.type === 'code') {
                    if (tags.length === 0) {
                        return <code key={index}>{part.content}</code>;
                    }
                    // If there are other tags, we wrap the code element inside them
                    return tags.reduceRight((acc, tagDef) => {
                        const Tag = tagDef.tag as keyof JSX.IntrinsicElements;
                        return <Tag key={index} {...tagDef.attrs}>{acc}</Tag>;
                    }, <code>{part.content}</code>);
                }
                return <React.Fragment key={index}>{wrapWithTags(part.content)}</React.Fragment>;
            })}
        </>
    );
}

export function ListGroup({ children, type, className }: ListGroupProps<React.ReactNode>) {
    const Tag = type === 'ordered' ? 'ol' : 'ul';
    return (
        <Tag className={className}>
            {children}
        </Tag>
    );
}

// Helper to render list items recursively
export function ListGroupContent({ items, inlineObjects, lists, renderers, classNames }: { items: StructuralElement[]; inlineObjects?: InlineObjects | null; lists?: Lists | null; renderers?: RendererRegistry; classNames?: ClassNames }) {
    const tree = buildListTree(items);

    const renderList = (nodes: ListItemNode[]) => {
        if (nodes.length === 0) return null;

        const firstNode = nodes[0];
        const listId = firstNode.item.paragraph?.bullet?.listId;
        const level = firstNode.level;

        const { styleType } = getListTagAndStyle(listId, level, lists);

        return (
            <>
                {nodes.map((node, idx) => (
                    <li key={idx} className={classNames?.list_item} style={{ listStyleType: styleType }}>
                        {node.item.paragraph?.elements?.map((el, i) => {
                            const ImageComponent = renderers?.image || ImageRenderer;
                            return (
                                <React.Fragment key={i}>
                                    {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                                    {el.inlineObjectElement && (() => {
                                        const objectId = el.inlineObjectElement.inlineObjectId;
                                        const imageData = getImageData(objectId, inlineObjects);
                                        if (!imageData) return null;
                                        return (
                                            <ImageComponent
                                                src={imageData.src}
                                                alt={imageData.alt}
                                                title={imageData.title}
                                                className={classNames?.image}
                                                original={{ objectId, inlineObjects }}
                                            />
                                        );
                                    })()}
                                </React.Fragment>
                            );
                        })}
                        {node.children.length > 0 && (
                            <ul style={{ listStyleType: 'none', paddingLeft: '20px' }}>
                                {renderList(node.children)}
                            </ul>
                        )}
                    </li>
                ))}
            </>
        );
    };

    return renderList(tree);
}

export function TableRenderer({ children, className }: TableProps<React.ReactNode>) {
    return (
        <table className={className}>
            <tbody>
                {children}
            </tbody>
        </table>
    );
}

export function TableContent({
    table,
    inlineObjects,
    lists,
    renderContent,
    classNames
}: {
    table: Table;
    inlineObjects?: InlineObjects | null;
    lists?: Lists | null;
    renderContent: RenderContentFn;
    classNames?: ClassNames;
}) {
    return (
        <>
            {table.tableRows?.map((row, rIdx) => (
                <tr key={rIdx} className={classNames?.table_row}>
                    {row.tableCells?.map((cell, cIdx) => {
                        return (
                            <td
                                key={cIdx}
                                colSpan={cell.tableCellStyle?.columnSpan || undefined}
                                rowSpan={cell.tableCellStyle?.rowSpan || undefined}
                                className={classNames?.table_cell}
                            >
                                {cell.content && renderContent(cell.content, inlineObjects, lists)}
                            </td>
                        );
                    })}
                </tr>
            ))}
        </>
    );
}

export function ImageRenderer({ src, alt, className }: ImageProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '1rem 0'
            }}
        />
    );
}
