import { describe, it, expect, beforeEach } from 'vitest';
import { GDocScribe } from '../src/vanilla/scribe';
import { GoogleDoc } from '../src/core/types';

describe('Vanilla Renderers', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
    });

    const mockDoc: GoogleDoc = {
        body: {
            content: [
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
            ]
        }
    };

    it('should render default paragraph', () => {
        const scribe = new GDocScribe(mockDoc);
        scribe.render(container);
        expect(container.innerHTML).toContain('<p>Hello World</p>');
    });

    it('should use custom paragraph renderer', () => {
        const scribe = new GDocScribe(mockDoc, {
            renderers: {
                paragraph: ({ children, className }) => {
                    const div = document.createElement('div');
                    div.className = `custom-p ${className || ''}`;
                    div.appendChild(children);
                    return div;
                }
            }
        });
        scribe.render(container);
        expect(container.innerHTML).toContain('<div class="custom-p ">Hello World</div>');
    });

    const mockDocWithImage: GoogleDoc = {
        body: {
            content: [
                {
                    startIndex: 1,
                    endIndex: 2,
                    paragraph: {
                        elements: [
                            {
                                startIndex: 1,
                                endIndex: 2,
                                inlineObjectElement: {
                                    inlineObjectId: 'obj1',
                                    textStyle: {}
                                }
                            }
                        ],
                        paragraphStyle: {
                            namedStyleType: 'NORMAL_TEXT'
                        }
                    }
                }
            ]
        },
        inlineObjects: {
            'obj1': {
                inlineObjectProperties: {
                    embeddedObject: {
                        imageProperties: {
                            contentUri: 'https://example.com/img.png'
                        },
                        title: 'Test Image'
                    }
                }
            }
        }
    };

    it('should render default image', () => {
        const scribe = new GDocScribe(mockDocWithImage);
        scribe.render(container);
        expect(container.innerHTML).toContain('<img src="https://example.com/img.png" alt="Test Image"');
    });

    it('should use custom image renderer', () => {
        const scribe = new GDocScribe(mockDocWithImage, {
            renderers: {
                image: ({ src, alt, className }) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = alt;
                    img.className = `custom-img ${className || ''}`;
                    return img;
                }
            }
        });
        scribe.render(container);
        expect(container.innerHTML).toContain('<img src="https://example.com/img.png" alt="Test Image" class="custom-img "');
    });
});
