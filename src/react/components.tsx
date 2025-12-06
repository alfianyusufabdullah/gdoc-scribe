import React from 'react';
import { GoogleDoc } from '../core/types';
import { useDocs } from './useDocs';

export interface GDocViewerProps {
    doc: GoogleDoc | null;
    className?: string;
}

export const GDocViewer: React.FC<GDocViewerProps> = ({ doc, className }) => {
    const { html, toc } = useDocs(doc);

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

export const GDocContent: React.FC<GDocViewerProps> = ({ doc, className }) => {
    const { html } = useDocs(doc);
    if (!doc) return null;
    return <div className={className}>{html}</div>;
};
