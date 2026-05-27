
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Range } from "./Range";

afterEach(cleanup);

describe("Range", () => {
  it("exports Range component", () => {
    expect(Range).toBeDefined();
    expect(typeof Range).toBe("function");
  });

  it("renders a range input", () => {
    render(<Range />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("applies base range class", () => {
    render(<Range />);
    expect(screen.getByRole("slider")).toHaveClass("range");
  });

  it("applies primary variant class", () => {
    render(<Range variant="primary" />);
    expect(screen.getByRole("slider")).toHaveClass("range-primary");
  });

  it("applies secondary variant class", () => {
    render(<Range variant="secondary" />);
    expect(screen.getByRole("slider")).toHaveClass("range-secondary");
  });

  it("applies size class", () => {
    render(<Range size="lg" />);
    expect(screen.getByRole("slider")).toHaveClass("range-lg");
  });

  it("applies xs size class", () => {
    render(<Range size="xs" />);
    expect(screen.getByRole("slider")).toHaveClass("range-xs");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Range disabled />);
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("passes min and max props", () => {
    render(<Range min={0} max={100} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
  });

  it("passes step prop", () => {
    render(<Range step={5} />);
    expect(screen.getByRole("slider")).toHaveAttribute("step", "5");
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn(() => undefined);
    render(<Range onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "50" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
