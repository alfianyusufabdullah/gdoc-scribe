import { GoogleDoc, TocItem } from '../core/types';
export declare class GDocScribe {
    private doc;
    private inlineObjects;
    constructor(doc: GoogleDoc);
    getToc(): TocItem[];
    render(target: HTMLElement): void;
    private renderCodeBlock;
    private renderParagraph;
    private renderTextRun;
    private renderListGroup;
    private renderListTree;
    private renderTable;
    private renderImage;
    private openLightbox;
}
