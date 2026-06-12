
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Indicator } from "./Indicator";

afterEach(cleanup);

describe("Indicator", () => {
  it("exports Indicator component", () => {
    expect(Indicator).toBeDefined();
    expect(typeof Indicator).toBe("function");
  });

  it("renders children", () => {
    render(
      <Indicator badge={<span>3</span>}>
        <button type="button">Inbox</button>
      </Indicator>
    );
    expect(screen.getByRole("button", { name: "Inbox" })).toBeInTheDocument();
  });

  it("renders the badge", () => {
    render(
      <Indicator badge={<span data-testid="badge">99</span>}>
        <div>Content</div>
      </Indicator>
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("applies indicator class to wrapper", () => {
    render(
      <Indicator badge={<span>!</span>} data-testid="ind">
        <div>Content</div>
      </Indicator>
    );
    expect(screen.getByTestId("ind")).toHaveClass("indicator");
  });

  it("applies indicator-item class to badge wrapper", () => {
    render(
      <Indicator badge={<span data-testid="b">1</span>}>
        <div>Content</div>
      </Indicator>
    );
    const badgeEl = screen.getByTestId("b").parentElement;
    expect(badgeEl).toHaveClass("indicator-item");
  });

  it("applies position classes", () => {
    render(
      <Indicator badge={<span data-testid="b">1</span>} position="top-left">
        <div>Content</div>
      </Indicator>
    );
    const badgeEl = screen.getByTestId("b").parentElement;
    expect(badgeEl).toHaveClass("indicator-top");
    expect(badgeEl).toHaveClass("indicator-start");
  });

  it("applies bottom-right position classes", () => {
    render(
      <Indicator badge={<span data-testid="b">1</span>} position="bottom-right">
        <div>Content</div>
      </Indicator>
    );
    const badgeEl = screen.getByTestId("b").parentElement;
    expect(badgeEl).toHaveClass("indicator-bottom");
    expect(badgeEl).toHaveClass("indicator-end");
  });

  it("passes additional className", () => {
    render(
      <Indicator badge={<span>1</span>} className="custom" data-testid="ind">
        <div>Content</div>
      </Indicator>
    );
    expect(screen.getByTestId("ind")).toHaveClass("custom");
  });
});
