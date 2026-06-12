
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Rating } from "./Rating";

afterEach(cleanup);

describe("Rating", () => {
  it("exports Rating component", () => {
    expect(Rating).toBeDefined();
    expect(typeof Rating).toBe("function");
  });

  it("renders the rating container", () => {
    render(<Rating name="stars" />);
    const container = screen.getByRole("group");
    expect(container).toHaveClass("rating");
  });

  it("renders 5 radio inputs by default", () => {
    render(<Rating name="stars" />);
    const inputs = screen.getAllByRole("radio");
    expect(inputs).toHaveLength(5);
  });

  it("renders correct number of inputs when max is provided", () => {
    render(<Rating name="stars" max={3} />);
    const inputs = screen.getAllByRole("radio");
    expect(inputs).toHaveLength(3);
  });

  it("applies mask-star class to each radio", () => {
    render(<Rating name="stars" />);
    const inputs = screen.getAllByRole("radio");
    for (const input of inputs) {
      expect(input).toHaveClass("mask");
      expect(input).toHaveClass("mask-star");
    }
  });

  it("checks the input corresponding to the value", () => {
    render(<Rating name="stars" value={3} onChange={() => undefined} />);
    const inputs = screen.getAllByRole("radio");
    const third = inputs[2];
    expect(third).toBeDefined();
    expect(third).toBeChecked();
  });

  it("calls onChange when a star is clicked", () => {
    const onChange = vi.fn(() => undefined);
    render(<Rating name="stars" onChange={onChange} />);
    const inputs = screen.getAllByRole("radio");
    const second = inputs[1];
    if (!second) throw new Error("second radio not found");
    fireEvent.click(second);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("applies rating-lg class when size is lg", () => {
    render(<Rating name="stars" size="lg" />);
    expect(screen.getByRole("group")).toHaveClass("rating-lg");
  });

  it("applies rating-sm class when size is sm", () => {
    render(<Rating name="stars" size="sm" />);
    expect(screen.getByRole("group")).toHaveClass("rating-sm");
  });
});
