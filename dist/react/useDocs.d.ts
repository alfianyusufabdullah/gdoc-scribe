import { default as React } from 'react';
import { GoogleDoc, TocItem } from '../core/types';
interface UseDocsResult {
    html: React.ReactNode;
    toc: TocItem[];
}
export declare const useDocs: (doc: GoogleDoc | null | undefined) => UseDocsResult;
export {};
