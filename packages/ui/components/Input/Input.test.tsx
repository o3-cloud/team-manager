
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./Input";

afterEach(cleanup);

describe("Input", () => {
  it("exports Input component", () => {
    expect(Input).toBeDefined();
    expect(typeof Input).toBe("function");
  });

  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("applies base input classes by default", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("input");
    expect(input).toHaveClass("input-bordered");
  });

  it("applies primary variant class when specified", () => {
    render(<Input variant="primary" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-primary");
  });

  it("applies secondary variant class when specified", () => {
    render(<Input variant="secondary" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-secondary");
  });

  it("applies accent variant class", () => {
    render(<Input variant="accent" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-accent");
  });

  it("applies info variant class", () => {
    render(<Input variant="info" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-info");
  });

  it("applies success variant class", () => {
    render(<Input variant="success" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-success");
  });

  it("applies warning variant class", () => {
    render(<Input variant="warning" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-warning");
  });

  it("applies size class", () => {
    render(<Input size="lg" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-lg");
  });

  it("applies xs size class", () => {
    render(<Input size="xs" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-xs");
  });

  it("applies sm size class", () => {
    render(<Input size="sm" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-sm");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("sets aria-disabled when disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not set aria-disabled when enabled", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-disabled");
  });

  it("renders a label when label prop is provided", () => {
    render(<Input label="Email address" />);
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("does not render a label when label prop is not provided", () => {
    render(<Input />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Input label="Email address" id="email" />);
    const label = screen.getByText("Email address").closest("label");
    expect(label?.getAttribute("for")).toBe("email");
  });

  it("renders an error message when error prop is provided", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies input-error class when error prop is provided", () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByRole("textbox")).toHaveClass("input-error");
  });

  it("error class takes precedence over variant class", () => {
    render(<Input error="Invalid" variant="primary" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("input-error");
    expect(input).not.toHaveClass("input-primary");
  });

  it("passes placeholder prop to input", () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("displays controlled value", () => {
    render(
      <Input
        value="hello"
        onChange={() => {
          /* no-op */
        }}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("calls onChange when input value changes", () => {
    const onChange = vi.fn(() => undefined);
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "new value" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("submits value through form on submit button click", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Input name="email" defaultValue="test@example.com" />
        <button type="submit">Submit</button>
      </form>
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not throw when no onChange is provided with a value", () => {
    // readOnly input with value and no onChange should not crash
    expect(() => {
      render(<Input value="static" readOnly />);
    }).not.toThrow();
  });

  it("auto-generates an id when none is provided", () => {
    render(<Input label="Name" />);
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("id")).toBeTruthy();
  });

  it("associates auto-generated id with label", () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText("Name");
    expect(input).toBeInTheDocument();
  });

  it("sets aria-invalid when error prop is provided", () => {
    render(<Input error="Required" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid when no error", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-describedby pointing to error element", () => {
    render(<Input error="Required field" />);
    const input = screen.getByRole("textbox");
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    if (!errorId) throw new Error("Expected aria-describedby attribute");
    const errorEl = document.getElementById(errorId);
    expect(errorEl).toHaveTextContent("Required field");
  });

  it("error element id matches input aria-describedby", () => {
    render(<Input id="email" error="Invalid email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
    expect(document.getElementById("email-error")).toBeInTheDocument();
  });

  it("applies aria-label when no visible label is provided", () => {
    render(<Input aria-label="Search" placeholder="Search…" />);
    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input).toBeInTheDocument();
  });

  it("does not apply aria-label when a visible label is present", () => {
    render(<Input label="Email" aria-label="Email address" />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-label");
  });
});
