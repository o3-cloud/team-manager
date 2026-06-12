
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Fieldset } from "./Fieldset";

afterEach(cleanup);

describe("Fieldset", () => {
  it("exports Fieldset component", () => {
    expect(Fieldset).toBeDefined();
    expect(typeof Fieldset).toBe("function");
  });

  it("renders a fieldset element", () => {
    const { container } = render(<Fieldset>content</Fieldset>);
    expect(container.querySelector("fieldset")).toBeInTheDocument();
  });

  it("has fieldset base class", () => {
    const { container } = render(<Fieldset>content</Fieldset>);
    expect(container.querySelector("fieldset")).toHaveClass("fieldset");
  });

  it("renders children inside the fieldset", () => {
    const { getByText } = render(<Fieldset>Form fields here</Fieldset>);
    expect(getByText("Form fields here")).toBeInTheDocument();
  });

  it("renders legend when legend prop is provided", () => {
    const { container } = render(<Fieldset legend="Personal Info">content</Fieldset>);
    const legend = container.querySelector("legend");
    expect(legend).toBeInTheDocument();
    expect(legend).toHaveClass("fieldset-legend");
    expect(legend).toHaveTextContent("Personal Info");
  });

  it("does not render legend when legend prop is omitted", () => {
    const { container } = render(<Fieldset>content</Fieldset>);
    expect(container.querySelector("legend")).not.toBeInTheDocument();
  });
});
