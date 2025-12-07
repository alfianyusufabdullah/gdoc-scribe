import React from 'react';
import { Paragraph, TextRun, StructuralElement, Table, ListItemNode, InlineObjects, Lists, CodeBlock, ClassNames } from '../core/types';
import { buildListTree, getParagraphText, slugify, parseInlineContent } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, getImageData, getDimensionStyle, getColorStyle } from '../core/parser';

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

export function CodeBlockRenderer({ block, classNames }: { block: CodeBlock; classNames?: ClassNames }) {
    return (
        <pre className={classNames?.code_block}>
            <code className={block.language ? `language-${block.language}` : undefined}>
                {block.content}
            </code>
        </pre>
    );
}

export function ParagraphRenderer({ paragraph, inlineObjects, renderers, classNames }: { paragraph: Paragraph; inlineObjects?: InlineObjects | null; renderers?: RendererRegistry; classNames?: ClassNames }) {
    const style = paragraph.paragraphStyle;
    const Tag = getHeadingTag(style) as keyof React.JSX.IntrinsicElements;

    const alignment = getAlignmentStyle(style?.alignment || undefined);
    const cssStyle: React.CSSProperties = {};

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
        const text = getParagraphText(paragraph.elements || []);
        if (text) id = slugify(text);
    }

    const ImageComponent = renderers?.image || ImageRenderer;

    // Determine className based on tag
    let className = classNames?.paragraph;
    if (Tag === 'h1') className = classNames?.h1 || className;
    if (Tag === 'h2') className = classNames?.h2 || className;
    if (Tag === 'h3') className = classNames?.h3 || className;
    if (Tag === 'h4') className = classNames?.h4 || className;
    if (Tag === 'h5') className = classNames?.h5 || className;
    if (Tag === 'h6') className = classNames?.h6 || className;

    return (
        <Tag id={id} style={cssStyle} className={className}>
            {
                paragraph.elements?.map((el, idx) => (
                    <React.Fragment key={idx} >
                        {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                        {el.inlineObjectElement && <ImageComponent objectId={el.inlineObjectElement.inlineObjectId} inlineObjects={inlineObjects} classNames={classNames} />}
                    </React.Fragment>
                ))
            }
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

export function ListGroup({ items, inlineObjects, lists, renderers, classNames }: { items: StructuralElement[]; inlineObjects?: InlineObjects | null; lists?: Lists | null; renderers?: RendererRegistry; classNames?: ClassNames }) {
    const tree = buildListTree(items);

    const renderList = (nodes: ListItemNode[]) => {
        if (nodes.length === 0) return null;

        const firstNode = nodes[0];
        const listId = firstNode.item.paragraph?.bullet?.listId;
        const level = firstNode.level;

        const { tag, styleType } = getListTagAndStyle(listId, level, lists);
        const ListTag = tag as keyof JSX.IntrinsicElements;

        return (
            <ListTag style={{ listStyleType: styleType }} className={classNames?.list_group}>
                {nodes.map((node, idx) => (
                    <li key={idx} className={classNames?.list_item}>
                        {node.item.paragraph?.elements?.map((el, i) => {
                            const ImageComponent = renderers?.image || ImageRenderer;
                            return (
                                <React.Fragment key={i}>
                                    {el.textRun && <TextRunRenderer textRun={el.textRun} />}
                                    {el.inlineObjectElement && <ImageComponent objectId={el.inlineObjectElement.inlineObjectId} inlineObjects={inlineObjects} classNames={classNames} />}
                                </React.Fragment>
                            );
                        })}
                        {node.children.length > 0 && renderList(node.children)}
                    </li>
                ))}
            </ListTag>
        );
    };

    return renderList(tree);
}

export function TableRenderer({
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
        <table className={classNames?.table}>
            <tbody>
                {table.tableRows?.map((row, rIdx) => (
                    <tr key={rIdx} className={classNames?.table_row}>
                        {row.tableCells?.map((cell, cIdx) => {
                            const style: React.CSSProperties = {};
                            if (cell.tableCellStyle?.columnSpan) {
                                // @ts-ignore
                                style.colSpan = cell.tableCellStyle.columnSpan;
                            }

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
            </tbody>
        </table>
    );
}

export function ImageRenderer({ objectId, inlineObjects, classNames }: { objectId: string | null | undefined; inlineObjects?: InlineObjects | null; classNames?: ClassNames }) {
    const imageData = getImageData(objectId, inlineObjects);
    if (!imageData) return null;

    return (
        <img
            src={imageData.src}
            alt={imageData.alt}
            className={classNames?.image}
            style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '1rem 0'
            }}
        />
    );
}
