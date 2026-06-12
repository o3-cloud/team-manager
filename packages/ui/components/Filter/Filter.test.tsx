
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Filter, FilterReset } from "./Filter";

afterEach(cleanup);

describe("Filter", () => {
  it("exports Filter and FilterReset components", () => {
    expect(Filter).toBeDefined();
    expect(FilterReset).toBeDefined();
  });

  it("renders a div with filter class", () => {
    const { container } = render(<Filter>content</Filter>);
    expect(container.querySelector(".filter")).toBeInTheDocument();
  });

  it("renders children inside the filter", () => {
    const { getByText } = render(
      <Filter>
        <span>tag item</span>
      </Filter>
    );
    expect(getByText("tag item")).toBeInTheDocument();
  });
});

describe("FilterReset", () => {
  it("renders an input with filter-reset class", () => {
    const { container } = render(<FilterReset name="category" aria-label="Reset filter" />);
    const input = container.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass("filter-reset");
  });

  it("renders a radio input type", () => {
    const { container } = render(<FilterReset name="category" aria-label="Reset" />);
    expect(container.querySelector("input")).toHaveAttribute("type", "radio");
  });

  it("sets the name attribute", () => {
    const { container } = render(<FilterReset name="category" aria-label="Reset" />);
    expect(container.querySelector("input")).toHaveAttribute("name", "category");
  });

  it("passes aria-label", () => {
    const { container } = render(<FilterReset name="tag" aria-label="Clear filter" />);
    expect(container.querySelector("input")).toHaveAttribute("aria-label", "Clear filter");
  });
});

describe("Filter composition", () => {
  it("renders radio inputs as filter options", () => {
    const { container } = render(
      <Filter>
        <FilterReset name="color" aria-label="Reset" />
        <input type="radio" name="color" className="btn" aria-label="Red" value="red" />
        <input type="radio" name="color" className="btn" aria-label="Blue" value="blue" />
      </Filter>
    );
    expect(container.querySelectorAll("input[type=radio]")).toHaveLength(3);
  });
});
