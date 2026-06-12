
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Timeline } from "./Timeline";

afterEach(cleanup);

describe("Timeline", () => {
  const items = [
    { start: "2020", end: "Event One" },
    { start: "2021", end: "Event Two" },
    { start: "2022", end: "Event Three" },
  ];

  it("exports Timeline component", () => {
    expect(Timeline).toBeDefined();
    expect(typeof Timeline).toBe("function");
  });

  it("renders timeline items", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("Event One")).toBeInTheDocument();
    expect(screen.getByText("Event Two")).toBeInTheDocument();
    expect(screen.getByText("Event Three")).toBeInTheDocument();
  });

  it("renders start content when provided", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("2020")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
  });

  it("renders end content when provided", () => {
    render(<Timeline items={[{ end: "End Content" }]} />);
    expect(screen.getByText("End Content")).toBeInTheDocument();
  });

  it("renders middle content when provided", () => {
    render(<Timeline items={[{ middle: <span>mid</span> }]} />);
    expect(screen.getByText("mid")).toBeInTheDocument();
  });

  it("applies timeline class", () => {
    const { container } = render(<Timeline items={items} />);
    expect(container.firstChild).toHaveClass("timeline");
  });

  it("applies timeline-horizontal class when horizontal prop is true", () => {
    const { container } = render(<Timeline items={items} horizontal />);
    expect(container.firstChild).toHaveClass("timeline-horizontal");
  });

  it("renders correct number of items", () => {
    const { container } = render(<Timeline items={items} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(3);
  });

  it("applies timeline-snap-icon class when snap prop is true", () => {
    const { container } = render(<Timeline items={items} snap />);
    expect(container.firstChild).toHaveClass("timeline-snap-icon");
  });
});
