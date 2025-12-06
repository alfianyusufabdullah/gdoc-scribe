import { GoogleDoc, StructuralElement, Paragraph, Table, ListItemNode, InlineObjects, TocItem } from '../core/types';
import { processContent, buildListTree, getParagraphText, slugify, parseInlineContent, extractHeadings } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, getImageData, getDimensionStyle, getColorStyle } from '../core/parser';

export class GDocScribe {
    private doc: GoogleDoc;
    private inlineObjects: InlineObjects | null;

    constructor(doc: GoogleDoc) {
        this.doc = doc;
        this.inlineObjects = doc.inlineObjects || null;
    }

    public getToc(): TocItem[] {
        if (!this.doc.body?.content) return [];
        return extractHeadings(this.doc.body.content);
    }

    public render(target: HTMLElement): void {
        target.innerHTML = ''; // Clear target
        if (!this.doc.body?.content) return;

        const blocks = processContent(this.doc.body.content);

        blocks.forEach(block => {
            if ('type' in block && block.type === 'list_group') {
                target.appendChild(this.renderListGroup(block.items));
            } else if ('type' in block && block.type === 'code_block') {
                target.appendChild(this.renderCodeBlock(block));
            } else {
                const element = block as StructuralElement;
                if (element.paragraph) {
                    target.appendChild(this.renderParagraph(element.paragraph));
                } else if (element.table) {
                    target.appendChild(this.renderTable(element.table));
                }
            }
        });
    }

    private renderCodeBlock(block: any): HTMLElement {
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        if (block.language) {
            code.className = `language-${block.language}`;
        }

        code.textContent = block.content;
        pre.appendChild(code);

        return pre;
    }

    private renderParagraph(paragraph: Paragraph): HTMLElement {
        const style = paragraph.paragraphStyle;
        const tagName = getHeadingTag(style);
        const el = document.createElement(tagName);

        const alignment = getAlignmentStyle(style?.alignment || undefined);
        if (alignment) {
            el.style.textAlign = alignment;
        }

        // Apply Indentation
        if (style?.indentStart) {
            const indentStart = getDimensionStyle(style.indentStart);
            if (indentStart) el.style.paddingLeft = indentStart;
        }
        if (style?.indentEnd) {
            const indentEnd = getDimensionStyle(style.indentEnd);
            if (indentEnd) el.style.paddingRight = indentEnd;
        }
        if (style?.indentFirstLine) {
            const indentFirstLine = getDimensionStyle(style.indentFirstLine);
            if (indentFirstLine) el.style.textIndent = indentFirstLine;
        }

        // Apply Spacing
        if (style?.spaceAbove) {
            const spaceAbove = getDimensionStyle(style.spaceAbove);
            if (spaceAbove) el.style.marginTop = spaceAbove;
        }
        if (style?.spaceBelow) {
            const spaceBelow = getDimensionStyle(style.spaceBelow);
            if (spaceBelow) el.style.marginBottom = spaceBelow;
        }

        // Apply Shading (Background Color)
        if (style?.shading?.backgroundColor?.color) {
            const bgColor = getColorStyle(style.shading.backgroundColor.color);
            if (bgColor) {
                el.style.backgroundColor = bgColor;
                el.style.padding = '10px'; // Add default padding for shaded blocks
                el.style.borderRadius = '4px'; // Add border radius for better look
            }
        }

        // Add ID for headings for TOC support
        if (tagName.startsWith('h')) {
            const text = getParagraphText(paragraph.elements || []);
            if (text) el.id = slugify(text);
        }

        if (paragraph.elements) {
            paragraph.elements.forEach(pElem => {
                if (pElem.textRun) {
                    const span = this.renderTextRun(pElem.textRun);
                    el.appendChild(span);
                } else if (pElem.inlineObjectElement) {
                    const img = this.renderImage(pElem.inlineObjectElement.inlineObjectId);
                    if (img) el.appendChild(img);
                }
            });
        }

        return el;
    }

    private renderTextRun(textRun: any): HTMLElement | Text | DocumentFragment {
        let content = textRun.content || '';
        if (!content) return document.createTextNode('');

        // Handle newlines
        content = content.replace(/\u000b/g, ''); // Remove vertical tab

        const tags = getTextTags(textRun.textStyle);

        // Helper to wrap content with tags
        const wrapWithTags = (text: string): HTMLElement | Text => {
            if (tags.length === 0) {
                return document.createTextNode(text);
            }

            let root: HTMLElement | null = null;
            let current: HTMLElement | null = null;

            for (const tagDef of tags) {
                const el = document.createElement(tagDef.tag);
                if (tagDef.attrs) {
                    Object.entries(tagDef.attrs).forEach(([k, v]) => el.setAttribute(k, v));
                }

                if (!root) {
                    root = el;
                    current = el;
                } else {
                    current!.appendChild(el);
                    current = el;
                }
            }

            if (current) {
                current.textContent = text;
            }

            return root!;
        };

        // Use shared inline parsing logic
        const parts = parseInlineContent(content);

        if (parts.length === 1 && parts[0].type === 'text') {
            return wrapWithTags(parts[0].content);
        }

        const fragment = document.createDocumentFragment();

        parts.forEach((part: any) => {
            if (part.type === 'code') {
                const codeEl = document.createElement('code');
                codeEl.textContent = part.content;

                if (tags.length === 0) {
                    fragment.appendChild(codeEl);
                } else {
                    // If there are other tags, we wrap the code element inside them
                    let root: HTMLElement | null = null;
                    let current: HTMLElement | null = null;

                    for (const tagDef of tags) {
                        const el = document.createElement(tagDef.tag);
                        if (tagDef.attrs) {
                            Object.entries(tagDef.attrs).forEach(([k, v]) => el.setAttribute(k, v));
                        }

                        if (!root) {
                            root = el;
                            current = el;
                        } else {
                            current!.appendChild(el);
                            current = el;
                        }
                    }

                    if (current) {
                        current.appendChild(codeEl);
                        fragment.appendChild(root!);
                    } else {
                        fragment.appendChild(codeEl);
                    }
                }

            } else {
                fragment.appendChild(wrapWithTags(part.content));
            }
        });

        return fragment;
    }

    private renderListGroup(items: StructuralElement[]): HTMLElement {
        const tree = buildListTree(items);
        return this.renderListTree(tree);
    }

    private renderListTree(nodes: ListItemNode[]): HTMLElement {
        if (nodes.length === 0) return document.createElement('ul');

        const firstNode = nodes[0];
        const listId = firstNode.item.paragraph?.bullet?.listId;
        const level = firstNode.level;

        const { tag, styleType } = getListTagAndStyle(listId, level, this.doc.lists);

        const listEl = document.createElement(tag);
        listEl.style.listStyleType = styleType;

        nodes.forEach(node => {
            const li = document.createElement('li');

            // Render content
            if (node.item.paragraph?.elements) {
                node.item.paragraph.elements.forEach(pElem => {
                    if (pElem.textRun) {
                        li.appendChild(this.renderTextRun(pElem.textRun));
                    }
                });
            }

            // Render children
            if (node.children.length > 0) {
                li.appendChild(this.renderListTree(node.children));
            }

            listEl.appendChild(li);
        });

        return listEl;
    }

    private renderTable(table: Table): HTMLElement {
        const tableEl = document.createElement('table');
        const tbody = document.createElement('tbody');
        tableEl.appendChild(tbody);

        (table.tableRows || []).forEach(row => {
            const tr = document.createElement('tr');
            (row.tableCells || []).forEach(cell => {
                const td = document.createElement('td');
                if (cell.tableCellStyle?.columnSpan) td.colSpan = cell.tableCellStyle.columnSpan;
                if (cell.tableCellStyle?.rowSpan) td.rowSpan = cell.tableCellStyle.rowSpan;

                // Render cell content recursively
                if (cell.content) {
                    const blocks = processContent(cell.content);
                    blocks.forEach(block => {
                        if ('type' in block && block.type === 'list_group') {
                            td.appendChild(this.renderListGroup(block.items));
                        } else {
                            const element = block as StructuralElement;
                            if (element.paragraph) {
                                td.appendChild(this.renderParagraph(element.paragraph));
                            }
                        }
                    });
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        return tableEl;
    }

    private renderImage(objectId: string | null | undefined): HTMLElement | null {
        const imageData = getImageData(objectId, this.inlineObjects);
        if (!imageData) return null;

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        // Basic functional style for lightbox trigger
        img.style.cursor = 'pointer';
        img.onclick = () => this.openLightbox(img.src);

        return img;
    }

    private openLightbox(src: string) {
        // Create a simple functional lightbox
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';
        overlay.style.cursor = 'pointer';

        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';

        overlay.appendChild(img);
        overlay.onclick = () => document.body.removeChild(overlay);

        document.body.appendChild(overlay);
    }
}
