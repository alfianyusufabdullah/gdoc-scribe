import { default as React } from 'react';
import { GoogleDoc } from '../core/types';
import { UseDocsOptions } from './useDocs';
export interface GDocViewerProps extends UseDocsOptions {
    doc: GoogleDoc | null;
    className?: string;
}
export declare const GDocViewer: React.FC<GDocViewerProps>;
export declare const GDocContent: React.FC<GDocViewerProps>;
