export declare function emulateTab(): Promise<void>;
export declare namespace emulateTab {
    const from: typeof emulateTabFrom;
    const to: (target: HTMLElement) => Promise<void>;
    const toPreviousElement: () => Promise<void>;
    const toNextElement: () => Promise<void>;
    const backwards: () => Promise<void>;
    const findSelectableElements: typeof findAllElementsSelectableByTab;
}
declare function emulateTabFrom(source?: HTMLElement): {
    toPreviousElement: () => Promise<void>;
    backwards: () => Promise<void>;
    to: (target: HTMLElement) => Promise<void>;
    toNextElement: () => Promise<void>;
};
export declare function findAllElementsSelectableByTab(): HTMLElement[];
export {};
