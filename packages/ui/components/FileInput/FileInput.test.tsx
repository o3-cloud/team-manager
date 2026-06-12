
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FileInput } from "./FileInput";

afterEach(cleanup);

describe("FileInput", () => {
  it("exports FileInput component", () => {
    expect(FileInput).toBeDefined();
    expect(typeof FileInput).toBe("function");
  });

  it("renders a file input", () => {
    render(<FileInput />);
    // file inputs don't have a standard role, query by type
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("applies base file-input classes", () => {
    render(<FileInput />);
    const input = document.querySelector<HTMLElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toHaveClass("file-input");
    expect(input).toHaveClass("file-input-bordered");
  });

  it("applies primary variant class", () => {
    render(<FileInput variant="primary" />);
    const input = document.querySelector<HTMLElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toHaveClass("file-input-primary");
  });

  it("applies size class", () => {
    render(<FileInput size="lg" />);
    const input = document.querySelector<HTMLElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toHaveClass("file-input-lg");
  });

  it("applies xs size class", () => {
    render(<FileInput size="xs" />);
    const input = document.querySelector<HTMLElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toHaveClass("file-input-xs");
  });

  it("is disabled when disabled prop is true", () => {
    render(<FileInput disabled />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toBeDisabled();
  });

  it("renders a label when label prop is provided", () => {
    render(<FileInput label="Upload file" />);
    expect(screen.getByText("Upload file")).toBeInTheDocument();
  });

  it("associates label with file input via htmlFor", () => {
    render(<FileInput label="Upload file" id="upload" />);
    const label = screen.getByText("Upload file").closest("label");
    expect(label?.getAttribute("for")).toBe("upload");
  });

  it("passes accept prop to input", () => {
    render(<FileInput accept="image/*" />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error("Expected file input element");
    expect(input).toHaveAttribute("accept", "image/*");
  });
});
