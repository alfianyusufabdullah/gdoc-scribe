import { TextStyle, ParagraphStyle, Lists } from './types';

export interface SemanticTag {
    tag: string;
    attrs?: Record<string, string>;
}

export interface ListTagResult {
    tag: string;
    styleType: string;
}

export const getTextTags = (style: TextStyle | undefined): SemanticTag[] => {
    if (!style) return [];

    const tags: SemanticTag[] = [];

    if (style.bold) tags.push({ tag: 'strong' });
    if (style.italic) tags.push({ tag: 'em' });
    if (style.underline) tags.push({ tag: 'u' });
    if (style.strikethrough) tags.push({ tag: 's' });

    if (style.link?.url) {
        tags.push({
            tag: 'a',
            attrs: {
                href: style.link.url,
                target: '_blank',
                rel: 'noopener noreferrer'
            }
        });
    }

    return tags;
};

export const getHeadingTag = (style: ParagraphStyle | undefined): string => {
    const type = style?.namedStyleType;
    if (type === 'TITLE') return 'h1';
    if (type === 'SUBTITLE') return 'p'; // Subtitle usually rendered as p with class, but we are pure semantic.

    if (type?.startsWith('HEADING_')) {
        const level = type.split('_')[1];
        if (['1', '2', '3', '4', '5', '6'].includes(level)) {
            return `h${level}`;
        }
    }

    return 'p';
};

export const getListTagAndStyle = (listId: string | null | undefined, nestingLevel: number | null | undefined, docLists: Lists | null | undefined): ListTagResult => {
    if (!listId || !docLists) return { tag: 'ul', styleType: 'disc' };

    const list = docLists[listId];
    if (!list) return { tag: 'ul', styleType: 'disc' };

    const level = nestingLevel || 0;
    const lvlProps = list.listProperties?.nestingLevels?.[level];

    let glyphType = lvlProps?.glyphType;

    // Fallback logic for missing or unspecified glyph types
    if (!glyphType || glyphType === 'GLYPH_TYPE_UNSPECIFIED') {
        if (lvlProps?.glyphSymbol) {
            const symbol = lvlProps.glyphSymbol;
            if (symbol === '●') glyphType = 'DISC';
            else if (symbol === '○') glyphType = 'CIRCLE';
            else if (symbol === '■') glyphType = 'SQUARE';
            else glyphType = 'DISC';
        } else if (lvlProps?.glyphFormat) {
            // If format contains %, it's likely numbered
            if (lvlProps.glyphFormat.includes('%')) {
                glyphType = 'DECIMAL';
            } else {
                glyphType = 'DISC';
            }
        } else {
            glyphType = 'DISC';
        }
    }

    const glyphMap: Record<string, { tag: string; style: string }> = {
        'DECIMAL': { tag: 'ol', style: 'decimal' },
        'DECIMAL_ZERO': { tag: 'ol', style: 'decimal-leading-zero' },
        'UPPER_ALPHA': { tag: 'ol', style: 'upper-alpha' },
        'ALPHA': { tag: 'ol', style: 'lower-alpha' },
        'UPPER_ROMAN': { tag: 'ol', style: 'upper-roman' },
        'ROMAN': { tag: 'ol', style: 'lower-roman' },
        'DISC': { tag: 'ul', style: 'disc' },
        'CIRCLE': { tag: 'ul', style: 'circle' },
        'SQUARE': { tag: 'ul', style: 'square' },
        'NONE': { tag: 'ul', style: 'none' },
    };

    const mapping = glyphMap[glyphType] || { tag: 'ul', style: 'disc' };

    return {
        tag: mapping.tag,
        styleType: mapping.style
    };
};

export const getAlignmentStyle = (alignment: string | undefined): string | undefined => {
    switch (alignment) {
        case 'CENTER': return 'center';
        case 'END': return 'right';
        case 'JUSTIFIED': return 'justify';
        default: return undefined;
    }
};
