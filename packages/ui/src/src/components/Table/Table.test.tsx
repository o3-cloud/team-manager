
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Table } from "./Table";

afterEach(cleanup);

describe("Table", () => {
  const columns = [
    { key: "name", header: "Name" },
    { key: "job", header: "Job" },
    { key: "company", header: "Company" },
  ];

  const rows = [
    { name: "Cy Ganderton", job: "Quality Control", company: "Littel, Schaden and Vandervort" },
    { name: "Hart Hagerty", job: "Desktop Support", company: "Zemlak, Daniel and Leannon" },
    { name: "Brice Swyre", job: "Tax Accountant", company: "Carroll Group" },
  ];

  it("exports Table component", () => {
    expect(Table).toBeDefined();
    expect(typeof Table).toBe("function");
  });

  it("renders table headers", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Job")).toBeInTheDocument();
    expect(screen.getByText("Company")).toBeInTheDocument();
  });

  it("renders table rows", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText("Cy Ganderton")).toBeInTheDocument();
    expect(screen.getByText("Hart Hagerty")).toBeInTheDocument();
    expect(screen.getByText("Brice Swyre")).toBeInTheDocument();
  });

  it("renders correct cell content", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText("Quality Control")).toBeInTheDocument();
    expect(screen.getByText("Desktop Support")).toBeInTheDocument();
    expect(screen.getByText("Tax Accountant")).toBeInTheDocument();
  });

  it("applies table class", () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    expect(container.querySelector("table")).toHaveClass("table");
  });

  it("applies table-zebra class when zebra prop is true", () => {
    const { container } = render(<Table columns={columns} rows={rows} zebra />);
    expect(container.querySelector("table")).toHaveClass("table-zebra");
  });

  it("applies table-pin-rows class when pinRows prop is true", () => {
    const { container } = render(<Table columns={columns} rows={rows} pinRows />);
    expect(container.querySelector("table")).toHaveClass("table-pin-rows");
  });

  it("applies size class when size prop provided", () => {
    const { container } = render(<Table columns={columns} rows={rows} size="sm" />);
    expect(container.querySelector("table")).toHaveClass("table-sm");
  });

  it("renders correct number of rows", () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    const bodyRows = container.querySelectorAll("tbody tr");
    expect(bodyRows.length).toBe(3);
  });

  it("renders correct number of columns", () => {
    const { container } = render(<Table columns={columns} rows={rows} />);
    const headerCells = container.querySelectorAll("thead th");
    expect(headerCells.length).toBe(3);
  });
});
