
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MockupFrame } from "./MockupFrame";

afterEach(cleanup);

describe("MockupFrame", () => {
  it("exports MockupFrame and is a function", () => {
    expect(MockupFrame).toBeDefined();
    expect(typeof MockupFrame).toBe("function");
  });

  it("renders children content", () => {
    render(
      <MockupFrame>
        <p>Phone content</p>
      </MockupFrame>
    );
    expect(screen.getByText("Phone content")).toBeInTheDocument();
  });

  it("applies mockup-phone class to root element", () => {
    const { container } = render(
      <MockupFrame>
        <span>content</span>
      </MockupFrame>
    );
    expect(container.firstChild).toHaveClass("mockup-phone");
  });

  it("renders inner div with mockup-phone-display class", () => {
    const { container } = render(
      <MockupFrame>
        <span>content</span>
      </MockupFrame>
    );
    const display = container.querySelector(".mockup-phone-display");
    expect(display).not.toBeNull();
  });

  it("does NOT render a mockup-phone-camera div", () => {
    const { container } = render(
      <MockupFrame>
        <span>content</span>
      </MockupFrame>
    );
    const camera = container.querySelector(".mockup-phone-camera");
    expect(camera).toBeNull();
  });

  it("applies custom className alongside mockup-phone", () => {
    const { container } = render(
      <MockupFrame className="my-8 border-2">
        <span>content</span>
      </MockupFrame>
    );
    expect(container.firstChild).toHaveClass("mockup-phone");
    expect(container.firstChild).toHaveClass("my-8");
    expect(container.firstChild).toHaveClass("border-2");
  });
});
