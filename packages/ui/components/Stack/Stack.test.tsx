
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

afterEach(cleanup);

describe("Stack", () => {
  it("exports Stack component", () => {
    expect(Stack).toBeDefined();
    expect(typeof Stack).toBe("function");
  });

  it("renders children", () => {
    render(
      <Stack>
        <div>Layer 1</div>
        <div>Layer 2</div>
      </Stack>
    );
    expect(screen.getByText("Layer 1")).toBeInTheDocument();
    expect(screen.getByText("Layer 2")).toBeInTheDocument();
  });

  it("applies stack class", () => {
    render(
      <Stack data-testid="stack">
        <div>Item</div>
      </Stack>
    );
    expect(screen.getByTestId("stack")).toHaveClass("stack");
  });

  it("passes additional className", () => {
    render(
      <Stack className="w-32" data-testid="stack">
        <div>Item</div>
      </Stack>
    );
    expect(screen.getByTestId("stack")).toHaveClass("w-32");
  });
});
