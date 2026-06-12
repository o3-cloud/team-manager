
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { HoverGallery } from "./HoverGallery";

afterEach(cleanup);

const testImages = [
  { src: "https://example.com/img1.jpg", alt: "Image 1" },
  { src: "https://example.com/img2.jpg", alt: "Image 2" },
  { src: "https://example.com/img3.jpg", alt: "Image 3" },
];

describe("HoverGallery", () => {
  it("exports HoverGallery component", () => {
    expect(HoverGallery).toBeDefined();
    expect(typeof HoverGallery).toBe("function");
  });

  it("renders correct number of images", () => {
    render(<HoverGallery images={testImages} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(3);
  });

  it("applies hover-gallery class to the root element", () => {
    const { container } = render(<HoverGallery images={testImages} />);
    expect(container.firstChild).toHaveClass("hover-gallery");
  });

  it("renders as <figure> by default", () => {
    const { container } = render(<HoverGallery images={testImages} />);
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("figure");
  });

  it("renders as <div> when as='div' is passed", () => {
    const { container } = render(<HoverGallery images={testImages} as="div" />);
    expect(container.firstChild?.nodeName.toLowerCase()).toBe("div");
  });

  it("applies default max-width class max-w-60", () => {
    const { container } = render(<HoverGallery images={testImages} />);
    expect(container.firstChild).toHaveClass("max-w-60");
  });

  it("applies custom maxWidth class when provided", () => {
    const { container } = render(<HoverGallery images={testImages} maxWidth="max-w-96" />);
    expect(container.firstChild).toHaveClass("max-w-96");
    expect(container.firstChild).not.toHaveClass("max-w-60");
  });

  it("only renders first 10 images when more than 10 are provided", () => {
    const manyImages = Array.from({ length: 13 }, (_, i) => ({
      src: `https://example.com/img${String(i + 1)}.jpg`,
      alt: `Image ${String(i + 1)}`,
    }));
    render(<HoverGallery images={manyImages} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(10);
  });

  it("images have correct src attributes", () => {
    render(<HoverGallery images={testImages} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]).toHaveAttribute("src", "https://example.com/img1.jpg");
    expect(imgs[1]).toHaveAttribute("src", "https://example.com/img2.jpg");
    expect(imgs[2]).toHaveAttribute("src", "https://example.com/img3.jpg");
  });
});
