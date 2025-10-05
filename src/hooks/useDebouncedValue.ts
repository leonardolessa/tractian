import { useEffect, useState } from "react";

/**
 * Returns a debounced version of the provided value. The debounced value only
 * updates after the specified delay has elapsed without the value changing.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const normalizedDelay = Math.max(0, delay);

    if (normalizedDelay === 0) {
      setDebouncedValue(value);
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, normalizedDelay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
