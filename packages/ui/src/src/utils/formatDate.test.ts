import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("formats a Date object with default options", () => {
    const date = new Date("2026-04-12T00:00:00.000Z");
    const result = formatDate(date);
    expect(result).toContain("2026");
    expect(result).toContain("April");
    expect(result).toContain("12");
  });

  it("formats an ISO string", () => {
    const result = formatDate("2026-01-01T00:00:00.000Z");
    expect(result).toContain("2026");
  });

  it("respects custom format options", () => {
    const date = new Date("2026-04-12T00:00:00.000Z");
    const result = formatDate(date, { year: "numeric", month: "2-digit", day: "2-digit" }, "en-US");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
