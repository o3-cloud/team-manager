
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "./Pagination";

afterEach(cleanup);

describe("Pagination", () => {
  it("exports Pagination component", () => {
    expect(Pagination).toBeDefined();
    expect(typeof Pagination).toBe("function");
  });

  it("applies join class to wrapper", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={5} />);
    expect(container.firstChild).toHaveClass("join");
  });

  it("renders page buttons for all pages", () => {
    render(<Pagination currentPage={1} totalPages={3} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("marks current page button as active", () => {
    render(<Pagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("button", { name: "2" })).toHaveClass("btn-active");
  });

  it("does not mark other pages as active", () => {
    render(<Pagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("button", { name: "1" })).not.toHaveClass("btn-active");
  });

  it("calls onPageChange when page button clicked", () => {
    const onPageChange = vi.fn(() => undefined);
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("applies join-item and btn classes to page buttons", () => {
    render(<Pagination currentPage={1} totalPages={2} />);
    const btn = screen.getByRole("button", { name: "1" });
    expect(btn).toHaveClass("join-item");
    expect(btn).toHaveClass("btn");
  });

  it("applies custom className", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={3} className="mt-4" />);
    expect(container.firstChild).toHaveClass("mt-4");
  });

  it("renders single page", () => {
    render(<Pagination currentPage={1} totalPages={1} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
  });
});
