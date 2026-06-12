
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

afterEach(cleanup);

describe("Dropdown", () => {
  it("exports Dropdown component", () => {
    expect(Dropdown).toBeDefined();
    expect(typeof Dropdown).toBe("function");
  });

  it("renders the trigger element", () => {
    render(
      <Dropdown trigger={<button type="button">Open</button>}>
        <p>Content</p>
      </Dropdown>
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("renders the dropdown content", () => {
    render(
      <Dropdown trigger={<button type="button">Open</button>}>
        <p>Dropdown content</p>
      </Dropdown>
    );
    expect(screen.getByText("Dropdown content")).toBeInTheDocument();
  });

  it("applies dropdown class to wrapper", () => {
    const { container } = render(
      <Dropdown trigger={<button type="button">Open</button>}>
        <p>Content</p>
      </Dropdown>
    );
    expect(container.firstChild).toHaveClass("dropdown");
  });

  it("applies dropdown-end class when align is end", () => {
    const { container } = render(
      <Dropdown trigger={<button type="button">Open</button>} align="end">
        <p>Content</p>
      </Dropdown>
    );
    expect(container.firstChild).toHaveClass("dropdown-end");
  });

  it("applies dropdown-top class when position is top", () => {
    const { container } = render(
      <Dropdown trigger={<button type="button">Open</button>} position="top">
        <p>Content</p>
      </Dropdown>
    );
    expect(container.firstChild).toHaveClass("dropdown-top");
  });

  it("applies dropdown-hover class when hover is true", () => {
    const { container } = render(
      <Dropdown trigger={<button type="button">Open</button>} hover>
        <p>Content</p>
      </Dropdown>
    );
    expect(container.firstChild).toHaveClass("dropdown-hover");
  });

  it("wraps content in dropdown-content div", () => {
    render(
      <Dropdown trigger={<button type="button">Open</button>}>
        <p>Content</p>
      </Dropdown>
    );
    const content = screen.getByText("Content").closest("[class*='dropdown-content']");
    expect(content).toBeInTheDocument();
  });
});
