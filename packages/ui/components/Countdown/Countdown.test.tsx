
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Countdown } from "./Countdown";

afterEach(cleanup);

describe("Countdown", () => {
  it("exports Countdown component", () => {
    expect(Countdown).toBeDefined();
    expect(typeof Countdown).toBe("function");
  });

  it("renders with hours", () => {
    const { container } = render(<Countdown hours={10} />);
    expect(container.querySelector(".countdown")).toBeInTheDocument();
  });

  it("renders with minutes", () => {
    const { container } = render(<Countdown minutes={30} />);
    expect(container.querySelector(".countdown")).toBeInTheDocument();
  });

  it("renders with seconds", () => {
    const { container } = render(<Countdown seconds={45} />);
    expect(container.querySelector(".countdown")).toBeInTheDocument();
  });

  it("applies --value style for hours", () => {
    const { container } = render(<Countdown hours={10} />);
    const span = container.querySelector<HTMLElement>(".countdown span");
    if (!span) throw new Error("Expected .countdown span element");
    expect(span.style.getPropertyValue("--value")).toBe("10");
  });

  it("applies --value style for minutes", () => {
    const { container } = render(<Countdown minutes={24} />);
    const span = container.querySelector<HTMLElement>(".countdown span");
    if (!span) throw new Error("Expected .countdown span element");
    expect(span.style.getPropertyValue("--value")).toBe("24");
  });

  it("applies --value style for seconds", () => {
    const { container } = render(<Countdown seconds={59} />);
    const span = container.querySelector<HTMLElement>(".countdown span");
    if (!span) throw new Error("Expected .countdown span element");
    expect(span.style.getPropertyValue("--value")).toBe("59");
  });

  it("shows labels when showLabels is true", () => {
    render(<Countdown hours={1} minutes={2} seconds={3} showLabels={true} />);
    expect(screen.getByText("hrs")).toBeInTheDocument();
    expect(screen.getByText("min")).toBeInTheDocument();
    expect(screen.getByText("sec")).toBeInTheDocument();
  });

  it("does not show labels by default", () => {
    render(<Countdown hours={1} minutes={2} seconds={3} />);
    expect(screen.queryByText("hrs")).not.toBeInTheDocument();
    expect(screen.queryByText("min")).not.toBeInTheDocument();
    expect(screen.queryByText("sec")).not.toBeInTheDocument();
  });
});
