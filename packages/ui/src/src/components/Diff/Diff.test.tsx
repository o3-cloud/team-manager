
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Diff } from "./Diff";

afterEach(cleanup);

describe("Diff", () => {
  it("exports Diff component", () => {
    expect(Diff).toBeDefined();
    expect(typeof Diff).toBe("function");
  });

  it("applies diff class to container", () => {
    const { container } = render(<Diff itemOne={<p>Original</p>} itemTwo={<p>Modified</p>} />);
    expect(container.firstChild).toHaveClass("diff");
  });

  it("renders diff-item-1 content", () => {
    const { container } = render(<Diff itemOne={<p>Original</p>} itemTwo={<p>Modified</p>} />);
    const item1 = container.querySelector(".diff-item-1");
    expect(item1).toBeInTheDocument();
    expect(item1).toHaveTextContent("Original");
  });

  it("renders diff-item-2 content", () => {
    const { container } = render(<Diff itemOne={<p>Original</p>} itemTwo={<p>Modified</p>} />);
    const item2 = container.querySelector(".diff-item-2");
    expect(item2).toBeInTheDocument();
    expect(item2).toHaveTextContent("Modified");
  });

  it("renders diff-resizer", () => {
    const { container } = render(<Diff itemOne={<p>A</p>} itemTwo={<p>B</p>} />);
    expect(container.querySelector(".diff-resizer")).toBeInTheDocument();
  });

  it("renders both items", () => {
    render(<Diff itemOne={<span>First</span>} itemTwo={<span>Second</span>} />);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});
