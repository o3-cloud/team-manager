
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Kbd } from "./Kbd";

afterEach(cleanup);

describe("Kbd", () => {
  it("exports Kbd component", () => {
    expect(Kbd).toBeDefined();
    expect(typeof Kbd).toBe("function");
  });

  it("renders children text", () => {
    render(<Kbd>A</Kbd>);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("applies kbd class", () => {
    render(<Kbd>Enter</Kbd>);
    expect(screen.getByText("Enter")).toHaveClass("kbd");
  });

  it("renders as kbd element", () => {
    const { container } = render(<Kbd>Ctrl</Kbd>);
    expect(container.querySelector("kbd")).toBeInTheDocument();
  });

  it("applies size class when provided", () => {
    render(<Kbd size="md">Tab</Kbd>);
    expect(screen.getByText("Tab")).toHaveClass("kbd-md");
  });

  it("applies kbd-lg class for lg size", () => {
    render(<Kbd size="lg">Enter</Kbd>);
    expect(screen.getByText("Enter")).toHaveClass("kbd-lg");
  });

  it("applies kbd-sm class for sm size", () => {
    render(<Kbd size="sm">Esc</Kbd>);
    expect(screen.getByText("Esc")).toHaveClass("kbd-sm");
  });

  it("does not apply size class when size is not provided", () => {
    render(<Kbd>Space</Kbd>);
    const el = screen.getByText("Space");
    expect(el.className).toBe("kbd");
  });
});
