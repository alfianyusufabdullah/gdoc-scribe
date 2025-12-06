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
    if (!content) return [];

    content.forEach((item) => {
        if (item.paragraph && item.paragraph.bullet) {
            const listId = item.paragraph.bullet.listId;

            if (currentListGroup) {
                const currentListId = currentListGroup.items[0].paragraph?.bullet?.listId;
                if (currentListId !== listId) {
                    currentListGroup = { type: 'list_group', items: [] };
                    processed.push(currentListGroup);
                }
            } else {
                currentListGroup = { type: 'list_group', items: [] };
                processed.push(currentListGroup);
            }
            currentListGroup.items.push(item);
        } else {
            currentListGroup = null;
            processed.push(item);
        }
    });
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
