
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Carousel } from "./Carousel";

afterEach(cleanup);

describe("Carousel", () => {
  const items = [
    { id: "slide1", children: <img src="https://example.com/1.jpg" alt="Slide 1" /> },
    { id: "slide2", children: <img src="https://example.com/2.jpg" alt="Slide 2" /> },
    { id: "slide3", children: <img src="https://example.com/3.jpg" alt="Slide 3" /> },
  ];

  it("exports Carousel component", () => {
    expect(Carousel).toBeDefined();
    expect(typeof Carousel).toBe("function");
  });

  it("renders carousel items", () => {
    render(<Carousel items={items} />);
    expect(screen.getByAltText("Slide 1")).toBeInTheDocument();
    expect(screen.getByAltText("Slide 2")).toBeInTheDocument();
    expect(screen.getByAltText("Slide 3")).toBeInTheDocument();
  });

  it("applies carousel class", () => {
    const { container } = render(<Carousel items={items} />);
    expect(container.firstChild).toHaveClass("carousel");
  });

  it("applies carousel-item class to each item", () => {
    const { container } = render(<Carousel items={items} />);
    const carouselItems = container.querySelectorAll(".carousel-item");
    expect(carouselItems.length).toBe(3);
  });

  it("applies carousel-vertical class when direction is vertical", () => {
    const { container } = render(<Carousel items={items} direction="vertical" />);
    expect(container.firstChild).toHaveClass("carousel-vertical");
  });

  it("renders correct number of items", () => {
    const { container } = render(<Carousel items={items} />);
    const carouselItems = container.querySelectorAll(".carousel-item");
    expect(carouselItems.length).toBe(items.length);
  });

  it("renders item id when provided", () => {
    const { container } = render(<Carousel items={items} />);
    expect(container.querySelector("#slide1")).toBeInTheDocument();
    expect(container.querySelector("#slide2")).toBeInTheDocument();
    expect(container.querySelector("#slide3")).toBeInTheDocument();
  });
});
