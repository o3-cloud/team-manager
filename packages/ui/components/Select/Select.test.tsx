
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Select } from "./Select";

afterEach(cleanup);

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

describe("Select", () => {
  it("exports Select component", () => {
    expect(Select).toBeDefined();
    expect(typeof Select).toBe("function");
  });

  it("renders a select element", () => {
    render(<Select options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("applies base select classes", () => {
    render(<Select options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("select");
    expect(select).toHaveClass("select-bordered");
  });

  it("applies primary variant class", () => {
    render(<Select options={options} variant="primary" />);
    expect(screen.getByRole("combobox")).toHaveClass("select-primary");
  });

  it("applies size class", () => {
    render(<Select options={options} size="lg" />);
    expect(screen.getByRole("combobox")).toHaveClass("select-lg");
  });

  it("renders all options", () => {
    render(<Select options={options} />);
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
    expect(screen.getByText("Option C")).toBeInTheDocument();
  });

  it("renders a label when label prop is provided", () => {
    render(<Select options={options} label="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("associates label with select via htmlFor", () => {
    render(<Select options={options} label="Pick one" id="pick" />);
    const label = screen.getByText("Pick one").closest("label");
    expect(label?.getAttribute("for")).toBe("pick");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Select options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders an error message when error prop is provided", () => {
    render(<Select options={options} error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("applies select-error class when error prop is provided", () => {
    render(<Select options={options} error="Required field" />);
    expect(screen.getByRole("combobox")).toHaveClass("select-error");
  });

  it("calls onChange when selection changes", () => {
    const onChange = vi.fn(() => undefined);
    render(<Select options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "b" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
