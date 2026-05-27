
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

afterEach(cleanup);

describe("Footer", () => {
  it("exports Footer component", () => {
    expect(Footer).toBeDefined();
    expect(typeof Footer).toBe("function");
  });

  it("renders as a footer element", () => {
    render(<Footer>Content</Footer>);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Footer>Footer content</Footer>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies footer class", () => {
    render(<Footer data-testid="ft">Content</Footer>);
    expect(screen.getByTestId("ft")).toHaveClass("footer");
  });

  it("applies footer-center class when center is true", () => {
    render(
      <Footer center data-testid="ft">
        Content
      </Footer>
    );
    expect(screen.getByTestId("ft")).toHaveClass("footer-center");
  });

  it("does not apply footer-center class by default", () => {
    render(<Footer data-testid="ft">Content</Footer>);
    expect(screen.getByTestId("ft")).not.toHaveClass("footer-center");
  });

  it("passes additional className", () => {
    render(
      <Footer className="bg-neutral" data-testid="ft">
        Content
      </Footer>
    );
    expect(screen.getByTestId("ft")).toHaveClass("bg-neutral");
  });
});
