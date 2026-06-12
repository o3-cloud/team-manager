
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Hover3D } from "./Hover3D";

afterEach(cleanup);

describe("Hover3D", () => {
  it("exports Hover3D component and is a function", () => {
    expect(Hover3D).toBeDefined();
    expect(typeof Hover3D).toBe("function");
  });

  it("renders children content", () => {
    render(
      <Hover3D>
        <figure>My 3D content</figure>
      </Hover3D>
    );
    expect(screen.getByText("My 3D content")).toBeInTheDocument();
  });

  it("applies hover-3d class to the root element", () => {
    const { container } = render(
      <Hover3D>
        <span>content</span>
      </Hover3D>
    );
    expect(container.firstChild).toHaveClass("hover-3d");
  });

  it("renders exactly 8 empty hover zone divs after the main content", () => {
    const { container } = render(
      <Hover3D>
        <figure>Content</figure>
      </Hover3D>
    );
    const root = container.firstChild;
    if (!(root instanceof HTMLElement)) throw new Error("Expected HTMLElement");
    const allChildren = Array.from(root.children);
    // First child is the figure (content), remaining should be 8 empty divs
    const hoverZones = allChildren.slice(1);
    expect(hoverZones).toHaveLength(8);
    for (const zone of hoverZones) {
      expect(zone.tagName).toBe("DIV");
      expect(zone.children).toHaveLength(0);
    }
  });

  it("renders as div by default", () => {
    const { container } = render(
      <Hover3D>
        <span>content</span>
      </Hover3D>
    );
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders as anchor when href prop is provided", () => {
    const { container } = render(
      <Hover3D href="https://example.com">
        <span>content</span>
      </Hover3D>
    );
    expect(container.firstChild?.nodeName).toBe("A");
    expect(container.firstChild).toHaveAttribute("href", "https://example.com");
  });

  it("applies custom className when provided", () => {
    const { container } = render(
      <Hover3D className="my-12 mx-2">
        <span>content</span>
      </Hover3D>
    );
    expect(container.firstChild).toHaveClass("hover-3d");
    expect(container.firstChild).toHaveClass("my-12");
    expect(container.firstChild).toHaveClass("mx-2");
  });
});
