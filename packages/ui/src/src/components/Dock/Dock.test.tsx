
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Dock } from "./Dock";

afterEach(cleanup);

const items = [
  { icon: <span>🏠</span>, label: "Home" },
  { icon: <span>🔍</span>, label: "Search" },
  { icon: <span>👤</span>, label: "Profile", active: true },
];

describe("Dock", () => {
  it("exports Dock component", () => {
    expect(Dock).toBeDefined();
    expect(typeof Dock).toBe("function");
  });

  it("renders a nav element with dock class", () => {
    const { container } = render(<Dock items={items} />);
    expect(container.querySelector("nav.dock")).toBeInTheDocument();
  });

  it("renders a button for each item", () => {
    const { container } = render(<Dock items={items} />);
    expect(container.querySelectorAll("button")).toHaveLength(3);
  });

  it("renders labels when provided", () => {
    const { getByText } = render(<Dock items={items} />);
    expect(getByText("Home")).toBeInTheDocument();
    expect(getByText("Search")).toBeInTheDocument();
    expect(getByText("Profile")).toBeInTheDocument();
  });

  it("labels have dock-label class", () => {
    const { container } = render(<Dock items={items} />);
    expect(container.querySelectorAll(".dock-label")).toHaveLength(3);
  });

  it("applies dock-active class to the active item", () => {
    const { container } = render(<Dock items={items} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons[2]).toHaveClass("dock-active");
  });

  it("does not apply dock-active to inactive items", () => {
    const { container } = render(<Dock items={items} />);
    const buttons = container.querySelectorAll("button");
    expect(buttons[0]).not.toHaveClass("dock-active");
    expect(buttons[1]).not.toHaveClass("dock-active");
  });

  it("applies size class when size is provided", () => {
    const { container } = render(<Dock items={items} size="lg" />);
    expect(container.querySelector("nav")).toHaveClass("dock-lg");
  });
});
