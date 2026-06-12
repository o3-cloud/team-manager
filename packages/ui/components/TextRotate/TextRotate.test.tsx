
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { TextRotate } from "./TextRotate";

afterEach(cleanup);

describe("TextRotate", () => {
  it("exports TextRotate component", () => {
    expect(TextRotate).toBeDefined();
    expect(typeof TextRotate).toBe("function");
  });

  it("renders a span with text-rotate class", () => {
    const { container } = render(<TextRotate items={["Hello", "World"]} />);
    expect(container.querySelector(".text-rotate")).toBeInTheDocument();
  });

  it("renders all items as child spans", () => {
    const { getByText } = render(<TextRotate items={["React", "Vue", "Svelte"]} />);
    expect(getByText("React")).toBeInTheDocument();
    expect(getByText("Vue")).toBeInTheDocument();
    expect(getByText("Svelte")).toBeInTheDocument();
  });

  it("sets --duration CSS variable when duration is provided", () => {
    const { container } = render(<TextRotate items={["A", "B"]} duration="5s" />);
    const el = container.querySelector<HTMLElement>(".text-rotate");
    if (!el) throw new Error("Expected .text-rotate element");
    expect(el.style.getPropertyValue("--duration")).toBe("5s");
  });

  it("does not set --duration when duration is not provided", () => {
    const { container } = render(<TextRotate items={["A", "B"]} />);
    const el = container.querySelector<HTMLElement>(".text-rotate");
    if (!el) throw new Error("Expected .text-rotate element");
    expect(el.style.getPropertyValue("--duration")).toBe("");
  });
});
