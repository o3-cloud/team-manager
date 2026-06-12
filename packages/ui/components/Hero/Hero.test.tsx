
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Hero } from "./Hero";

afterEach(cleanup);

describe("Hero", () => {
  it("exports Hero component", () => {
    expect(Hero).toBeDefined();
    expect(typeof Hero).toBe("function");
  });

  it("renders children", () => {
    render(<Hero>Hero content</Hero>);
    expect(screen.getByText("Hero content")).toBeInTheDocument();
  });

  it("applies hero class", () => {
    render(<Hero data-testid="hero">Content</Hero>);
    expect(screen.getByTestId("hero")).toHaveClass("hero");
  });

  it("wraps children in hero-content div", () => {
    render(<Hero data-testid="hero">Content</Hero>);
    const heroContent = screen.getByTestId("hero").querySelector(".hero-content");
    expect(heroContent).toBeInTheDocument();
  });

  it("renders overlay when overlay is true", () => {
    render(
      <Hero overlay data-testid="hero">
        Content
      </Hero>
    );
    const overlayEl = screen.getByTestId("hero").querySelector(".hero-overlay");
    expect(overlayEl).toBeInTheDocument();
  });

  it("does not render overlay by default", () => {
    render(<Hero data-testid="hero">Content</Hero>);
    expect(screen.getByTestId("hero").querySelector(".hero-overlay")).toBeNull();
  });

  it("renders background image when backgroundImage is provided", () => {
    render(
      <Hero backgroundImage="https://example.com/img.jpg" data-testid="hero">
        Content
      </Hero>
    );
    const hero = screen.getByTestId("hero");
    expect(hero.style.backgroundImage).toContain("url(");
  });

  it("passes additional className", () => {
    render(
      <Hero className="min-h-screen" data-testid="hero">
        Content
      </Hero>
    );
    expect(screen.getByTestId("hero")).toHaveClass("min-h-screen");
  });
});
