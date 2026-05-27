
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Loading } from "./Loading";

afterEach(cleanup);

describe("Loading", () => {
  it("exports Loading component", () => {
    expect(Loading).toBeDefined();
    expect(typeof Loading).toBe("function");
  });

  it("renders a span element", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("applies spinner variant class by default", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector("span")).toHaveClass("loading-spinner");
  });

  it("applies dots variant class", () => {
    const { container } = render(<Loading variant="dots" />);
    expect(container.querySelector("span")).toHaveClass("loading-dots");
  });

  it("applies ring variant class", () => {
    const { container } = render(<Loading variant="ring" />);
    expect(container.querySelector("span")).toHaveClass("loading-ring");
  });

  it("applies md size class by default", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector("span")).toHaveClass("loading-md");
  });

  it("applies lg size class", () => {
    const { container } = render(<Loading size="lg" />);
    expect(container.querySelector("span")).toHaveClass("loading-lg");
  });

  it("applies xs size class", () => {
    const { container } = render(<Loading size="xs" />);
    expect(container.querySelector("span")).toHaveClass("loading-xs");
  });

  it("has loading base class", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector("span")).toHaveClass("loading");
  });
});
