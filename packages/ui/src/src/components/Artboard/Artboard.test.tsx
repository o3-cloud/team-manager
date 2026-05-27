
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Artboard } from "./Artboard";

afterEach(cleanup);

describe("Artboard", () => {
  it("exports Artboard component", () => {
    expect(Artboard).toBeDefined();
    expect(typeof Artboard).toBe("function");
  });

  it("renders children", () => {
    render(<Artboard>Content</Artboard>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies artboard class by default", () => {
    render(<Artboard data-testid="ab">Content</Artboard>);
    expect(screen.getByTestId("ab")).toHaveClass("artboard");
  });

  it("applies phone-1 size class", () => {
    render(
      <Artboard size="phone-1" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-1");
  });

  it("applies phone-2 size class", () => {
    render(
      <Artboard size="phone-2" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-2");
  });

  it("applies phone-3 size class", () => {
    render(
      <Artboard size="phone-3" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-3");
  });

  it("applies phone-4 size class", () => {
    render(
      <Artboard size="phone-4" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-4");
  });

  it("applies phone-5 size class", () => {
    render(
      <Artboard size="phone-5" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-5");
  });

  it("applies phone-6 size class", () => {
    render(
      <Artboard size="phone-6" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("phone-6");
  });

  it("applies artboard-demo class when demo is true", () => {
    render(
      <Artboard demo data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("artboard-demo");
  });

  it("does not apply artboard-demo class when demo is false", () => {
    render(<Artboard data-testid="ab">Content</Artboard>);
    expect(screen.getByTestId("ab")).not.toHaveClass("artboard-demo");
  });

  it("applies horizontal class when horizontal is true", () => {
    render(
      <Artboard horizontal data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("artboard-horizontal");
  });

  it("passes additional className", () => {
    render(
      <Artboard className="custom" data-testid="ab">
        Content
      </Artboard>
    );
    expect(screen.getByTestId("ab")).toHaveClass("custom");
  });
});
