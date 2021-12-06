import React from "react";

export interface Dimensions {
    left: number, right: number,
    top: number, bottom: number,
    x: number, y: number,
    width: number, height: number
}

const defaultDimensions: Dimensions = {
    left: 0, right: 0, top: 0, bottom: 0, x: 0, y: 0, width: 0, height: 0
}
const defaultDimensionsString = JSON.stringify(defaultDimensions);

/**
 * Determines the dimensions of the element, effectively a hook for
 * getBoundingClientRect. Unlike every other implementation online, this one
 * does actually seem to catch every movement and size change, even those
 * caused by only moving or resizing the element with JavaScript.
 * 
 * WARNING: This hook is not debounced or rate limited. Do not use it to track
 * continuous motion.
 * 
 * @returns ref, size of the value of ref, whether anything is visible
 */
export function useDimensions<T extends HTMLElement>(): [React.Ref<T>, Dimensions, boolean] {
    const ref = React.useRef<T | null>(null);
    const watcher = React.useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = React.useState<string>(defaultDimensionsString);
    // This tiny div tracks the top left corner of the element
    React.useLayoutEffect(() => {
        if (!ref.current) return;
        watcher.current = document.createElement('div');
        watcher.current.style.position = 'fixed';
        watcher.current.style.width = '2px';
        watcher.current.style.height = '2px';
        ref.current.append(watcher.current);
        return () => watcher.current?.remove();
    }, [ref.current]);
    const recalculate = React.useCallback(() => {
        if (!watcher.current || !ref.current) return;
        const data = ref.current.getBoundingClientRect();
        watcher.current.style.top = `${data.top-1}px`;
        watcher.current.style.left = `${data.left-1}px`;
        if (data) setDimensions(JSON.stringify(data));
    }, []);
    React.useEffect(() => {
        if (!ref.current) return;
        recalculate();
        const resize = new ResizeObserver(recalculate);
        resize.observe(ref.current);
        return () => resize.disconnect();
    }, [ref.current, recalculate]);
    React.useEffect(() => {
        if (!watcher.current) return;
        // Detect resizing the watcher
        const resize = new ResizeObserver(recalculate);
        resize.observe(watcher.current);
        return () => resize.disconnect();
    }, [watcher.current, recalculate]);
    // Detect movement
    React.useEffect(() => {
        if (!watcher.current) return;
        const move = new IntersectionObserver(ev => {
            if (Math.abs(ev[0].intersectionRatio - 0.25) > 0.0001) return;
            recalculate();
        }, { root: ref.current });
        move.observe(watcher.current);
        return () => move.disconnect();
    });
    const dims = React.useMemo(() => JSON.parse(dimensions), [dimensions]);
    return [
        v => {
            ref.current = v;
            recalculate();
        },
        dims,
        dims.width > 0 && dims.height > 0
    ];
}