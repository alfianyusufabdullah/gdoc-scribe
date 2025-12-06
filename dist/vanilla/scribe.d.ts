import { GoogleDoc } from '../core/types';
export declare class GDocScribe {
    private doc;
    private inlineObjects;
    constructor(doc: GoogleDoc);
    render(target: HTMLElement): void;
    private renderCodeBlock;
    private renderParagraph;
    private getDimensionStyle;
    private getColorStyle;
    private renderTextRun;
    private renderListGroup;
    private renderListTree;
    private renderTable;
    private renderImage;
    private openLightbox;
}
