
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Calendar } from "./Calendar";

afterEach(cleanup);

describe("Calendar", () => {
  it("exports Calendar component", () => {
    expect(Calendar).toBeDefined();
    expect(typeof Calendar).toBe("function");
  });

  it("renders an input of type date", () => {
    const { container } = render(<Calendar />);
    const input = container.querySelector("input[type=date]");
    expect(input).toBeInTheDocument();
  });

  it("has input and input-bordered classes", () => {
    const { container } = render(<Calendar />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("input");
    expect(input).toHaveClass("input-bordered");
  });

  it("sets the value when provided", () => {
    const { container } = render(
      <Calendar
        value="2026-04-12"
        onChange={() => {
          /* no-op */
        }}
      />
    );
    expect(container.querySelector("input")).toHaveValue("2026-04-12");
  });

  it("passes aria-label to the input", () => {
    const { container } = render(<Calendar aria-label="Select a date" />);
    expect(container.querySelector("input")).toHaveAttribute("aria-label", "Select a date");
  });

  it("calls onChange when value changes", () => {
    let changed = false;
    const { container } = render(
      <Calendar
        onChange={() => {
          changed = true;
        }}
      />
    );
    const input = container.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("Expected input element");
    fireEvent.change(input, { target: { value: "2026-04-12" } });
    expect(changed).toBe(true);
  });
});
