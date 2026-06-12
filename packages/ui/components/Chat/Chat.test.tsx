
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Chat } from "./Chat";

afterEach(cleanup);

describe("Chat", () => {
  it("exports Chat component", () => {
    expect(Chat).toBeDefined();
    expect(typeof Chat).toBe("function");
  });

  it("renders message text", () => {
    render(<Chat message="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("applies chat-start class by default", () => {
    const { container } = render(<Chat message="Hi" />);
    expect(container.firstChild).toHaveClass("chat-start");
  });

  it("applies chat-end class when side is end", () => {
    const { container } = render(<Chat message="Hi" side="end" />);
    expect(container.firstChild).toHaveClass("chat-end");
  });

  it("renders avatar when avatarSrc provided", () => {
    render(<Chat message="Hi" avatarSrc="avatar.png" avatarAlt="User" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "avatar.png");
  });

  it("does not render avatar when avatarSrc not provided", () => {
    render(<Chat message="Hi" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders header when header provided", () => {
    render(<Chat message="Hi" header="Alice" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders footer when footer provided", () => {
    render(<Chat message="Hi" footer="Delivered" />);
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("applies bubble variant class when bubbleVariant provided", () => {
    const { container } = render(<Chat message="Hi" bubbleVariant="primary" />);
    const bubble = container.querySelector(".chat-bubble");
    expect(bubble).not.toBeNull();
    expect(bubble).toHaveClass("chat-bubble-primary");
  });
});
