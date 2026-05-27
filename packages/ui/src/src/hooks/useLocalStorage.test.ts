import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

// Clear localStorage between tests
beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  it("returns the initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    const [value] = result.current;
    expect(value).toBe("default");
  });

  it("reads an existing value from localStorage on mount", () => {
    window.localStorage.setItem("key", JSON.stringify("stored"));
    const { result } = renderHook(() => useLocalStorage("key", "default"));
    const [value] = result.current;
    expect(value).toBe("stored");
  });

  it("writes a new value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("key", 0));
    act(() => {
      const [, setValue] = result.current;
      setValue(42);
    });
    const [value] = result.current;
    expect(value).toBe(42);
    expect(JSON.parse(window.localStorage.getItem("key") ?? "null")).toBe(42);
  });

  it("supports functional updater form", () => {
    const { result } = renderHook(() => useLocalStorage("count", 0));
    act(() => {
      const [, setValue] = result.current;
      setValue((prev) => prev + 1);
    });
    const [value] = result.current;
    expect(value).toBe(1);
  });

  it("works with object values", () => {
    const initial = { name: "Alice", age: 30 };
    const { result } = renderHook(() => useLocalStorage("user", initial));
    act(() => {
      const [, setValue] = result.current;
      setValue({ name: "Bob", age: 25 });
    });
    const [value] = result.current;
    expect(value).toEqual({ name: "Bob", age: 25 });
  });

  it("falls back to initialValue when localStorage throws on read", () => {
    const getItemSpy = vi.fn(() => {
      throw new Error("Storage unavailable");
    });
    const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
    window.localStorage.getItem = getItemSpy;

    const { result } = renderHook(() => useLocalStorage("key", "fallback"));
    const [value] = result.current;
    expect(value).toBe("fallback");

    window.localStorage.getItem = originalGetItem;
  });

  it("silently ignores write errors (e.g. quota exceeded)", () => {
    const { result } = renderHook(() => useLocalStorage("key", "initial"));

    const setItemSpy = vi.fn(() => {
      throw new DOMException("QuotaExceededError");
    });
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = setItemSpy;

    // Should not throw
    act(() => {
      const [, setValue] = result.current;
      setValue("new value");
    });
    const [value] = result.current;
    // State should still update even if storage write failed
    expect(value).toBe("new value");

    window.localStorage.setItem = originalSetItem;
  });
});
