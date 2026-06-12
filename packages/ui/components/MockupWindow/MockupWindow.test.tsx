
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MockupWindow } from "./MockupWindow";

afterEach(cleanup);

describe("MockupWindow", () => {
  it("exports MockupWindow and is a function", () => {
    expect(MockupWindow).toBeDefined();
    expect(typeof MockupWindow).toBe("function");
  });

  it("renders children content", () => {
    render(
      <MockupWindow>
        <span>Hello window</span>
      </MockupWindow>
    );
    expect(screen.getByText("Hello window")).toBeInTheDocument();
  });

  it("applies mockup-window class to root element", () => {
    const { container } = render(
      <MockupWindow>
        <span>content</span>
      </MockupWindow>
    );
    expect(container.firstChild).toHaveClass("mockup-window");
  });

  it("wraps children in an inner div", () => {
    const { container } = render(
      <MockupWindow>
        <span>content</span>
      </MockupWindow>
    );
    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected HTMLElement");
    const innerDiv = root.firstChild;
    expect(innerDiv?.nodeName).toBe("DIV");
  });

  it("applies custom className alongside mockup-window", () => {
    const { container } = render(
      <MockupWindow className="border border-base-300">
        <span>content</span>
      </MockupWindow>
    );
    expect(container.firstChild).toHaveClass("mockup-window");
    expect(container.firstChild).toHaveClass("border");
    expect(container.firstChild).toHaveClass("border-base-300");
  });
});
