
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Progress } from "./Progress";

afterEach(cleanup);

describe("Progress", () => {
  it("exports Progress component", () => {
    expect(Progress).toBeDefined();
    expect(typeof Progress).toBe("function");
  });

  it("renders a progress element", () => {
    const { container } = render(<Progress />);
    expect(container.querySelector("progress")).toBeInTheDocument();
  });

  it("has progress base class", () => {
    const { container } = render(<Progress />);
    expect(container.querySelector("progress")).toHaveClass("progress");
  });

  it("applies primary variant class by default", () => {
    const { container } = render(<Progress />);
    expect(container.querySelector("progress")).toHaveClass("progress-primary");
  });

  it("applies success variant class", () => {
    const { container } = render(<Progress variant="success" />);
    expect(container.querySelector("progress")).toHaveClass("progress-success");
  });

  it("applies error variant class", () => {
    const { container } = render(<Progress variant="error" />);
    expect(container.querySelector("progress")).toHaveClass("progress-error");
  });

  it("sets value attribute", () => {
    const { container } = render(<Progress value={40} max={100} />);
    expect(container.querySelector("progress")).toHaveAttribute("value", "40");
  });

  it("sets max attribute", () => {
    const { container } = render(<Progress value={40} max={200} />);
    expect(container.querySelector("progress")).toHaveAttribute("max", "200");
  });

  it("renders indeterminate (no value) when value is not set", () => {
    const { container } = render(<Progress />);
    expect(container.querySelector("progress")).not.toHaveAttribute("value");
  });
});
