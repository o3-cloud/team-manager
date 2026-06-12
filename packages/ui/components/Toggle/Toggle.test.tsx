
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Toggle } from "./Toggle";

afterEach(cleanup);

describe("Toggle", () => {
  it("exports Toggle component", () => {
    expect(Toggle).toBeDefined();
    expect(typeof Toggle).toBe("function");
  });

  it("renders a checkbox input", () => {
    render(<Toggle />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("applies base toggle class", () => {
    render(<Toggle />);
    expect(screen.getByRole("checkbox")).toHaveClass("toggle");
  });

  it("applies primary variant class", () => {
    render(<Toggle variant="primary" />);
    expect(screen.getByRole("checkbox")).toHaveClass("toggle-primary");
  });

  it("applies secondary variant class", () => {
    render(<Toggle variant="secondary" />);
    expect(screen.getByRole("checkbox")).toHaveClass("toggle-secondary");
  });

  it("applies size class", () => {
    render(<Toggle size="lg" />);
    expect(screen.getByRole("checkbox")).toHaveClass("toggle-lg");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Toggle disabled />);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("renders a label when label prop is provided", () => {
    render(<Toggle label="Enable notifications" />);
    expect(screen.getByText("Enable notifications")).toBeInTheDocument();
  });

  it("associates label with toggle via htmlFor", () => {
    render(<Toggle label="Enable notifications" id="notif" />);
    const label = screen.getByText("Enable notifications").closest("label");
    expect(label?.getAttribute("for")).toBe("notif");
  });

  it("is checked when checked prop is true", () => {
    render(<Toggle checked onChange={() => undefined} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn(() => undefined);
    render(<Toggle onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
