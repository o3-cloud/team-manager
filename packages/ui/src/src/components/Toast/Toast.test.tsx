
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Toast } from "./Toast";

afterEach(cleanup);

describe("Toast", () => {
  it("exports Toast component", () => {
    expect(Toast).toBeDefined();
    expect(typeof Toast).toBe("function");
  });

  it("renders children", () => {
    render(<Toast>Saved!</Toast>);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("has toast base class", () => {
    const { container } = render(<Toast>Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast");
  });

  it("applies toast-bottom class by default", () => {
    const { container } = render(<Toast>Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast-bottom");
  });

  it("applies toast-top class when vertical is top", () => {
    const { container } = render(<Toast vertical="top">Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast-top");
  });

  it("applies toast-end class by default", () => {
    const { container } = render(<Toast>Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast-end");
  });

  it("applies toast-center horizontal class", () => {
    const { container } = render(<Toast horizontal="center">Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast-center");
  });

  it("applies toast-start horizontal class", () => {
    const { container } = render(<Toast horizontal="start">Msg</Toast>);
    expect(container.querySelector("div")).toHaveClass("toast-start");
  });
});
