
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeSwatch } from "./ThemeSwatch";

afterEach(cleanup);

describe("ThemeSwatch", () => {
  it("exports ThemeSwatch component", () => {
    expect(ThemeSwatch).toBeDefined();
    expect(typeof ThemeSwatch).toBe("function");
  });

  it("renders the theme name as a heading", () => {
    render(<ThemeSwatch theme="light" />);
    expect(screen.getByText("light")).toBeInTheDocument();
  });

  it("renders the container with aria-label for the theme", () => {
    render(<ThemeSwatch theme="cupcake" />);
    expect(screen.getByLabelText("Theme: cupcake")).toBeInTheDocument();
  });

  it("renders Primary, Secondary, and Accent buttons", () => {
    render(<ThemeSwatch theme="dark" />);
    expect(screen.getByRole("button", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Secondary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accent" })).toBeInTheDocument();
  });

  it("renders a progress indicator", () => {
    render(<ThemeSwatch theme="light" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders the example text input", () => {
    render(<ThemeSwatch theme="light" />);
    expect(screen.getByLabelText("Example text input")).toBeInTheDocument();
  });
});
