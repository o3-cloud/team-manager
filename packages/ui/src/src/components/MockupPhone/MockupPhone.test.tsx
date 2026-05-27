
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MockupPhone } from "./MockupPhone";

afterEach(cleanup);

describe("MockupPhone", () => {
  it("exports MockupPhone and is a function", () => {
    expect(MockupPhone).toBeDefined();
    expect(typeof MockupPhone).toBe("function");
  });

  it("renders children content inside the display", () => {
    render(
      <MockupPhone>
        <span>My phone content</span>
      </MockupPhone>
    );
    expect(screen.getByText("My phone content")).toBeInTheDocument();
  });

  it("applies mockup-phone class to root element", () => {
    const { container } = render(
      <MockupPhone>
        <span>content</span>
      </MockupPhone>
    );
    expect(container.firstChild).toHaveClass("mockup-phone");
  });

  it("renders inner div with mockup-phone-camera class (empty)", () => {
    const { container } = render(
      <MockupPhone>
        <span>content</span>
      </MockupPhone>
    );
    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected HTMLElement");
    const camera = root.querySelector(".mockup-phone-camera");
    expect(camera).not.toBeNull();
    expect(camera?.children).toHaveLength(0);
  });

  it("renders inner div with mockup-phone-display class containing the children", () => {
    const { container } = render(
      <MockupPhone>
        <span>display content</span>
      </MockupPhone>
    );
    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected HTMLElement");
    const display = root.querySelector(".mockup-phone-display");
    expect(display).not.toBeNull();
    expect(display?.textContent).toBe("display content");
  });

  it("applies custom className alongside mockup-phone", () => {
    const { container } = render(
      <MockupPhone className="my-8 mx-4">
        <span>content</span>
      </MockupPhone>
    );
    expect(container.firstChild).toHaveClass("mockup-phone");
    expect(container.firstChild).toHaveClass("my-8");
    expect(container.firstChild).toHaveClass("mx-4");
  });
});
