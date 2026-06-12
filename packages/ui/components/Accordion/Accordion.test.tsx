
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Accordion } from "./Accordion";

afterEach(cleanup);

describe("Accordion", () => {
  const items = [
    { title: "Item 1", children: "Content 1" },
    { title: "Item 2", children: "Content 2" },
    { title: "Item 3", children: "Content 3" },
  ];

  it("exports Accordion component", () => {
    expect(Accordion).toBeDefined();
    expect(typeof Accordion).toBe("function");
  });

  it("renders accordion items", () => {
    const { container } = render(<Accordion items={items} />);
    const collapseItems = container.querySelectorAll(".collapse");
    expect(collapseItems.length).toBe(3);
  });

  it("renders item titles", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("renders item content", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
    expect(screen.getByText("Content 3")).toBeInTheDocument();
  });

  it("applies collapse-arrow class for arrow variant (default)", () => {
    const { container } = render(<Accordion items={items} />);
    const collapseItem = container.querySelector(".collapse");
    expect(collapseItem).toHaveClass("collapse-arrow");
  });

  it("applies collapse-plus class for plus variant", () => {
    const { container } = render(<Accordion items={items} variant="plus" />);
    const collapseItem = container.querySelector(".collapse");
    expect(collapseItem).toHaveClass("collapse-plus");
  });

  it("does not apply variant class when variant is none", () => {
    const { container } = render(<Accordion items={items} variant="none" />);
    const collapseItem = container.querySelector(".collapse");
    expect(collapseItem).not.toHaveClass("collapse-arrow");
    expect(collapseItem).not.toHaveClass("collapse-plus");
  });

  it("renders multiple items", () => {
    const manyItems = [
      { title: "A", children: "Content A" },
      { title: "B", children: "Content B" },
      { title: "C", children: "Content C" },
      { title: "D", children: "Content D" },
    ];
    const { container } = render(<Accordion items={manyItems} />);
    const collapseItems = container.querySelectorAll(".collapse");
    expect(collapseItems.length).toBe(4);
  });
});
