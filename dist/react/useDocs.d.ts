import { default as React } from 'react';
import { GoogleDoc, ClassNames, Transformer } from '../core/types';
import { RendererRegistry } from './renderers';
export interface UseDocsOptions {
    renderers?: RendererRegistry;
    transformers?: Transformer[];
    classNames?: ClassNames;
}
export interface UseDocsResult {
    html: React.ReactNode;
    toc: {
        id: string;
        text: string;
        level: number;
    }[];
}
export declare const useDocs: (doc: GoogleDoc | null | undefined, options?: UseDocsOptions) => UseDocsResult;
