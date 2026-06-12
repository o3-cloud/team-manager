
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Tabs } from "./Tabs";

afterEach(cleanup);

describe("Tabs", () => {
  const tabs = [{ label: "Tab 1", active: true }, { label: "Tab 2" }, { label: "Tab 3" }];

  it("exports Tabs component", () => {
    expect(Tabs).toBeDefined();
    expect(typeof Tabs).toBe("function");
  });

  it("applies tabs class to wrapper", () => {
    const { container } = render(<Tabs tabs={tabs} />);
    expect(container.firstChild).toHaveClass("tabs");
  });

  it("renders all tab labels", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Tab 3")).toBeInTheDocument();
  });

  it("applies tab class to each tab", () => {
    const { container } = render(<Tabs tabs={tabs} />);
    const tabItems = container.querySelectorAll(".tab");
    expect(tabItems.length).toBe(3);
  });

  it("applies tab-active class to active tab", () => {
    render(<Tabs tabs={tabs} />);
    const activeTab = screen.getByText("Tab 1");
    expect(activeTab).toHaveClass("tab-active");
  });

  it("does not apply tab-active to inactive tabs", () => {
    render(<Tabs tabs={tabs} />);
    expect(screen.getByText("Tab 2")).not.toHaveClass("tab-active");
  });

  it("applies tabs-boxed variant class", () => {
    const { container } = render(<Tabs tabs={tabs} variant="boxed" />);
    expect(container.firstChild).toHaveClass("tabs-boxed");
  });

  it("applies tabs-lifted variant class", () => {
    const { container } = render(<Tabs tabs={tabs} variant="lifted" />);
    expect(container.firstChild).toHaveClass("tabs-lifted");
  });

  it("applies tabs-bordered variant class", () => {
    const { container } = render(<Tabs tabs={tabs} variant="bordered" />);
    expect(container.firstChild).toHaveClass("tabs-bordered");
  });

  it("calls onTabChange when tab clicked", () => {
    const onTabChange = vi.fn(() => undefined);
    render(<Tabs tabs={tabs} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText("Tab 2"));
    expect(onTabChange).toHaveBeenCalledWith(1);
  });

  it("applies tab-disabled class to disabled tab", () => {
    render(<Tabs tabs={[{ label: "Tab 1" }, { label: "Tab 2", disabled: true }]} />);
    expect(screen.getByText("Tab 2")).toHaveClass("tab-disabled");
  });

  it("applies custom className", () => {
    const { container } = render(<Tabs tabs={tabs} className="my-tabs" />);
    expect(container.firstChild).toHaveClass("my-tabs");
  });
});
