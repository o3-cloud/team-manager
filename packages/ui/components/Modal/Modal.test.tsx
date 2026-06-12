
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "./Modal";

afterEach(cleanup);

describe("Modal", () => {
  it("exports Modal component", () => {
    expect(Modal).toBeDefined();
    expect(typeof Modal).toBe("function");
  });

  it("renders children when open", () => {
    render(<Modal open>Modal content</Modal>);
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(
      <Modal open title="My Dialog">
        Content
      </Modal>
    );
    expect(screen.getByText("My Dialog")).toBeInTheDocument();
  });

  it("does not render children when closed", () => {
    render(<Modal open={false}>Hidden content</Modal>);
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();
  });

  it("has modal class on dialog element", () => {
    const { container } = render(<Modal open>Content</Modal>);
    expect(container.querySelector("dialog")).toHaveClass("modal");
  });

  it("has modal-open class on dialog when open", () => {
    const { container } = render(<Modal open>Content</Modal>);
    expect(container.querySelector("dialog")).toHaveClass("modal-open");
  });

  it("renders close button when onClose is provided", () => {
    render(
      <Modal
        open
        onClose={() => {
          /* no-op */
        }}
      >
        Content
      </Modal>
    );
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn(() => undefined);
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn(() => undefined);
    const { container } = render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    );
    const backdrop = container.querySelector(".modal-backdrop");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
