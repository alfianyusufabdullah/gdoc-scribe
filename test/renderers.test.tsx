import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { useDocs } from '../src/react/useDocs';
import { GoogleDoc } from '../src/core/types';

// Mock component for testing useDocs hook
const TestComponent = ({ doc, options }: { doc: GoogleDoc, options?: any }) => {
    const { html } = useDocs(doc, options);
    return <div>{html}</div>;
};

describe('React Renderers', () => {
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

    it('should render default paragraph renderer', () => {
        const html = renderToStaticMarkup(<TestComponent doc={mockDoc} />);
        expect(html).toContain('Hello World');
        expect(html).toContain('<p');
    });

    it('should use custom paragraph renderer', () => {
        const CustomParagraph = ({ children, className }: any) => <div className={`custom-p ${className || ''}`}>{children}</div>;
        const html = renderToStaticMarkup(
            <TestComponent doc={mockDoc} options={{ renderers: { paragraph: CustomParagraph } }} />
        );
        expect(html).toContain('<div class="custom-p ">Hello World</div>');
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
                                    inlineObjectId: 'inline_object_1',
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
            'inline_object_1': {
                inlineObjectProperties: {
                    embeddedObject: {
                        imageProperties: {
                            contentUri: 'https://example.com/image.png'
                        },
                        title: 'Test Image',
                        description: 'A test image'
                    }
                }
            }
        }
    };

    it('should use custom image renderer', () => {
        const CustomImage = ({ src, alt }: any) => <img src={src} alt={alt} className="custom-img" />;
        const html = renderToStaticMarkup(
            <TestComponent
                doc={mockDocWithImage}
                options={{ renderers: { image: CustomImage } }}
            />
        );
        expect(html).toContain('<img src="https://example.com/image.png" alt="Test Image" class="custom-img"/>');
    });

    it('should apply classNames to paragraph', () => {
        const html = renderToStaticMarkup(
            <TestComponent
                doc={mockDoc}
                options={{ classNames: { paragraph: 'text-blue-500' } }}
            />
        );
        expect(html).toContain('<p class="text-blue-500">Hello World</p>');
    });

    it('should apply classNames to image', () => {
        const html = renderToStaticMarkup(
            <TestComponent
                doc={mockDocWithImage}
                options={{ classNames: { image: 'img-fluid' } }}
            />
        );
        // The default style for images is applied by the renderer, so we need to include it in the expectation.
        expect(html).toContain('<img src="https://example.com/image.png" alt="Test Image" class="img-fluid" style="max-width:100%;height:auto;display:block;margin:1rem 0"/>');
    });
});
