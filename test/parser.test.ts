import { describe, it, expect } from 'vitest';
import { getTextTags, getHeadingTag, getListTagAndStyle, getAlignmentStyle } from '../src/core/parser';
import { processContent } from '../src/core/utils';
import { TextStyle, ParagraphStyle } from '../src/core/types';

describe('Core Parser', () => {
    describe('getTextTags', () => {
        it('should return empty array for undefined style', () => {
            expect(getTextTags(undefined)).toEqual([]);
        });

        it('should detect bold', () => {
            const style: TextStyle = { bold: true };
            expect(getTextTags(style)).toEqual([{ tag: 'strong' }]);
        });

        it('should detect italic', () => {
            const style: TextStyle = { italic: true };
            expect(getTextTags(style)).toEqual([{ tag: 'em' }]);
        });

        it('should detect multiple styles', () => {
            const style: TextStyle = { bold: true, italic: true, underline: true };
            expect(getTextTags(style)).toEqual([
                { tag: 'strong' },
                { tag: 'em' },
                { tag: 'u' }
            ]);
        });

        it('should detect links', () => {
            const style: TextStyle = { link: { url: 'https://example.com' } };
            expect(getTextTags(style)).toEqual([
                {
                    tag: 'a',
                    attrs: {
                        href: 'https://example.com',
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }
                }
            ]);
        });
    });

    describe('getHeadingTag', () => {
        it('should return h1 for TITLE', () => {
            const style: ParagraphStyle = { namedStyleType: 'TITLE' };
            expect(getHeadingTag(style)).toBe('h1');
        });

        it('should return correct heading levels', () => {
            expect(getHeadingTag({ namedStyleType: 'HEADING_1' })).toBe('h1');
            expect(getHeadingTag({ namedStyleType: 'HEADING_2' })).toBe('h2');
            expect(getHeadingTag({ namedStyleType: 'HEADING_6' })).toBe('h6');
        });

        it('should default to p for unknown styles', () => {
            expect(getHeadingTag({ namedStyleType: 'NORMAL_TEXT' })).toBe('p');
            expect(getHeadingTag(undefined)).toBe('p');
        });
    });
});

describe('getListTagAndStyle', () => {
    const mockLists = {
        'list-1': {
            listProperties: {
                nestingLevels: [
                    { glyphType: 'DECIMAL' },
                    { glyphType: 'ALPHA' },
                    { glyphType: 'ROMAN' }
                ]
            }
        },
        'list-2': {
            listProperties: {
                nestingLevels: [
                    { glyphType: 'DISC' },
                    { glyphType: 'CIRCLE' },
                    { glyphType: 'SQUARE' }
                ]
            }
        }
    };

    it('should return default UL for missing list', () => {
        expect(getListTagAndStyle('unknown', 0, mockLists)).toEqual({ tag: 'ul', styleType: 'disc' });
        expect(getListTagAndStyle(null, 0, mockLists)).toEqual({ tag: 'ul', styleType: 'disc' });
    });

    it('should return correct OL styles', () => {
        expect(getListTagAndStyle('list-1', 0, mockLists)).toEqual({ tag: 'ol', styleType: 'decimal' });
        expect(getListTagAndStyle('list-1', 1, mockLists)).toEqual({ tag: 'ol', styleType: 'lower-alpha' });
        expect(getListTagAndStyle('list-1', 2, mockLists)).toEqual({ tag: 'ol', styleType: 'lower-roman' });
    });

    it('should return correct UL styles', () => {
        expect(getListTagAndStyle('list-2', 0, mockLists)).toEqual({ tag: 'ul', styleType: 'disc' });
        expect(getListTagAndStyle('list-2', 1, mockLists)).toEqual({ tag: 'ul', styleType: 'circle' });
        expect(getListTagAndStyle('list-2', 2, mockLists)).toEqual({ tag: 'ul', styleType: 'square' });
    });
});

describe('getAlignmentStyle', () => {
    it('should return correct CSS values', () => {
        expect(getAlignmentStyle('CENTER')).toBe('center');
        expect(getAlignmentStyle('END')).toBe('right');
        expect(getAlignmentStyle('JUSTIFIED')).toBe('justify');
    });

    it('should return undefined for unknown or start alignment', () => {
        expect(getAlignmentStyle('START')).toBeUndefined();
        expect(getAlignmentStyle(undefined)).toBeUndefined();
        expect(getAlignmentStyle('UNKNOWN')).toBeUndefined();
    });
});

describe('processContent', () => {
    it('should separate lists with different IDs', () => {
        const content = [
            { paragraph: { bullet: { listId: 'list-1' } } },
            { paragraph: { bullet: { listId: 'list-1' } } },
            { paragraph: { bullet: { listId: 'list-2' } } },
            { paragraph: { bullet: { listId: 'list-2' } } }
        ] as any;

        const processed = processContent(content);
        expect(processed.length).toBe(2);
        expect((processed[0] as any).type).toBe('list_group');
        expect((processed[0] as any).items.length).toBe(2);
        expect((processed[1] as any).type).toBe('list_group');
        expect((processed[1] as any).items.length).toBe(2);
    });
});

describe('getListTagAndStyle with fallback', () => {
    const mockLists = {
        'list-fallback': {
            listProperties: {
                nestingLevels: [
                    { glyphSymbol: '●' }, // Should be DISC
                    { glyphSymbol: '○' }, // Should be CIRCLE
                    { glyphSymbol: '■' }, // Should be SQUARE
                    { glyphFormat: '%0.' }, // Should be DECIMAL
                    { glyphType: 'GLYPH_TYPE_UNSPECIFIED', glyphFormat: '%0.' } // Should be DECIMAL
                ]
            }
        }
    };

    it('should infer styles from glyphSymbol', () => {
        expect(getListTagAndStyle('list-fallback', 0, mockLists)).toEqual({ tag: 'ul', styleType: 'disc' });
        expect(getListTagAndStyle('list-fallback', 1, mockLists)).toEqual({ tag: 'ul', styleType: 'circle' });
        expect(getListTagAndStyle('list-fallback', 2, mockLists)).toEqual({ tag: 'ul', styleType: 'square' });
    });

    it('should infer styles from glyphFormat', () => {
        expect(getListTagAndStyle('list-fallback', 3, mockLists)).toEqual({ tag: 'ol', styleType: 'decimal' });
        expect(getListTagAndStyle('list-fallback', 4, mockLists)).toEqual({ tag: 'ol', styleType: 'decimal' });
    });
});
