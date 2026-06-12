
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FAB } from "./FAB";

afterEach(cleanup);

describe("FAB", () => {
  it("exports FAB component", () => {
    expect(FAB).toBeDefined();
    expect(typeof FAB).toBe("function");
  });

  it("renders a div with fab class", () => {
    const { container } = render(<FAB trigger={<button type="button">+</button>} />);
    expect(container.querySelector(".fab")).toBeInTheDocument();
  });

  it("renders the trigger inside a tabindex wrapper", () => {
    const { container } = render(
      <FAB
        trigger={
          <button type="button" aria-label="Open">
            +
          </button>
        }
      />
    );
    const trigger = container.querySelector("[tabindex='0']");
    expect(trigger).toBeInTheDocument();
    expect(trigger?.querySelector("button")).toBeInTheDocument();
  });

  it("renders action items as children", () => {
    const { getByText } = render(
      <FAB trigger={<button type="button">+</button>}>
        <button type="button">Action 1</button>
        <button type="button">Action 2</button>
      </FAB>
    );
    expect(getByText("Action 1")).toBeInTheDocument();
    expect(getByText("Action 2")).toBeInTheDocument();
  });

  it("applies fab-flower class when flower prop is true", () => {
    const { container } = render(<FAB trigger={<button type="button">+</button>} flower />);
    expect(container.querySelector(".fab")).toHaveClass("fab-flower");
  });

  it("does not apply fab-flower class by default", () => {
    const { container } = render(<FAB trigger={<button type="button">+</button>} />);
    expect(container.querySelector(".fab")).not.toHaveClass("fab-flower");
  });
});
