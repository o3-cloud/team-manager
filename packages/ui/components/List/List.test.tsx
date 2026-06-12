
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { List, ListCol, ListRow } from "./List";

afterEach(cleanup);

describe("List", () => {
  it("exports List, ListRow, ListCol components", () => {
    expect(List).toBeDefined();
    expect(ListRow).toBeDefined();
    expect(ListCol).toBeDefined();
  });

  it("renders a div with list class", () => {
    const { container } = render(<List>content</List>);
    expect(container.querySelector(".list")).toBeInTheDocument();
  });

  it("renders children inside the list", () => {
    const { getByText } = render(<List>Hello</List>);
    expect(getByText("Hello")).toBeInTheDocument();
  });
});

describe("ListRow", () => {
  it("renders a div with list-row class", () => {
    const { container } = render(<ListRow>row content</ListRow>);
    expect(container.querySelector(".list-row")).toBeInTheDocument();
  });

  it("renders children inside the row", () => {
    const { getByText } = render(<ListRow>Row item</ListRow>);
    expect(getByText("Row item")).toBeInTheDocument();
  });
});

describe("ListCol", () => {
  it("renders children", () => {
    const { getByText } = render(<ListCol>col content</ListCol>);
    expect(getByText("col content")).toBeInTheDocument();
  });

  it("applies list-col-grow class when grow is true", () => {
    const { container } = render(<ListCol grow>col</ListCol>);
    expect(container.firstChild).toHaveClass("list-col-grow");
  });

  it("does not apply list-col-grow class by default", () => {
    const { container } = render(<ListCol>col</ListCol>);
    expect(container.firstChild).not.toHaveClass("list-col-grow");
  });

  it("applies list-col-wrap class when wrap is true", () => {
    const { container } = render(<ListCol wrap>col</ListCol>);
    expect(container.firstChild).toHaveClass("list-col-wrap");
  });

  it("can combine grow and wrap", () => {
    const { container } = render(
      <ListCol grow wrap>
        col
      </ListCol>
    );
    expect(container.firstChild).toHaveClass("list-col-grow");
    expect(container.firstChild).toHaveClass("list-col-wrap");
  });
});

describe("List composition", () => {
  it("renders a full list with rows and cols", () => {
    const { container } = render(
      <List>
        <ListRow>
          <ListCol>A</ListCol>
          <ListCol grow>B</ListCol>
        </ListRow>
        <ListRow>
          <ListCol>C</ListCol>
          <ListCol grow>D</ListCol>
        </ListRow>
      </List>
    );
    expect(container.querySelectorAll(".list-row")).toHaveLength(2);
    expect(container.querySelectorAll(".list-col-grow")).toHaveLength(2);
  });
});
