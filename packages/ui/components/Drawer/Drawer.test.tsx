
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Drawer } from "./Drawer";

afterEach(cleanup);

describe("Drawer", () => {
  it("exports Drawer component", () => {
    expect(Drawer).toBeDefined();
    expect(typeof Drawer).toBe("function");
  });

  it("renders main content", () => {
    render(
      <Drawer side={<nav>Sidebar</nav>}>
        <main>Main content</main>
      </Drawer>
    );
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders side content", () => {
    render(
      <Drawer side={<nav>Sidebar</nav>}>
        <main>Main</main>
      </Drawer>
    );
    expect(screen.getByText("Sidebar")).toBeInTheDocument();
  });

  it("applies drawer class to wrapper", () => {
    render(
      <Drawer side={<nav>Side</nav>} data-testid="drawer">
        <div>Content</div>
      </Drawer>
    );
    expect(screen.getByTestId("drawer")).toHaveClass("drawer");
  });

  it("is closed by default", () => {
    render(
      <Drawer side={<nav>Side</nav>}>
        <div>Content</div>
      </Drawer>
    );
    const toggle = document.querySelector<HTMLInputElement>(".drawer-toggle");
    expect(toggle?.checked).toBe(false);
  });

  it("is open when open prop is true", () => {
    render(
      <Drawer open side={<nav>Side</nav>}>
        <div>Content</div>
      </Drawer>
    );
    const toggle = document.querySelector<HTMLInputElement>(".drawer-toggle");
    expect(toggle?.checked).toBe(true);
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn(() => undefined);
    render(
      <Drawer open onClose={onClose} side={<nav>Side</nav>}>
        <div>Content</div>
      </Drawer>
    );
    const overlay = document.querySelector<HTMLElement>(".drawer-overlay");
    if (!overlay) throw new Error("Expected .drawer-overlay element");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies drawer-end class when end is true", () => {
    render(
      <Drawer end side={<nav>Side</nav>} data-testid="drawer">
        <div>Content</div>
      </Drawer>
    );
    expect(screen.getByTestId("drawer")).toHaveClass("drawer-end");
  });

  it("passes additional className", () => {
    render(
      <Drawer side={<nav>Side</nav>} className="h-screen" data-testid="drawer">
        <div>Content</div>
      </Drawer>
    );
    expect(screen.getByTestId("drawer")).toHaveClass("h-screen");
  });
});
