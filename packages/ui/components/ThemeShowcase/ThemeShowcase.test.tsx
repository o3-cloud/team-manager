
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeShowcase } from "./ThemeShowcase";

afterEach(cleanup);

describe("ThemeShowcase", () => {
  it("exports ThemeShowcase component", () => {
    expect(ThemeShowcase).toBeDefined();
    expect(typeof ThemeShowcase).toBe("function");
  });

  it("renders the default title heading", () => {
    render(<ThemeShowcase themes={["light", "dark"]} />);
    expect(screen.getByRole("heading", { name: "daisyUI Themes" })).toBeInTheDocument();
  });

  it("renders a custom title when provided", () => {
    render(<ThemeShowcase themes={["light"]} title="My Themes" />);
    expect(screen.getByRole("heading", { name: "My Themes" })).toBeInTheDocument();
  });

  it("renders a swatch for each supplied theme", () => {
    render(<ThemeShowcase themes={["light", "dark", "cupcake"]} />);
    // Verify theme names appear in the document (ThemeSwatch renders theme name in h3)
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("cupcake")).toBeInTheDocument();
  });

  it("shows the theme count in the subtitle", () => {
    render(<ThemeShowcase themes={["light", "dark"]} />);
    expect(screen.getByText("2 themes")).toBeInTheDocument();
  });

  it("renders all 35 daisyUI themes by default", () => {
    render(<ThemeShowcase />);
    expect(screen.getByText("35 themes")).toBeInTheDocument();
  });

  it("has a header landmark containing the title", () => {
    render(<ThemeShowcase themes={["light"]} />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(screen.getByRole("heading", { name: "daisyUI Themes" }));
  });
});
