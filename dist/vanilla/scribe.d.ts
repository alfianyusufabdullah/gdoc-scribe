import { GoogleDoc } from '../core/types';
export declare class GDocScribe {
    private doc;
    private inlineObjects;
    constructor(doc: GoogleDoc);
    render(target: HTMLElement): void;
    private renderParagraph;
    private renderTextRun;
    private renderListGroup;
    private renderListTree;
    private renderTable;
    private renderImage;
    private openLightbox;
}
