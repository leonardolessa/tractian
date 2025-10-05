import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedValue } from "../../hooks/useDebouncedValue";

describe("useDebouncedValue", () => {
  it("delays updates until the delay elapses", () => {
    vi.useFakeTimers();

    try {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 200),
        { initialProps: { value: "initial" } },
      );

      expect(result.current).toBe("initial");

      rerender({ value: "updated" });
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(199);
      });
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current).toBe("updated");
    } finally {
      vi.useRealTimers();
    }
  });

  it("updates immediately when delay is zero", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 0),
      { initialProps: { value: 1 } },
    );

    expect(result.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current).toBe(2);
  });
});
