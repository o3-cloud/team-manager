
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Join } from "./Join";

afterEach(cleanup);

describe("Join", () => {
  it("exports Join component", () => {
    expect(Join).toBeDefined();
    expect(typeof Join).toBe("function");
  });

  it("renders children", () => {
    render(
      <Join>
        <button type="button">A</button>
        <button type="button">B</button>
      </Join>
    );
    expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B" })).toBeInTheDocument();
  });

  it("applies join class", () => {
    render(
      <Join data-testid="join">
        <button type="button">A</button>
      </Join>
    );
    expect(screen.getByTestId("join")).toHaveClass("join");
  });

  it("applies join-vertical class when vertical is true", () => {
    render(
      <Join vertical data-testid="join">
        <button type="button">A</button>
      </Join>
    );
    expect(screen.getByTestId("join")).toHaveClass("join-vertical");
  });

  it("does not apply join-vertical class by default", () => {
    render(
      <Join data-testid="join">
        <button type="button">A</button>
      </Join>
    );
    expect(screen.getByTestId("join")).not.toHaveClass("join-vertical");
  });

  it("applies join-horizontal class when horizontal is explicitly set", () => {
    render(
      <Join horizontal data-testid="join">
        <button type="button">A</button>
      </Join>
    );
    expect(screen.getByTestId("join")).toHaveClass("join-horizontal");
  });

  it("passes additional className", () => {
    render(
      <Join className="w-full" data-testid="join">
        <button type="button">A</button>
      </Join>
    );
    expect(screen.getByTestId("join")).toHaveClass("w-full");
  });
});
