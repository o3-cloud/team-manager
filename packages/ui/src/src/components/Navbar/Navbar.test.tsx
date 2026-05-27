
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

afterEach(cleanup);

describe("Navbar", () => {
  it("exports Navbar component", () => {
    expect(Navbar).toBeDefined();
    expect(typeof Navbar).toBe("function");
  });

  it("applies navbar class", () => {
    const { container } = render(<Navbar />);
    expect(container.firstChild).toHaveClass("navbar");
  });

  it("renders start content", () => {
    render(<Navbar start={<span>Brand</span>} />);
    expect(screen.getByText("Brand")).toBeInTheDocument();
  });

  it("renders center content", () => {
    render(<Navbar center={<span>Title</span>} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders end content", () => {
    render(<Navbar end={<span>Actions</span>} />);
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("applies navbar-start class to start section", () => {
    const { container } = render(<Navbar start={<span>Brand</span>} />);
    const startDiv = container.querySelector(".navbar-start");
    expect(startDiv).toBeInTheDocument();
  });

  it("applies navbar-center class to center section", () => {
    const { container } = render(<Navbar center={<span>Nav</span>} />);
    const centerDiv = container.querySelector(".navbar-center");
    expect(centerDiv).toBeInTheDocument();
  });

  it("applies navbar-end class to end section", () => {
    const { container } = render(<Navbar end={<span>Actions</span>} />);
    const endDiv = container.querySelector(".navbar-end");
    expect(endDiv).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Navbar className="bg-base-100" />);
    expect(container.firstChild).toHaveClass("bg-base-100");
  });

  it("renders all three sections together", () => {
    render(
      <Navbar start={<span>Start</span>} center={<span>Center</span>} end={<span>End</span>} />
    );
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Center")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });
});
