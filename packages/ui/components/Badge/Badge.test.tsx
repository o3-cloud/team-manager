
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

afterEach(cleanup);

describe("Badge", () => {
  it("exports Badge component", () => {
    expect(Badge).toBeDefined();
    expect(typeof Badge).toBe("function");
  });

  it("renders children text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies primary variant class by default", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("badge-primary");
  });

  it("applies secondary variant class", () => {
    render(<Badge variant="secondary">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("badge-secondary");
  });

  it("applies ghost variant class", () => {
    render(<Badge variant="ghost">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("badge-ghost");
  });

  it("applies success variant class", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveClass("badge-success");
  });

  it("applies error variant class", () => {
    render(<Badge variant="error">Err</Badge>);
    expect(screen.getByText("Err")).toHaveClass("badge-error");
  });

  it("applies size class", () => {
    render(<Badge size="lg">Big</Badge>);
    expect(screen.getByText("Big")).toHaveClass("badge-lg");
  });

  it("applies sm size class", () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText("Small")).toHaveClass("badge-sm");
  });

  it("applies outline class when outline prop is true", () => {
    render(<Badge outline>Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("badge-outline");
  });
});
