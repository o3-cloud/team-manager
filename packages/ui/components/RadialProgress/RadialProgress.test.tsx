
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { RadialProgress } from "./RadialProgress";

afterEach(cleanup);

describe("RadialProgress", () => {
  it("exports RadialProgress component", () => {
    expect(RadialProgress).toBeDefined();
    expect(typeof RadialProgress).toBe("function");
  });

  it("renders a div element", () => {
    const { container } = render(<RadialProgress value={50} />);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("has radial-progress base class", () => {
    const { container } = render(<RadialProgress value={50} />);
    expect(container.querySelector("div")).toHaveClass("radial-progress");
  });

  it("sets --value CSS variable via style", () => {
    const { container } = render(<RadialProgress value={75} />);
    const el = container.querySelector<HTMLElement>("div");
    if (!el) throw new Error("Expected div element");
    expect(el.style.getPropertyValue("--value")).toBe("75");
  });

  it("has role=progressbar", () => {
    const { getByRole } = render(<RadialProgress value={40} />);
    expect(getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets aria-valuenow", () => {
    const { getByRole } = render(<RadialProgress value={60} />);
    expect(getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  });

  it("sets aria-valuemin to 0", () => {
    const { getByRole } = render(<RadialProgress value={60} />);
    expect(getByRole("progressbar")).toHaveAttribute("aria-valuemin", "0");
  });

  it("sets aria-valuemax to 100", () => {
    const { getByRole } = render(<RadialProgress value={60} />);
    expect(getByRole("progressbar")).toHaveAttribute("aria-valuemax", "100");
  });

  it("sets --size CSS variable when size prop is provided", () => {
    const { container } = render(<RadialProgress value={50} size="8rem" />);
    const el = container.querySelector<HTMLElement>("div");
    if (!el) throw new Error("Expected div element");
    expect(el.style.getPropertyValue("--size")).toBe("8rem");
  });

  it("sets --thickness CSS variable when thickness prop is provided", () => {
    const { container } = render(<RadialProgress value={50} thickness="0.5rem" />);
    const el = container.querySelector<HTMLElement>("div");
    if (!el) throw new Error("Expected div element");
    expect(el.style.getPropertyValue("--thickness")).toBe("0.5rem");
  });

  it("renders children as label", () => {
    const { getByText } = render(<RadialProgress value={80}>80%</RadialProgress>);
    expect(getByText("80%")).toBeInTheDocument();
  });

  it("passes aria-label to the element", () => {
    const { getByRole } = render(<RadialProgress value={30} aria-label="Loading progress" />);
    expect(getByRole("progressbar")).toHaveAttribute("aria-label", "Loading progress");
  });
});
