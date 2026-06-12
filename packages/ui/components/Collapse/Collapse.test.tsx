
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Collapse } from "./Collapse";

afterEach(cleanup);

describe("Collapse", () => {
  it("exports Collapse component", () => {
    expect(Collapse).toBeDefined();
    expect(typeof Collapse).toBe("function");
  });

  it("renders a details element", () => {
    const { container } = render(<Collapse title="Section">Content</Collapse>);
    expect(container.querySelector("details")).toBeInTheDocument();
  });

  it("has collapse base class", () => {
    const { container } = render(<Collapse title="Section">Content</Collapse>);
    expect(container.querySelector("details")).toHaveClass("collapse");
  });

  it("renders title in a summary with collapse-title class", () => {
    const { container } = render(<Collapse title="My Title">Content</Collapse>);
    const summary = container.querySelector("summary");
    expect(summary).toBeInTheDocument();
    expect(summary).toHaveClass("collapse-title");
    expect(summary).toHaveTextContent("My Title");
  });

  it("renders children inside collapse-content", () => {
    const { container, getByText } = render(<Collapse title="Title">Hidden content</Collapse>);
    expect(container.querySelector(".collapse-content")).toBeInTheDocument();
    expect(getByText("Hidden content")).toBeInTheDocument();
  });

  it("applies collapse-arrow variant class by default", () => {
    const { container } = render(<Collapse title="Title">Content</Collapse>);
    expect(container.querySelector("details")).toHaveClass("collapse-arrow");
  });

  it("applies collapse-plus variant class", () => {
    const { container } = render(
      <Collapse title="Title" variant="plus">
        Content
      </Collapse>
    );
    expect(container.querySelector("details")).toHaveClass("collapse-plus");
  });

  it("does not apply variant class when variant is none", () => {
    const { container } = render(
      <Collapse title="Title" variant="none">
        Content
      </Collapse>
    );
    expect(container.querySelector("details")).not.toHaveClass("collapse-arrow");
    expect(container.querySelector("details")).not.toHaveClass("collapse-plus");
  });

  it("is closed by default", () => {
    const { container } = render(<Collapse title="Title">Content</Collapse>);
    expect(container.querySelector("details")).not.toHaveAttribute("open");
  });

  it("is open when defaultOpen is true", () => {
    const { container } = render(
      <Collapse title="Title" defaultOpen>
        Content
      </Collapse>
    );
    expect(container.querySelector("details")).toHaveAttribute("open");
  });
});
