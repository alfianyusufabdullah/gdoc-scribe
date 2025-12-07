import { processContent } from '../src/core/utils';
import { StructuralElement, ProcessedBlock, Transformer } from '../src/core/types';
import { describe, it, expect } from 'vitest';

describe('Transformers Middleware', () => {
    const mockContent: StructuralElement[] = [
        {
            startIndex: 1,
            endIndex: 10,
            paragraph: {
                elements: [
                    {
                        startIndex: 1,
                        endIndex: 10,
                        textRun: {
                            content: 'Hello World',
                            textStyle: {}
                        }
                    }
                ],
                paragraphStyle: {
                    namedStyleType: 'NORMAL_TEXT'
                }
            }
        }
    ];

    it('should process content without transformers', () => {
        const result = processContent(mockContent, []);
        expect(result).toHaveLength(1);
        expect((result[0] as StructuralElement).paragraph?.elements?.[0].textRun?.content).toBe('Hello World');
    });

    it('should modify content using a transformer', () => {
        const uppercaseTransformer: Transformer = (blocks) => {
            return blocks.map(block => {
                if ('type' in block) return block;
                const element = block as StructuralElement;
                if (element.paragraph?.elements) {
                    const newElements = element.paragraph.elements.map(el => {
                        if (el.textRun?.content) {
                            return {
                                ...el,
                                textRun: {
                                    ...el.textRun,
                                    content: el.textRun.content.toUpperCase()
                                }
                            };
                        }
                        return el;
                    });
                    return {
                        ...element,
                        paragraph: {
                            ...element.paragraph,
                            elements: newElements
                        }
                    };
                }
                return block;
            });
        };

        const result = processContent(mockContent, [uppercaseTransformer]);
        expect((result[0] as StructuralElement).paragraph?.elements?.[0].textRun?.content).toBe('HELLO WORLD');
    });

    it('should filter blocks using a transformer', () => {
        const filterTransformer: Transformer = (blocks) => {
            return [];
        };

        const result = processContent(mockContent, [filterTransformer]);
        expect(result).toHaveLength(0);
    });

    it('should chain multiple transformers', () => {
        const appendTransformer: Transformer = (blocks) => {
            return blocks.map(block => {
                if ('type' in block) return block;
                const element = block as StructuralElement;
                if (element.paragraph?.elements) {
                    const newElements = element.paragraph.elements.map(el => {
                        if (el.textRun?.content) {
                            return {
                                ...el,
                                textRun: {
                                    ...el.textRun,
                                    content: el.textRun.content + '!'
                                }
                            };
                        }
                        return el;
                    });
                    return {
                        ...element,
                        paragraph: {
                            ...element.paragraph,
                            elements: newElements
                        }
                    };
                }
                return block;
            });
        };

        const uppercaseTransformer: Transformer = (blocks) => {
            return blocks.map(block => {
                if ('type' in block) return block;
                const element = block as StructuralElement;
                if (element.paragraph?.elements) {
                    const newElements = element.paragraph.elements.map(el => {
                        if (el.textRun?.content) {
                            return {
                                ...el,
                                textRun: {
                                    ...el.textRun,
                                    content: el.textRun.content.toUpperCase()
                                }
                            };
                        }
                        return el;
                    });
                    return {
                        ...element,
                        paragraph: {
                            ...element.paragraph,
                            elements: newElements
                        }
                    };
                }
                return block;
            });
        };

        // Order: Append '!' then Uppercase -> 'Hello World!' -> 'HELLO WORLD!'
        const result = processContent(mockContent, [appendTransformer, uppercaseTransformer]);
        expect((result[0] as StructuralElement).paragraph?.elements?.[0].textRun?.content).toBe('HELLO WORLD!');
    });
});
