
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

afterEach(cleanup);

describe("Skeleton", () => {
  it("exports Skeleton component", () => {
    expect(Skeleton).toBeDefined();
    expect(typeof Skeleton).toBe("function");
  });

  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("has skeleton base class", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector("div")).toHaveClass("skeleton");
  });

  it("applies width via style when provided", () => {
    const { container } = render(<Skeleton width="200px" />);
    expect(container.querySelector("div")).toHaveStyle({ width: "200px" });
  });

  it("applies height via style when provided", () => {
    const { container } = render(<Skeleton height="50px" />);
    expect(container.querySelector("div")).toHaveStyle({ height: "50px" });
  });

  it("merges additional className", () => {
    const { container } = render(<Skeleton className="rounded-full" />);
    expect(container.querySelector("div")).toHaveClass("skeleton", "rounded-full");
  });
});
