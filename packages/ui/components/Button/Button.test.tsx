
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("exports Button component", () => {
    expect(Button).toBeDefined();
    expect(typeof Button).toBe("function");
  });

  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies primary variant class by default", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn-primary");
  });

  it("applies secondary variant class when specified", () => {
    render(<Button variant="secondary">Cancel</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn-secondary");
  });

  it("applies accent variant class", () => {
    render(<Button variant="accent">Accent</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-accent");
  });

  it("applies ghost variant class", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-ghost");
  });

  it("applies link variant class", () => {
    render(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-link");
  });

  it("applies size class", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("btn-lg");
  });

  it("applies xs size class", () => {
    render(<Button size="xs">XSmall</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-xs");
  });

  it("applies sm size class", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-sm");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("sets aria-disabled when disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-disabled", "true");
  });

  it("does not set aria-disabled when enabled", () => {
    render(<Button>Enabled</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-disabled");
  });

  it("calls onClick handler when clicked", () => {
    const onClick = vi.fn(() => undefined);
    render(<Button onClick={onClick}>Submit</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn(() => undefined);
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick on Enter key", () => {
    const onClick = vi.fn(() => undefined);
    render(<Button onClick={onClick}>Submit</Button>);
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter", code: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("fires onClick on Space key", () => {
    const onClick = vi.fn(() => undefined);
    render(<Button onClick={onClick}>Submit</Button>);
    fireEvent.keyDown(screen.getByRole("button"), { key: " ", code: "Space" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick on Enter when disabled", () => {
    const onClick = vi.fn(() => undefined);
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>
    );
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter", code: "Enter" });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as type button by default", () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders as type submit when specified", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("renders as type reset when specified", () => {
    render(<Button type="reset">Reset</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "reset");
  });

  it("submits form when type is submit", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => {
      e.preventDefault();
    });
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Submit</Button>
      </form>
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not throw when no onClick is provided", () => {
    expect(() => {
      render(<Button>No handler</Button>);
      fireEvent.click(screen.getByRole("button"));
    }).not.toThrow();
  });
});
