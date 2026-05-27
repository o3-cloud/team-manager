
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MockupCode } from "./MockupCode";

afterEach(cleanup);

describe("MockupCode", () => {
  it("exports MockupCode and is a function", () => {
    expect(MockupCode).toBeDefined();
    expect(typeof MockupCode).toBe("function");
  });

  it("renders with mockup-code class on root", () => {
    const { container } = render(<MockupCode lines={[{ code: "hello" }]} />);
    expect(container.firstChild).toHaveClass("mockup-code");
  });

  it("renders code lines inside pre/code elements", () => {
    render(<MockupCode lines={[{ code: "npm install" }, { code: "npm run dev" }]} />);
    expect(screen.getByText("npm install")).toBeInTheDocument();
    expect(screen.getByText("npm run dev")).toBeInTheDocument();
    const codeEls = document.querySelectorAll("pre > code");
    expect(codeEls).toHaveLength(2);
  });

  it("applies data-prefix attribute when prefix provided", () => {
    const { container } = render(<MockupCode lines={[{ prefix: "$", code: "ls -la" }]} />);
    const pre = container.querySelector("pre");
    expect(pre).toHaveAttribute("data-prefix", "$");
  });

  it("does NOT add data-prefix when prefix undefined", () => {
    const { container } = render(<MockupCode lines={[{ code: "ls -la" }]} />);
    const pre = container.querySelector("pre");
    expect(pre).not.toHaveAttribute("data-prefix");
  });

  it("applies highlight classes when highlight=true", () => {
    const { container } = render(
      <MockupCode lines={[{ code: "important line", highlight: true }]} />
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("bg-warning");
    expect(pre).toHaveClass("text-warning-content");
  });

  it("does NOT apply highlight classes when highlight is falsy", () => {
    const { container } = render(
      <MockupCode lines={[{ code: "normal line", highlight: false }]} />
    );
    const pre = container.querySelector("pre");
    expect(pre).not.toHaveClass("bg-warning");
    expect(pre).not.toHaveClass("text-warning-content");
  });

  it("applies custom className alongside mockup-code", () => {
    const { container } = render(<MockupCode lines={[{ code: "hello" }]} className="my-4 mx-2" />);
    expect(container.firstChild).toHaveClass("mockup-code");
    expect(container.firstChild).toHaveClass("my-4");
    expect(container.firstChild).toHaveClass("mx-2");
  });
});
