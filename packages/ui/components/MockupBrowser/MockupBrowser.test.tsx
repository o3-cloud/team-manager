
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MockupBrowser } from "./MockupBrowser";

afterEach(cleanup);

describe("MockupBrowser", () => {
  it("exports MockupBrowser and is a function", () => {
    expect(MockupBrowser).toBeDefined();
    expect(typeof MockupBrowser).toBe("function");
  });

  it("renders children content", () => {
    render(<MockupBrowser>Hello Browser</MockupBrowser>);
    expect(screen.getByText("Hello Browser")).toBeInTheDocument();
  });

  it("applies mockup-browser class to root element", () => {
    const { container } = render(
      <MockupBrowser>
        <span>content</span>
      </MockupBrowser>
    );
    expect(container.firstChild).toHaveClass("mockup-browser");
  });

  it("renders toolbar div with mockup-browser-toolbar class", () => {
    const { container } = render(
      <MockupBrowser>
        <span>content</span>
      </MockupBrowser>
    );
    const toolbar = container.querySelector(".mockup-browser-toolbar");
    expect(toolbar).not.toBeNull();
  });

  it("renders URL in toolbar when url prop provided as a div.input", () => {
    const { container } = render(
      <MockupBrowser url="https://daisyui.com">
        <span>content</span>
      </MockupBrowser>
    );
    const inputDiv = container.querySelector(".mockup-browser-toolbar .input");
    expect(inputDiv).not.toBeNull();
    expect(inputDiv?.textContent).toBe("https://daisyui.com");
  });

  it("does NOT render .input when url not provided", () => {
    const { container } = render(
      <MockupBrowser>
        <span>content</span>
      </MockupBrowser>
    );
    const inputDiv = container.querySelector(".mockup-browser-toolbar .input");
    expect(inputDiv).toBeNull();
  });

  it("applies custom className alongside mockup-browser", () => {
    const { container } = render(
      <MockupBrowser className="border border-base-300">
        <span>content</span>
      </MockupBrowser>
    );
    expect(container.firstChild).toHaveClass("mockup-browser");
    expect(container.firstChild).toHaveClass("border");
    expect(container.firstChild).toHaveClass("border-base-300");
  });
});
