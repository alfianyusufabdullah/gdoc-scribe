import { default as React } from 'react';
import { GoogleDoc } from '../core/types';
export interface GDocViewerProps {
    doc: GoogleDoc | null;
    className?: string;
}
export declare const GDocViewer: React.FC<GDocViewerProps>;
export declare const GDocContent: React.FC<GDocViewerProps>;
