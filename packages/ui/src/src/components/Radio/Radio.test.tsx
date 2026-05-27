
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Radio } from "./Radio";

afterEach(cleanup);

describe("Radio", () => {
  it("exports Radio component", () => {
    expect(Radio).toBeDefined();
    expect(typeof Radio).toBe("function");
  });

  it("renders a radio input", () => {
    render(<Radio name="group" value="a" />);
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  it("applies base radio class", () => {
    render(<Radio name="group" value="a" />);
    expect(screen.getByRole("radio")).toHaveClass("radio");
  });

  it("applies primary variant class", () => {
    render(<Radio name="group" value="a" variant="primary" />);
    expect(screen.getByRole("radio")).toHaveClass("radio-primary");
  });

  it("applies secondary variant class", () => {
    render(<Radio name="group" value="a" variant="secondary" />);
    expect(screen.getByRole("radio")).toHaveClass("radio-secondary");
  });

  it("applies size class", () => {
    render(<Radio name="group" value="a" size="lg" />);
    expect(screen.getByRole("radio")).toHaveClass("radio-lg");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Radio name="group" value="a" disabled />);
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("renders a label when label prop is provided", () => {
    render(<Radio name="group" value="a" label="Option A" />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
  });

  it("associates label with radio via htmlFor", () => {
    render(<Radio name="group" value="a" label="Option A" id="opt-a" />);
    const label = screen.getByText("Option A").closest("label");
    expect(label?.getAttribute("for")).toBe("opt-a");
  });

  it("is checked when checked prop is true", () => {
    render(<Radio name="group" value="a" checked onChange={() => undefined} />);
    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("calls onChange when selected", () => {
    const onChange = vi.fn(() => undefined);
    render(<Radio name="group" value="a" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
