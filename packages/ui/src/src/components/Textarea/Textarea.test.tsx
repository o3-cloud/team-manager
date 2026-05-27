
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Textarea } from "./Textarea";

afterEach(cleanup);

describe("Textarea", () => {
  it("exports Textarea component", () => {
    expect(Textarea).toBeDefined();
    expect(typeof Textarea).toBe("function");
  });

  it("renders a textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies base textarea classes", () => {
    render(<Textarea />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveClass("textarea");
    expect(textarea).toHaveClass("textarea-bordered");
  });

  it("applies primary variant class", () => {
    render(<Textarea variant="primary" />);
    expect(screen.getByRole("textbox")).toHaveClass("textarea-primary");
  });

  it("applies size class", () => {
    render(<Textarea size="lg" />);
    expect(screen.getByRole("textbox")).toHaveClass("textarea-lg");
  });

  it("renders a label when label prop is provided", () => {
    render(<Textarea label="Your message" />);
    expect(screen.getByText("Your message")).toBeInTheDocument();
  });

  it("associates label with textarea via htmlFor", () => {
    render(<Textarea label="Your message" id="msg" />);
    const label = screen.getByText("Your message").closest("label");
    expect(label?.getAttribute("for")).toBe("msg");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("passes placeholder prop to textarea", () => {
    render(<Textarea placeholder="Enter message" />);
    expect(screen.getByPlaceholderText("Enter message")).toBeInTheDocument();
  });

  it("renders an error message when error prop is provided", () => {
    render(<Textarea error="Too long" />);
    expect(screen.getByText("Too long")).toBeInTheDocument();
  });

  it("applies textarea-error class when error prop is provided", () => {
    render(<Textarea error="Too long" />);
    expect(screen.getByRole("textbox")).toHaveClass("textarea-error");
  });

  it("calls onChange when text changes", () => {
    const onChange = vi.fn(() => undefined);
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "hello" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
