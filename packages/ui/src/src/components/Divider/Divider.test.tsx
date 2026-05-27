
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Divider } from "./Divider";

afterEach(cleanup);

describe("Divider", () => {
  it("exports Divider component", () => {
    expect(Divider).toBeDefined();
    expect(typeof Divider).toBe("function");
  });

  it("renders divider element", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies divider class", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveClass("divider");
  });

  it("renders children text when provided", () => {
    render(<Divider>OR</Divider>);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("applies divider-horizontal class when orientation is vertical", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.firstChild).toHaveClass("divider-horizontal");
  });

  it("does not apply orientation class when horizontal (default)", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).not.toHaveClass("divider-horizontal");
  });

  it("applies color class when color prop provided", () => {
    const { container } = render(<Divider color="primary" />);
    expect(container.firstChild).toHaveClass("divider-primary");
  });

  it("renders without children (horizontal line)", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toHaveClass("divider");
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
