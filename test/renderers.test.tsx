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
        const CustomParagraph = ({ paragraph }: any) => (
            <div data-testid="custom-paragraph">
                Custom: {paragraph.elements[0].textRun.content}
            </div>
        );

        const html = renderToStaticMarkup(<TestComponent doc={mockDoc} options={{ renderers: { paragraph: CustomParagraph } }} />);
        expect(html).toContain('Custom: Hello World');
        expect(html).toContain('data-testid="custom-paragraph"');
    });

    it('should apply classNames to default renderer', () => {
        const html = renderToStaticMarkup(<TestComponent doc={mockDoc} options={{ classNames: { paragraph: 'my-custom-class' } }} />);
        expect(html).toContain('class="my-custom-class"');
    });
});
