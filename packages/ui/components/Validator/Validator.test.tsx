
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Validator } from "./Validator";

afterEach(cleanup);

describe("Validator", () => {
  it("exports Validator component", () => {
    expect(Validator).toBeDefined();
    expect(typeof Validator).toBe("function");
  });

  it("renders child element", () => {
    const { container } = render(
      <Validator>
        <input type="text" className="input" required />
      </Validator>
    );
    expect(container.querySelector("input")).toBeInTheDocument();
  });

  it("adds validator class to child element", () => {
    const { container } = render(
      <Validator>
        <input type="text" className="input" required />
      </Validator>
    );
    expect(container.querySelector("input")).toHaveClass("validator");
  });

  it("preserves existing className on child element", () => {
    const { container } = render(
      <Validator>
        <input type="text" className="input" required />
      </Validator>
    );
    const input = container.querySelector("input");
    expect(input).toHaveClass("input");
    expect(input).toHaveClass("validator");
  });

  it("renders hint with validator-hint class when provided", () => {
    const { container } = render(
      <Validator hint="This field is required">
        <input type="text" required />
      </Validator>
    );
    const hint = container.querySelector(".validator-hint");
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveTextContent("This field is required");
  });

  it("does not render hint when not provided", () => {
    const { container } = render(
      <Validator>
        <input type="text" required />
      </Validator>
    );
    expect(container.querySelector(".validator-hint")).not.toBeInTheDocument();
  });

  it("works with textarea", () => {
    const { container } = render(
      <Validator hint="Max 200 characters">
        <textarea className="textarea" required />
      </Validator>
    );
    expect(container.querySelector("textarea")).toHaveClass("validator");
    expect(container.querySelector(".validator-hint")).toHaveTextContent("Max 200 characters");
  });

  it("works with select", () => {
    const { container } = render(
      <Validator hint="Please select an option">
        <select className="select" required>
          <option value="">Pick one</option>
        </select>
      </Validator>
    );
    expect(container.querySelector("select")).toHaveClass("validator");
    expect(container.querySelector(".validator-hint")).toHaveTextContent("Please select an option");
  });

  it("applies className to wrapper div", () => {
    const { container } = render(
      <Validator className="w-full">
        <input type="text" required />
      </Validator>
    );
    expect(container.querySelector("div")).toHaveClass("w-full");
  });
});
