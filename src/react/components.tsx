import React from 'react';
import { GoogleDoc } from '../core/types';
import { useDocs, UseDocsOptions } from './useDocs';

export interface GDocViewerProps extends UseDocsOptions {
    doc: GoogleDoc | null;
    className?: string;
}

export const GDocViewer: React.FC<GDocViewerProps> = ({ doc, className, renderers, transformers }) => {
    const { html, toc } = useDocs(doc, { renderers, transformers });

    if (!doc) return null;

    return (
        <div className={className}>
            <div className="gdoc-content">
                {html}
            </div>
            {toc.length > 0 && (
                <nav className="gdoc-toc">
                    <ul>
                        {toc.map(item => (
                            <li key={item.id} className={`gdoc-toc-level-${item.level}`}>
                                <a href={`#${item.id}`}>{item.text}</a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    );
};

export const GDocContent: React.FC<GDocViewerProps> = ({ doc, className, renderers, transformers }) => {
    const { html } = useDocs(doc, { renderers, transformers });
    if (!doc) return null;
    return <div className={className}>{html}</div>;
};
