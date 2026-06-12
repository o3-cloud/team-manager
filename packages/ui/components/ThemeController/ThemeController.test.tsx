
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ThemeController } from "./ThemeController";

afterEach(cleanup);

describe("ThemeController", () => {
  it("exports ThemeController component", () => {
    expect(ThemeController).toBeDefined();
    expect(typeof ThemeController).toBe("function");
  });

  it("renders an input element", () => {
    const { container } = render(<ThemeController theme="dark" />);
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("has theme-controller class", () => {
    const { container } = render(<ThemeController theme="dark" />);
    expect(container.querySelector("input")).toHaveClass("theme-controller");
  });

  it("sets value to the theme prop", () => {
    const { container } = render(<ThemeController theme="cyberpunk" />);
    expect(container.querySelector("input")).toHaveAttribute("value", "cyberpunk");
  });

  it("defaults to checkbox type", () => {
    const { container } = render(<ThemeController theme="dark" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "checkbox");
  });

  it("supports radio type", () => {
    const { container } = render(<ThemeController theme="dark" type="radio" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "radio");
  });

  it("supports defaultChecked prop", () => {
    const { container } = render(<ThemeController theme="dark" defaultChecked />);
    expect(container.querySelector("input")).toBeChecked();
  });

  it("passes aria-label to the input", () => {
    const { container } = render(
      <ThemeController theme="dark" aria-label="Switch to dark theme" />
    );
    expect(container.querySelector("input")).toHaveAttribute("aria-label", "Switch to dark theme");
  });

  it("applies additional className", () => {
    const { container } = render(<ThemeController theme="dark" className="toggle" />);
    const input = container.querySelector("input");
    expect(input).toHaveClass("theme-controller");
    expect(input).toHaveClass("toggle");
  });
});
