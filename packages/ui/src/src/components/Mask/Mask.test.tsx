
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Mask } from "./Mask";

afterEach(cleanup);

describe("Mask", () => {
  it("exports Mask component", () => {
    expect(Mask).toBeDefined();
    expect(typeof Mask).toBe("function");
  });

  it("renders an img element by default", () => {
    render(<Mask src="img.jpg" alt="test image" />);
    expect(screen.getByRole("img", { name: "test image" })).toBeInTheDocument();
  });

  it("applies mask class", () => {
    render(<Mask src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask");
  });

  it("applies squircle shape class", () => {
    render(<Mask shape="squircle" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-squircle");
  });

  it("applies hexagon shape class", () => {
    render(<Mask shape="hexagon" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-hexagon");
  });

  it("applies hexagon-2 shape class", () => {
    render(<Mask shape="hexagon-2" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-hexagon-2");
  });

  it("applies decal shape class", () => {
    render(<Mask shape="decal" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-decal");
  });

  it("applies circle shape class", () => {
    render(<Mask shape="circle" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-circle");
  });

  it("applies heart shape class", () => {
    render(<Mask shape="heart" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-heart");
  });

  it("applies half-1 shape class", () => {
    render(<Mask shape="half-1" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-half-1");
  });

  it("applies half-2 shape class", () => {
    render(<Mask shape="half-2" src="img.jpg" alt="test" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("mask-half-2");
  });

  it("passes additional className", () => {
    render(<Mask src="img.jpg" alt="test" className="w-24" data-testid="mask" />);
    expect(screen.getByTestId("mask")).toHaveClass("w-24");
  });
});
