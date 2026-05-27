
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Stat } from "./Stat";

afterEach(cleanup);

describe("Stat", () => {
  const singleItem = [
    {
      title: "Total Users",
      value: "1,200",
      description: "10% more than last month",
    },
  ];

  const multipleItems = [
    { title: "Downloads", value: "31K" },
    { title: "Users", value: "4,200" },
    { title: "New Registers", value: "1,200" },
  ];

  it("exports Stat component", () => {
    expect(Stat).toBeDefined();
    expect(typeof Stat).toBe("function");
  });

  it("renders stat title", () => {
    render(<Stat items={singleItem} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
  });

  it("renders stat value", () => {
    render(<Stat items={singleItem} />);
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("renders stat description when provided", () => {
    render(<Stat items={singleItem} />);
    expect(screen.getByText("10% more than last month")).toBeInTheDocument();
  });

  it("renders figure when provided", () => {
    const items = [{ title: "Visits", value: "89K", figure: <span>icon</span> }];
    render(<Stat items={items} />);
    expect(screen.getByText("icon")).toBeInTheDocument();
  });

  it("applies stats class to container", () => {
    const { container } = render(<Stat items={singleItem} />);
    expect(container.firstChild).toHaveClass("stats");
  });

  it("renders multiple stat items", () => {
    render(<Stat items={multipleItems} />);
    expect(screen.getByText("Downloads")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("New Registers")).toBeInTheDocument();
  });

  it("applies stats-horizontal class when horizontal prop is true", () => {
    const { container } = render(<Stat items={singleItem} horizontal />);
    expect(container.firstChild).toHaveClass("stats-horizontal");
  });

  it("does not render description when not provided", () => {
    render(<Stat items={[{ title: "Count", value: 42 }]} />);
    expect(document.querySelector(".stat-desc")).not.toBeInTheDocument();
  });
});
