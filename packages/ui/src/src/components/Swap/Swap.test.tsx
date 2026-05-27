
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Swap } from "./Swap";

afterEach(cleanup);

describe("Swap", () => {
  it("exports Swap component", () => {
    expect(Swap).toBeDefined();
    expect(typeof Swap).toBe("function");
  });

  it("renders the off content by default", () => {
    render(<Swap onContent="ON" offContent="OFF" />);
    expect(screen.getByText("OFF")).toBeInTheDocument();
  });

  it("renders the on content", () => {
    render(<Swap onContent="ON" offContent="OFF" />);
    expect(screen.getByText("ON")).toBeInTheDocument();
  });

  it("applies swap class to label", () => {
    const { container } = render(<Swap onContent="ON" offContent="OFF" />);
    expect(container.firstChild).toHaveClass("swap");
  });

  it("applies swap-rotate effect class", () => {
    const { container } = render(<Swap onContent="ON" offContent="OFF" effect="rotate" />);
    expect(container.firstChild).toHaveClass("swap-rotate");
  });

  it("applies swap-flip effect class", () => {
    const { container } = render(<Swap onContent="ON" offContent="OFF" effect="flip" />);
    expect(container.firstChild).toHaveClass("swap-flip");
  });

  it("checkbox is checked when active is true", () => {
    const { container } = render(<Swap onContent="ON" offContent="OFF" active={true} />);
    const checkbox = container.querySelector("input[type='checkbox']");
    expect(checkbox).toBeChecked();
  });

  it("checkbox is unchecked when active is false", () => {
    const { container } = render(<Swap onContent="ON" offContent="OFF" active={false} />);
    const checkbox = container.querySelector("input[type='checkbox']");
    expect(checkbox).not.toBeChecked();
  });

  it("calls onChange when toggled", () => {
    const onChange = vi.fn(() => undefined);
    const { container } = render(<Swap onContent="ON" offContent="OFF" onChange={onChange} />);
    const checkbox = container.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (!checkbox) throw new Error("Expected checkbox input");
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("on content has swap-on class", () => {
    render(<Swap onContent="ON" offContent="OFF" />);
    expect(screen.getByText("ON").closest("[class*='swap-on']")).toBeInTheDocument();
  });

  it("off content has swap-off class", () => {
    render(<Swap onContent="ON" offContent="OFF" />);
    expect(screen.getByText("OFF").closest("[class*='swap-off']")).toBeInTheDocument();
  });
});
