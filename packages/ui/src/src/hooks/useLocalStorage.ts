import { useCallback, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- JSON.parse returns any; T is caller-controlled with no runtime schema
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Ignore write errors (e.g. private mode, quota exceeded)
        }
        return next;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
