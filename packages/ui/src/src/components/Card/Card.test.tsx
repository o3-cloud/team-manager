
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Card } from "./Card";

afterEach(cleanup);

describe("Card", () => {
  it("exports Card component", () => {
    expect(Card).toBeDefined();
    expect(typeof Card).toBe("function");
  });

  it("renders children", () => {
    render(<Card>Card content here</Card>);
    expect(screen.getByText("Card content here")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Card title="My Card">Content</Card>);
    expect(screen.getByText("My Card")).toBeInTheDocument();
  });

  it("renders image when src provided", () => {
    render(
      <Card image="https://example.com/image.jpg" imageAlt="A photo">
        Content
      </Card>
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders image alt text", () => {
    render(
      <Card image="https://example.com/image.jpg" imageAlt="Sunset photo">
        Content
      </Card>
    );
    expect(screen.getByAltText("Sunset photo")).toBeInTheDocument();
  });

  it("applies card-compact class when compact prop is true", () => {
    const { container } = render(<Card compact>Content</Card>);
    expect(container.firstChild).toHaveClass("card-compact");
  });

  it("applies card-bordered class when bordered prop is true", () => {
    const { container } = render(<Card bordered>Content</Card>);
    expect(container.firstChild).toHaveClass("card-bordered");
  });

  it("renders actions when provided", () => {
    render(<Card actions={<button type="button">Buy Now</button>}>Content</Card>);
    expect(screen.getByRole("button", { name: "Buy Now" })).toBeInTheDocument();
  });

  it("does not render figure when no image", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector("figure")).not.toBeInTheDocument();
  });
});
