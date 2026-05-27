
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FloatingLabel, Label } from "./Label";

afterEach(cleanup);

describe("Label", () => {
  it("exports Label and FloatingLabel components", () => {
    expect(Label).toBeDefined();
    expect(FloatingLabel).toBeDefined();
  });

  it("renders a label element", () => {
    const { container } = render(<Label>Username</Label>);
    expect(container.querySelector("label")).toBeInTheDocument();
  });

  it("has label base class", () => {
    const { container } = render(<Label>Username</Label>);
    expect(container.querySelector("label")).toHaveClass("label");
  });

  it("renders children", () => {
    const { getByText } = render(<Label>Email address</Label>);
    expect(getByText("Email address")).toBeInTheDocument();
  });

  it("passes htmlFor to the label element", () => {
    const { container } = render(<Label htmlFor="email-input">Email</Label>);
    expect(container.querySelector("label")).toHaveAttribute("for", "email-input");
  });
});

describe("FloatingLabel", () => {
  it("renders a label element with floating-label class", () => {
    const { container } = render(
      <FloatingLabel>
        <input type="text" placeholder=" " />
        <span>Name</span>
      </FloatingLabel>
    );
    const label = container.querySelector("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("floating-label");
  });

  it("renders children inside the floating label", () => {
    const { container } = render(
      <FloatingLabel>
        <input type="text" placeholder=" " />
        <span>Email</span>
      </FloatingLabel>
    );
    expect(container.querySelector("input")).toBeInTheDocument();
    expect(container.querySelector("span")).toHaveTextContent("Email");
  });
});
