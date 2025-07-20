import { useMemo, useCallback, useState, useEffect } from 'react';

// Memoized value hook
export const useMemoizedValue = (value, deps) => {
    return useMemo(() => value, deps);
};

// Memoized callback hook
export const useMemoizedCallback = (callback, deps) => {
    return useCallback(callback, deps);
};

// Memoized expensive calculation
export const useMemoizedCalculation = (calculation, deps) => {
    return useMemo(() => {
        console.time('Expensive calculation');
        const result = calculation();
        console.timeEnd('Expensive calculation');
        return result;
    }, deps);
};

// Debounced value hook
export const useDebouncedValue = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}; 