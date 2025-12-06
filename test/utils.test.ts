import { describe, it, expect } from 'vitest';
import { slugify, getParagraphText, processContent, buildListTree, extractHeadings } from '../src/core/utils';
import { StructuralElement, ParagraphElement } from '../src/core/types';

describe('Core Utils', () => {
    describe('slugify', () => {
        it('should convert text to slug', () => {
            expect(slugify('Hello World')).toBe('hello-world');
            expect(slugify('Test 123')).toBe('test-123');
            expect(slugify('  Trim Me  ')).toBe('trim-me');
            expect(slugify('Special @#$ Characters')).toBe('special-characters');
        });
    });

    describe('getParagraphText', () => {
        it('should extract text from elements', () => {
            const elements: ParagraphElement[] = [
                { textRun: { content: 'Hello ' } },
                { textRun: { content: 'World' } }
            ];
            expect(getParagraphText(elements)).toBe('Hello World');
        });

        it('should handle empty elements', () => {
            expect(getParagraphText([])).toBe('');
        });

        it('should remove vertical tabs', () => {
            const elements: ParagraphElement[] = [
                { textRun: { content: 'Line\u000bBreak' } }
            ];
            expect(getParagraphText(elements)).toBe('LineBreak');
        });
    });

    describe('processContent', () => {
        it('should group list items', () => {
            const content: StructuralElement[] = [
                { paragraph: { elements: [{ textRun: { content: 'P1' } }] } },
                { paragraph: { bullet: { listId: 'l1' }, elements: [{ textRun: { content: 'L1' } }] } },
                { paragraph: { bullet: { listId: 'l1' }, elements: [{ textRun: { content: 'L2' } }] } },
                { paragraph: { elements: [{ textRun: { content: 'P2' } }] } }
            ];

            const processed = processContent(content);
            expect(processed).toHaveLength(3);
            expect(processed[0]).toHaveProperty('paragraph');
            expect(processed[1]).toHaveProperty('type', 'list_group');
            expect((processed[1] as any).items).toHaveLength(2);
            expect(processed[2]).toHaveProperty('paragraph');
        });
    });

    describe('buildListTree', () => {
        it('should build nested tree', () => {
            const items: StructuralElement[] = [
                { paragraph: { bullet: { nestingLevel: 0 }, elements: [{ textRun: { content: '1' } }] } },
                { paragraph: { bullet: { nestingLevel: 1 }, elements: [{ textRun: { content: '1.1' } }] } },
                { paragraph: { bullet: { nestingLevel: 0 }, elements: [{ textRun: { content: '2' } }] } }
            ];

            const tree = buildListTree(items);
            expect(tree).toHaveLength(2);
            expect(tree[0].level).toBe(0);
            expect(tree[0].children).toHaveLength(1);
            expect(tree[0].children[0].level).toBe(1);
            expect(tree[1].level).toBe(0);
            expect(tree[1].children).toHaveLength(0);
        });
    });

    describe('extractHeadings', () => {
        it('should extract headings for TOC', () => {
            const content: StructuralElement[] = [
                {
                    paragraph: {
                        paragraphStyle: { namedStyleType: 'HEADING_1' },
                        elements: [{ textRun: { content: 'Title 1' } }]
                    }
                },
                {
                    paragraph: {
                        paragraphStyle: { namedStyleType: 'NORMAL_TEXT' },
                        elements: [{ textRun: { content: 'Text' } }]
                    }
                },
                {
                    paragraph: {
                        paragraphStyle: { namedStyleType: 'HEADING_2' },
                        elements: [{ textRun: { content: 'Subtitle' } }]
                    }
                }
            ];

            const headings = extractHeadings(content);
            expect(headings).toHaveLength(2);
            expect(headings[0]).toEqual({ id: 'title-1', text: 'Title 1', level: 1 });
            expect(headings[1]).toEqual({ id: 'subtitle', text: 'Subtitle', level: 2 });
        });
    });
});
