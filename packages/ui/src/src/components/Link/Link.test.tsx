
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link } from "./Link";

afterEach(cleanup);

describe("Link", () => {
  it("exports Link component", () => {
    expect(Link).toBeDefined();
    expect(typeof Link).toBe("function");
  });

  it("renders children text", () => {
    render(<Link>Click here</Link>);
    expect(screen.getByText("Click here")).toBeInTheDocument();
  });

  it("applies link class", () => {
    render(<Link>Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link");
  });

  it("applies primary variant class by default", () => {
    render(<Link>Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link-primary");
  });

  it("applies secondary variant class", () => {
    render(<Link variant="secondary">Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link-secondary");
  });

  it("applies accent variant class", () => {
    render(<Link variant="accent">Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link-accent");
  });

  it("applies neutral variant class", () => {
    render(<Link variant="neutral">Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link-neutral");
  });

  it("applies hover-only class when hover prop is true", () => {
    render(<Link hover>Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("link-hover");
  });

  it("renders with href", () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/about");
  });

  it("renders with default href of #", () => {
    render(<Link>Text</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn(() => undefined);
    render(<Link onClick={onClick}>Click</Link>);
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Link className="extra">Text</Link>);
    expect(screen.getByRole("link")).toHaveClass("extra");
  });
});
