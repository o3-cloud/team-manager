
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert", () => {
  it("exports Alert component", () => {
    expect(Alert).toBeDefined();
    expect(typeof Alert).toBe("function");
  });

  it("renders children text", () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something happened");
  });

  it("applies info variant class by default", () => {
    render(<Alert>Info</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-info");
  });

  it("applies success variant class", () => {
    render(<Alert variant="success">Done</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-success");
  });

  it("applies warning variant class", () => {
    render(<Alert variant="warning">Watch out</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-warning");
  });

  it("applies error variant class", () => {
    render(<Alert variant="error">Broken</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-error");
  });

  it("renders dismiss button when onDismiss is provided", () => {
    render(
      <Alert
        onDismiss={() => {
          /* no-op */
        }}
      >
        Close me
      </Alert>
    );
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });

  it("does not render dismiss button without onDismiss", () => {
    render(<Alert>No close</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", () => {
    const onDismiss = vi.fn(() => undefined);
    render(<Alert onDismiss={onDismiss}>Dismiss me</Alert>);
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
