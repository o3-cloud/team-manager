
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

afterEach(cleanup);

describe("Avatar", () => {
  it("exports Avatar component", () => {
    expect(Avatar).toBeDefined();
    expect(typeof Avatar).toBe("function");
  });

  it("renders img when src provided", () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User photo" />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("applies alt text to img", () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    expect(screen.getByAltText("Jane Doe")).toBeInTheDocument();
  });

  it("applies online class when online prop is true", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" online />);
    expect(container.firstChild).toHaveClass("online");
  });

  it("applies offline class when offline prop is true", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" offline />);
    expect(container.firstChild).toHaveClass("offline");
  });

  it("applies rounded-full for circle shape (default)", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" />);
    const innerDiv = container.querySelector(".avatar > div");
    expect(innerDiv).toHaveClass("rounded-full");
  });

  it("applies rounded for square shape", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" shape="square" />);
    const innerDiv = container.querySelector(".avatar > div");
    expect(innerDiv).toHaveClass("rounded");
  });

  it("renders initials when no src provided", () => {
    render(<Avatar initials="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies correct w-* class for size xs", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" size="xs" />);
    const innerDiv = container.querySelector(".avatar > div");
    expect(innerDiv).toHaveClass("w-8");
  });

  it("applies correct w-* class for size lg", () => {
    const { container } = render(<Avatar src="https://example.com/photo.jpg" size="lg" />);
    const innerDiv = container.querySelector(".avatar > div");
    expect(innerDiv).toHaveClass("w-24");
  });
});
