
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

afterEach(cleanup);

describe("Steps", () => {
  const items = [
    { label: "Register" },
    { label: "Choose plan" },
    { label: "Purchase" },
    { label: "Receive Product" },
  ];

  it("exports Steps component", () => {
    expect(Steps).toBeDefined();
    expect(typeof Steps).toBe("function");
  });

  it("applies steps class", () => {
    const { container } = render(<Steps items={items} />);
    expect(container.firstChild).toHaveClass("steps");
  });

  it("renders all step labels", () => {
    render(<Steps items={items} />);
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Choose plan")).toBeInTheDocument();
    expect(screen.getByText("Purchase")).toBeInTheDocument();
    expect(screen.getByText("Receive Product")).toBeInTheDocument();
  });

  it("applies step class to each step item", () => {
    const { container } = render(<Steps items={items} />);
    const stepItems = container.querySelectorAll("li.step");
    expect(stepItems.length).toBe(4);
  });

  it("applies variant class to step item", () => {
    render(<Steps items={[{ label: "Done", variant: "primary" }, { label: "Next" }]} />);
    const { container } = render(
      <Steps items={[{ label: "Done", variant: "primary" }, { label: "Next" }]} />
    );
    const steps = container.querySelectorAll("li.step");
    expect(steps[0]).toHaveClass("step-primary");
  });

  it("applies steps-vertical class when vertical prop is true", () => {
    const { container } = render(<Steps items={items} vertical />);
    expect(container.firstChild).toHaveClass("steps-vertical");
  });

  it("applies data-content attribute when content is provided", () => {
    const { container } = render(<Steps items={[{ label: "Done", content: "✓" }]} />);
    const step = container.querySelector("li.step");
    expect(step).toHaveAttribute("data-content", "✓");
  });

  it("applies custom className", () => {
    const { container } = render(<Steps items={items} className="w-full" />);
    expect(container.firstChild).toHaveClass("w-full");
  });
});
