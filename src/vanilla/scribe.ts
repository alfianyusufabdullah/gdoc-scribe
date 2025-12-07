import { GoogleDoc, StructuralElement, Paragraph, Table, ListItemNode, InlineObjects, TocItem, Transformer, ClassNames, ParagraphProps, ListGroupProps, TableProps, ImageProps, CodeBlockProps } from '../core/types';
import { processContent, buildListTree, getParagraphText, slugify, parseInlineContent, extractHeadings } from '../core/utils';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle, getImageData, getDimensionStyle, getColorStyle } from '../core/parser';

export interface VanillaRenderers {
    paragraph?: (props: ParagraphProps<HTMLElement | DocumentFragment>) => HTMLElement;
    list_group?: (props: ListGroupProps<HTMLElement | DocumentFragment>) => HTMLElement;
    code_block?: (props: CodeBlockProps) => HTMLElement;
    table?: (props: TableProps<HTMLElement | DocumentFragment>) => HTMLElement;
    image?: (props: ImageProps) => HTMLElement | null;
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
                    const children = this.renderListGroupContent(block.items, this.inlineObjects, this.doc.lists);
                    const renderer = this.options.renderers?.list_group || this.defaultRenderListGroup.bind(this);
                    target.appendChild(renderer({
                        children,
                        type: 'unordered',
                        className: this.options.classNames?.list_group,
                        original: { items: block.items, lists: this.doc.lists }
                    }));
                } else if ('type' in block && block.type === 'code_block') {
                    const renderer = this.options.renderers?.code_block || this.defaultRenderCodeBlock.bind(this);
                    target.appendChild(renderer({
                        content: block.content,
                        language: block.language,
                        className: this.options.classNames?.code_block,
                        original: { block }
                    }));
                } else {
                    const element = block as StructuralElement;
                    if (element.paragraph) {
                        const children = this.renderParagraphContent(element.paragraph, this.inlineObjects);
                        const text = getParagraphText(element.paragraph.elements || []);
                        const renderer = this.options.renderers?.paragraph || this.defaultRenderParagraph.bind(this);
                        target.appendChild(renderer({
                            children,
                            style: element.paragraph.paragraphStyle,
                            text,
                            className: this.options.classNames?.paragraph,
                            original: { paragraph: element.paragraph }
                        }));
                    } else if (element.table) {
                        const children = this.renderTableContent(element.table, this.inlineObjects, this.doc.lists);
                        const renderer = this.options.renderers?.table || this.defaultRenderTable.bind(this);
                        target.appendChild(renderer({
                            children,
                            className: this.options.classNames?.table,
                            original: { table: element.table }
                        }));
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

    private defaultRenderCodeBlock(props: CodeBlockProps): HTMLElement {
        const pre = document.createElement('pre');
        if (props.className) {
            pre.className = props.className;
        }

        const code = document.createElement('code');

        if (props.language) {
            code.className = `language-${props.language}`;
        }

        code.textContent = props.content;
        pre.appendChild(code);

        return pre;
    }

    private renderParagraphContent(paragraph: Paragraph, inlineObjects?: InlineObjects | null): DocumentFragment {
        const fragment = document.createDocumentFragment();
        if (paragraph.elements) {
            paragraph.elements.forEach(pElem => {
                if (pElem.textRun) {
                    const span = this.renderTextRun(pElem.textRun);
                    fragment.appendChild(span);
                } else if (pElem.inlineObjectElement) {
                    const objectId = pElem.inlineObjectElement.inlineObjectId;
                    const imageData = getImageData(objectId, inlineObjects);
                    if (imageData) {
                        const renderer = this.options.renderers?.image || this.defaultRenderImage.bind(this);
                        const img = renderer({
                            src: imageData.src,
                            alt: imageData.alt,
                            title: imageData.title,
                            className: this.options.classNames?.image,
                            original: { objectId, inlineObjects }
                        });
                        if (img) fragment.appendChild(img);
                    }
                }
            });
        }
        return fragment;
    }

    private defaultRenderParagraph(props: ParagraphProps<HTMLElement | DocumentFragment>): HTMLElement {
        const style = props.style;
        const tagName = getHeadingTag(style);
        const el = document.createElement(tagName);

        // Apply classNames
        if (props.className) el.classList.add(props.className);
        if (this.options.classNames) {
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
            if (props.text) el.id = slugify(props.text);
        }

        el.appendChild(props.children);

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

    private renderListGroupContent(items: StructuralElement[], inlineObjects?: InlineObjects | null, lists?: any): DocumentFragment {
        const tree = buildListTree(items);
        return this.renderListTreeContent(tree, inlineObjects, lists);
    }

    private renderListTreeContent(nodes: ListItemNode[], inlineObjects?: InlineObjects | null, lists?: any): DocumentFragment {
        const fragment = document.createDocumentFragment();
        if (nodes.length === 0) return fragment;

        const firstNode = nodes[0];
        const listId = firstNode.item.paragraph?.bullet?.listId;
        const level = firstNode.level;

        const { styleType } = getListTagAndStyle(listId, level, lists || this.doc.lists);

        nodes.forEach(node => {
            const li = document.createElement('li');
            if (this.options.classNames?.list_item) {
                li.className = this.options.classNames.list_item;
            }
            li.style.listStyleType = styleType;

            // Render content
            if (node.item.paragraph) {
                const content = this.renderParagraphContent(node.item.paragraph, inlineObjects);
                li.appendChild(content);
            }

            // Render children
            if (node.children.length > 0) {
                const childrenContent = this.renderListTreeContent(node.children, inlineObjects, lists);
                const ul = document.createElement('ul');
                ul.style.listStyleType = 'none';
                ul.style.paddingLeft = '20px';
                ul.appendChild(childrenContent);
                li.appendChild(ul);
            }

            fragment.appendChild(li);
        });

        return fragment;
    }

    private defaultRenderListGroup(props: ListGroupProps<HTMLElement | DocumentFragment>): HTMLElement {
        const tag = props.type === 'ordered' ? 'ol' : 'ul';
        const listEl = document.createElement(tag);
        if (props.className) {
            listEl.className = props.className;
        }
        listEl.appendChild(props.children);
        return listEl;
    }

    private renderTableContent(table: Table, inlineObjects?: InlineObjects | null, lists?: any): DocumentFragment {
        const fragment = document.createDocumentFragment();
        const tbody = document.createElement('tbody');
        fragment.appendChild(tbody);

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
                        if ('type' in block && block.type === 'list_group') {
                            const children = this.renderListGroupContent(block.items, inlineObjects, lists);
                            const renderer = this.options.renderers?.list_group || this.defaultRenderListGroup.bind(this);
                            td.appendChild(renderer({
                                children,
                                type: 'unordered',
                                className: this.options.classNames?.list_group,
                                original: { items: block.items, lists }
                            }));
                        } else if ('type' in block && block.type === 'code_block') {
                            const renderer = this.options.renderers?.code_block || this.defaultRenderCodeBlock.bind(this);
                            td.appendChild(renderer({
                                content: block.content,
                                language: block.language,
                                className: this.options.classNames?.code_block,
                                original: { block }
                            }));
                        } else {
                            const element = block as StructuralElement;
                            if (element.paragraph) {
                                const children = this.renderParagraphContent(element.paragraph, inlineObjects);
                                const text = getParagraphText(element.paragraph.elements || []);
                                const renderer = this.options.renderers?.paragraph || this.defaultRenderParagraph.bind(this);
                                td.appendChild(renderer({
                                    children,
                                    style: element.paragraph.paragraphStyle,
                                    text,
                                    className: this.options.classNames?.paragraph,
                                    original: { paragraph: element.paragraph }
                                }));
                            }
                        }
                    });
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        return fragment;
    }

    private defaultRenderTable(props: TableProps<HTMLElement | DocumentFragment>): HTMLElement {
        const tableEl = document.createElement('table');
        if (props.className) {
            tableEl.className = props.className;
        }
        tableEl.appendChild(props.children);
        return tableEl;
    }

    private defaultRenderImage(props: ImageProps): HTMLElement | null {
        const img = document.createElement('img');
        img.src = props.src;
        img.alt = props.alt;
        if (props.title) img.title = props.title;

        if (props.className) {
            img.className = props.className;
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
