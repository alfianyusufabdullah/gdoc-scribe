import { StructuralElement, ProcessedBlock, ListGroupBlock, ListItemNode, TocItem, ParagraphElement } from './types';

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

export const getParagraphText = (elements: ParagraphElement[]): string => {
    return elements
        .map(el => el.textRun?.content || '')
        .join('')
        .replace(/\u000b/g, '')
        .trim();
};

export const processContent = (content: StructuralElement[]): ProcessedBlock[] => {
    const processed: ProcessedBlock[] = [];
    let currentListGroup: ListGroupBlock | null = null;
    let currentCodeBlock: { type: 'code_block', language: string, content: string[] } | null = null;

    if (!content) return [];

    for (let i = 0; i < content.length; i++) {
        const item = content[i];
        const text = item.paragraph ? getParagraphText(item.paragraph.elements || []) : '';

        // Check for Code Block Start
        if (!currentCodeBlock && text.trim().startsWith('```')) {
            const trimmedText = text.trim();
            // Check if it's a single-paragraph code block (starts and ends with ```)
            // We use a simple check first to avoid complex regex if possible, or just regex
            // Regex: ^```(\w*)([\s\S]*?)```$
            // Note: We need to handle cases where content might be empty or just whitespace

            const singleBlockMatch = trimmedText.match(/^```(\w*)\s*([\s\S]*?)\s*```$/);

            if (singleBlockMatch && trimmedText.length > 3) {
                processed.push({
                    type: 'code_block',
                    language: singleBlockMatch[1] || '',
                    content: singleBlockMatch[2]
                });
                continue;
            }

            // Multi-paragraph start
            const language = text.trim().replace(/^```/, '').trim();
            currentCodeBlock = {
                type: 'code_block',
                language: language,
                content: []
            };
            continue;
        }

        // Check for Code Block End
        if (currentCodeBlock && text.trim() === '```') {
            processed.push({
                type: 'code_block',
                language: currentCodeBlock.language,
                content: currentCodeBlock.content.join('\n')
            });
            currentCodeBlock = null;
            continue;
        }

        // Inside Code Block
        if (currentCodeBlock) {
            currentCodeBlock.content.push(text);
            continue;
        }

        // List Grouping Logic
        if (item.paragraph && item.paragraph.bullet) {
            const listId = item.paragraph.bullet.listId;
            if (!currentListGroup || currentListGroup.listId !== listId) {
                currentListGroup = {
                    type: 'list_group',
                    listId: listId || '',
                    items: [item]
                };
                processed.push(currentListGroup);
            } else {
                currentListGroup.items.push(item);
            }
        } else {
            currentListGroup = null;
            processed.push(item);
        }
    }

    // Handle unclosed code block (optional, but good for safety)
    if (currentCodeBlock) {
        processed.push({
            type: 'code_block',
            language: currentCodeBlock.language,
            content: currentCodeBlock.content.join('\n')
        });
    }

    return processed;
};

export const buildListTree = (items: StructuralElement[]): ListItemNode[] => {
    const root: ListItemNode[] = [];
    const stack: ListItemNode[] = [];

    items.forEach((item) => {
        const level = item.paragraph?.bullet?.nestingLevel || 0;
        const node: ListItemNode = { item, children: [], level };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        if (stack.length === 0) {
            root.push(node);
        } else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    });

    return root;
};

export const extractHeadings = (content: StructuralElement[]): TocItem[] => {
    const headings: TocItem[] = [];

    content.forEach((item) => {
        if (item.paragraph && item.paragraph.paragraphStyle?.namedStyleType?.startsWith('HEADING')) {
            const styleType = item.paragraph.paragraphStyle.namedStyleType;
            const level = parseInt(styleType.split('_')[1]);
            const text = getParagraphText(item.paragraph.elements || []);

            if (text && !isNaN(level)) {
                headings.push({
                    id: slugify(text),
                    text,
                    level
                });
            }
        }
    });

    return headings;
};

export interface InlineContent {
    type: 'text' | 'code';
    content: string;
}

export const parseInlineContent = (text: string): InlineContent[] => {
    const parts = text.split(/(`[^`]+`)/g);
    return parts.map(part => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return { type: 'code', content: part.slice(1, -1) } as InlineContent;
        }
        return { type: 'text', content: part } as InlineContent;
    }).filter(part => part.content !== '');
};
