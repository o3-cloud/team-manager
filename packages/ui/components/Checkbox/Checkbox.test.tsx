
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

afterEach(cleanup);

describe("Checkbox", () => {
  it("exports Checkbox component", () => {
    expect(Checkbox).toBeDefined();
    expect(typeof Checkbox).toBe("function");
  });

  it("renders a checkbox input", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("applies base checkbox class", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toHaveClass("checkbox");
  });

  it("applies primary variant class", () => {
    render(<Checkbox variant="primary" />);
    expect(screen.getByRole("checkbox")).toHaveClass("checkbox-primary");
  });

  it("applies secondary variant class", () => {
    render(<Checkbox variant="secondary" />);
    expect(screen.getByRole("checkbox")).toHaveClass("checkbox-secondary");
  });

  it("applies size class", () => {
    render(<Checkbox size="lg" />);
    expect(screen.getByRole("checkbox")).toHaveClass("checkbox-lg");
  });

  it("applies xs size class", () => {
    render(<Checkbox size="xs" />);
    expect(screen.getByRole("checkbox")).toHaveClass("checkbox-xs");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Checkbox disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("renders a label when label prop is provided", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("associates label with checkbox via htmlFor", () => {
    render(<Checkbox label="Accept terms" id="terms" />);
    const label = screen.getByText("Accept terms").closest("label");
    expect(label?.getAttribute("for")).toBe("terms");
  });

  it("is checked when checked prop is true", () => {
    render(<Checkbox checked onChange={() => undefined} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn(() => undefined);
    render(<Checkbox onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
