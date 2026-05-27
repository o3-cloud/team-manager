
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

afterEach(cleanup);

describe("Tooltip", () => {
  it("exports Tooltip component", () => {
    expect(Tooltip).toBeDefined();
    expect(typeof Tooltip).toBe("function");
  });

  it("renders a div with tooltip class", () => {
    const { container } = render(
      <Tooltip tip="Hello">
        <button type="button">Hover</button>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toBeInTheDocument();
  });

  it("sets data-tip attribute with the tooltip text", () => {
    const { container } = render(
      <Tooltip tip="Tooltip content">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveAttribute("data-tip", "Tooltip content");
  });

  it("renders children inside the tooltip wrapper", () => {
    const { getByText } = render(
      <Tooltip tip="Hint">
        <button type="button">Click me</button>
      </Tooltip>
    );
    expect(getByText("Click me")).toBeInTheDocument();
  });

  it("applies tooltip-bottom position class", () => {
    const { container } = render(
      <Tooltip tip="Below" position="bottom">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveClass("tooltip-bottom");
  });

  it("applies tooltip-left position class", () => {
    const { container } = render(
      <Tooltip tip="Left" position="left">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveClass("tooltip-left");
  });

  it("applies tooltip-right position class", () => {
    const { container } = render(
      <Tooltip tip="Right" position="right">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveClass("tooltip-right");
  });

  it("applies color class when provided", () => {
    const { container } = render(
      <Tooltip tip="Error!" color="error">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveClass("tooltip-error");
  });

  it("applies tooltip-open class when open is true", () => {
    const { container } = render(
      <Tooltip tip="Always visible" open>
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).toHaveClass("tooltip-open");
  });

  it("does not apply tooltip-open class by default", () => {
    const { container } = render(
      <Tooltip tip="Hidden">
        <span>target</span>
      </Tooltip>
    );
    expect(container.querySelector(".tooltip")).not.toHaveClass("tooltip-open");
  });
});
