import { useRef } from 'react';

export const useDebounce = (delay = 300) => {
  const timeoutRef = useRef(null);

  const debounce = (func) => {
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  return debounce;
}; 