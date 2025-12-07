import { GoogleDoc, StructuralElement, Paragraph, Table, ListItemNode, InlineObjects, TocItem, Transformer, CodeBlock, ClassNames } from '../core/types';
import { processContent, buildListTree, getParagraphText, slugify, parseInlineContent, extractHeadings } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, getImageData, getDimensionStyle, getColorStyle } from '../core/parser';

export interface VanillaRenderers {
    paragraph?: (p: Paragraph, inlineObjects?: InlineObjects | null) => HTMLElement;
    list_group?: (items: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: any) => HTMLElement;
    code_block?: (block: CodeBlock) => HTMLElement;
    table?: (table: Table, inlineObjects?: InlineObjects | null, lists?: any) => HTMLElement;
    image?: (objectId: string | null | undefined, inlineObjects?: InlineObjects | null) => HTMLElement | null;
}

export interface ScribeOptions {
    renderers?: VanillaRenderers;
    transformers?: Transformer[];
    classNames?: ClassNames;
}

export class GDocScribe {
    private doc: GoogleDoc;
    private inlineObjects: InlineObjects | null;
    private options: ScribeOptions;

    constructor(doc: GoogleDoc, options: ScribeOptions = {}) {
        this.doc = doc;
        this.inlineObjects = doc.inlineObjects || null;
        this.options = options;
    }

    public getToc(): TocItem[] {
        if (!this.doc.body?.content) return [];
        return extractHeadings(this.doc.body.content);
    }

    public render(target: HTMLElement): void {
        target.innerHTML = ''; // Clear target
        if (!this.doc.body?.content) return;

        const blocks = processContent(this.doc.body.content, this.options.transformers);

        blocks.forEach(block => {
            try {
                if ('type' in block && block.type === 'list_group') {
                    const renderer = this.options.renderers?.list_group || this.renderListGroup.bind(this);
                    target.appendChild(renderer(block.items, this.inlineObjects, this.doc.lists));
                } else if ('type' in block && block.type === 'code_block') {
                    const renderer = this.options.renderers?.code_block || this.renderCodeBlock.bind(this);
                    target.appendChild(renderer(block));
                } else {
                    const element = block as StructuralElement;
                    if (element.paragraph) {
                        const renderer = this.options.renderers?.paragraph || this.renderParagraph.bind(this);
                        target.appendChild(renderer(element.paragraph, this.inlineObjects));
                    } else if (element.table) {
                        const renderer = this.options.renderers?.table || this.renderTable.bind(this);
                        target.appendChild(renderer(element.table, this.inlineObjects, this.doc.lists));
                    }
                }
            } catch (e) {
                console.error("Error rendering block:", e);
                const errorDiv = document.createElement('div');
                errorDiv.style.color = 'red';
                errorDiv.style.border = '1px dashed red';
                errorDiv.style.padding = '8px';
                errorDiv.textContent = 'Error rendering block';
                target.appendChild(errorDiv);
            }
        });
    }

    private renderCodeBlock(block: CodeBlock): HTMLElement {
        const pre = document.createElement('pre');
        if (this.options.classNames?.code_block) {
            pre.className = this.options.classNames.code_block;
        }

        const code = document.createElement('code');

        if (block.language) {
            code.className = `language-${block.language}`;
        }

        code.textContent = block.content;
        pre.appendChild(code);

        return pre;
    }

    private renderParagraph(paragraph: Paragraph, inlineObjects?: InlineObjects | null): HTMLElement {
        const style = paragraph.paragraphStyle;
        const tagName = getHeadingTag(style);
        const el = document.createElement(tagName);

        // Apply classNames
        if (this.options.classNames) {
            if (this.options.classNames.paragraph) el.classList.add(this.options.classNames.paragraph);
            if (tagName === 'h1' && this.options.classNames.h1) el.classList.add(this.options.classNames.h1);
            if (tagName === 'h2' && this.options.classNames.h2) el.classList.add(this.options.classNames.h2);
            if (tagName === 'h3' && this.options.classNames.h3) el.classList.add(this.options.classNames.h3);
            if (tagName === 'h4' && this.options.classNames.h4) el.classList.add(this.options.classNames.h4);
            if (tagName === 'h5' && this.options.classNames.h5) el.classList.add(this.options.classNames.h5);
            if (tagName === 'h6' && this.options.classNames.h6) el.classList.add(this.options.classNames.h6);
        }

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
                    const renderer = this.options.renderers?.image || this.renderImage.bind(this);
                    const img = renderer(pElem.inlineObjectElement.inlineObjectId, inlineObjects);
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

    private renderListGroup(items: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: any): HTMLElement {
        const tree = buildListTree(items);
        return this.renderListTree(tree, inlineObjects, lists);
    }

    private renderListTree(nodes: ListItemNode[], inlineObjects?: InlineObjects | null, lists?: any): HTMLElement {
        if (nodes.length === 0) return document.createElement('ul');

        const firstNode = nodes[0];
        const listId = firstNode.item.paragraph?.bullet?.listId;
        const level = firstNode.level;

        const { tag, styleType } = getListTagAndStyle(listId, level, lists || this.doc.lists);

        const listEl = document.createElement(tag);
        listEl.style.listStyleType = styleType;
        if (this.options.classNames?.list_group) {
            listEl.className = this.options.classNames.list_group;
        }

        nodes.forEach(node => {
            const li = document.createElement('li');
            if (this.options.classNames?.list_item) {
                li.className = this.options.classNames.list_item;
            }

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
                li.appendChild(this.renderListTree(node.children, inlineObjects, lists));
            }

            listEl.appendChild(li);
        });

        return listEl;
    }

    private renderTable(table: Table, inlineObjects?: InlineObjects | null, lists?: any): HTMLElement {
        const tableEl = document.createElement('table');
        if (this.options.classNames?.table) {
            tableEl.className = this.options.classNames.table;
        }

        const tbody = document.createElement('tbody');
        tableEl.appendChild(tbody);

        (table.tableRows || []).forEach(row => {
            const tr = document.createElement('tr');
            if (this.options.classNames?.table_row) {
                tr.className = this.options.classNames.table_row;
            }

            (row.tableCells || []).forEach(cell => {
                const td = document.createElement('td');
                if (this.options.classNames?.table_cell) {
                    td.className = this.options.classNames.table_cell;
                }

                if (cell.tableCellStyle?.columnSpan) td.colSpan = cell.tableCellStyle.columnSpan;
                if (cell.tableCellStyle?.rowSpan) td.rowSpan = cell.tableCellStyle.rowSpan;

                // Render cell content recursively
                if (cell.content) {
                    const blocks = processContent(cell.content, this.options.transformers);
                    blocks.forEach(block => {
                        // Reuse main render logic for recursion if possible, but here we just do simple dispatch
                        // Ideally we should refactor main render loop to be reusable
                        if ('type' in block && block.type === 'list_group') {
                            const renderer = this.options.renderers?.list_group || this.renderListGroup.bind(this);
                            td.appendChild(renderer(block.items, inlineObjects, lists));
                        } else if ('type' in block && block.type === 'code_block') {
                            const renderer = this.options.renderers?.code_block || this.renderCodeBlock.bind(this);
                            td.appendChild(renderer(block));
                        } else {
                            const element = block as StructuralElement;
                            if (element.paragraph) {
                                const renderer = this.options.renderers?.paragraph || this.renderParagraph.bind(this);
                                td.appendChild(renderer(element.paragraph, inlineObjects));
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

    private renderImage(objectId: string | null | undefined, inlineObjects?: InlineObjects | null): HTMLElement | null {
        const imageData = getImageData(objectId, inlineObjects);
        if (!imageData) return null;

        const img = document.createElement('img');
        img.src = imageData.src;
        img.alt = imageData.alt;

        if (this.options.classNames?.image) {
            img.className = this.options.classNames.image;
        }

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
