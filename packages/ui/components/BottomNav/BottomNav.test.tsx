
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BottomNav } from "./BottomNav";

afterEach(cleanup);

describe("BottomNav", () => {
  const items = [{ label: "Home", active: true }, { label: "Search" }, { label: "Profile" }];

  it("exports BottomNav component", () => {
    expect(BottomNav).toBeDefined();
    expect(typeof BottomNav).toBe("function");
  });

  it("applies btm-nav class", () => {
    const { container } = render(<BottomNav items={items} />);
    expect(container.firstChild).toHaveClass("btm-nav");
  });

  it("renders all item labels", () => {
    render(<BottomNav items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("applies active class to active item", () => {
    render(<BottomNav items={items} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveClass("active");
  });

  it("does not apply active class to inactive items", () => {
    render(<BottomNav items={items} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).not.toHaveClass("active");
  });

  it("calls onClick when item is clicked", () => {
    const onClick = vi.fn(() => undefined);
    render(<BottomNav items={[{ label: "Home", onClick }]} />);
    fireEvent.click(screen.getByRole("button", { name: /Home/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies size class", () => {
    const { container } = render(<BottomNav items={items} size="lg" />);
    expect(container.firstChild).toHaveClass("btm-nav-lg");
  });

  it("applies xs size class", () => {
    const { container } = render(<BottomNav items={items} size="xs" />);
    expect(container.firstChild).toHaveClass("btm-nav-xs");
  });

  it("applies custom className", () => {
    const { container } = render(<BottomNav items={items} className="extra" />);
    expect(container.firstChild).toHaveClass("extra");
  });

  it("renders icon when provided", () => {
    render(<BottomNav items={[{ label: "Home", icon: <svg data-testid="home-icon" /> }]} />);
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });
});
