
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Status } from "./Status";

afterEach(cleanup);

describe("Status", () => {
  it("exports Status component", () => {
    expect(Status).toBeDefined();
    expect(typeof Status).toBe("function");
  });

  it("renders a span element", () => {
    const { container } = render(<Status />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("has status base class", () => {
    const { container } = render(<Status />);
    expect(container.querySelector("span")).toHaveClass("status");
  });

  it("applies neutral variant class by default", () => {
    const { container } = render(<Status />);
    expect(container.querySelector("span")).toHaveClass("status-neutral");
  });

  it("applies primary variant class", () => {
    const { container } = render(<Status variant="primary" />);
    expect(container.querySelector("span")).toHaveClass("status-primary");
  });

  it("applies success variant class", () => {
    const { container } = render(<Status variant="success" />);
    expect(container.querySelector("span")).toHaveClass("status-success");
  });

  it("applies warning variant class", () => {
    const { container } = render(<Status variant="warning" />);
    expect(container.querySelector("span")).toHaveClass("status-warning");
  });

  it("applies error variant class", () => {
    const { container } = render(<Status variant="error" />);
    expect(container.querySelector("span")).toHaveClass("status-error");
  });

  it("applies md size class by default", () => {
    const { container } = render(<Status />);
    expect(container.querySelector("span")).toHaveClass("status-md");
  });

  it("applies xs size class", () => {
    const { container } = render(<Status size="xs" />);
    expect(container.querySelector("span")).toHaveClass("status-xs");
  });

  it("applies lg size class", () => {
    const { container } = render(<Status size="lg" />);
    expect(container.querySelector("span")).toHaveClass("status-lg");
  });

  it("passes aria-label to the span", () => {
    const { container } = render(<Status aria-label="Online" />);
    expect(container.querySelector("span")).toHaveAttribute("aria-label", "Online");
  });
});
