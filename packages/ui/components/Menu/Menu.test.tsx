
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Menu } from "./Menu";

afterEach(cleanup);

describe("Menu", () => {
  it("exports Menu component", () => {
    expect(Menu).toBeDefined();
    expect(typeof Menu).toBe("function");
  });

  it("renders a list element", () => {
    render(<Menu items={[]} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("renders menu items", () => {
    const items = [{ label: "Home" }, { label: "About" }, { label: "Contact" }];
    render(<Menu items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("applies menu class", () => {
    render(<Menu items={[]} />);
    expect(screen.getByRole("list")).toHaveClass("menu");
  });

  it("applies size class", () => {
    render(<Menu items={[]} size="lg" />);
    expect(screen.getByRole("list")).toHaveClass("menu-lg");
  });

  it("applies horizontal direction class", () => {
    render(<Menu items={[]} direction="horizontal" />);
    expect(screen.getByRole("list")).toHaveClass("menu-horizontal");
  });

  it("calls onClick when item is clicked", () => {
    const onClick = vi.fn(() => undefined);
    render(<Menu items={[{ label: "Click me", onClick }]} />);
    fireEvent.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks active item with active class", () => {
    render(<Menu items={[{ label: "Active Item", active: true }]} />);
    expect(screen.getByText("Active Item").closest("a")).toHaveClass("active");
  });

  it("renders disabled item with disabled class", () => {
    render(<Menu items={[{ label: "Disabled Item", disabled: true }]} />);
    expect(screen.getByText("Disabled Item").closest("li")).toHaveClass("disabled");
  });
});
