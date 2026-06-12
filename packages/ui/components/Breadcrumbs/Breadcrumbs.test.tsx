
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Breadcrumbs } from "./Breadcrumbs";

afterEach(cleanup);

describe("Breadcrumbs", () => {
  const items = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Components" },
  ];

  it("exports Breadcrumbs component", () => {
    expect(Breadcrumbs).toBeDefined();
    expect(typeof Breadcrumbs).toBe("function");
  });

  it("renders all breadcrumb labels", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
  });

  it("applies breadcrumbs class", () => {
    const { container } = render(<Breadcrumbs items={items} />);
    expect(container.firstChild).toHaveClass("breadcrumbs");
  });

  it("renders linked items as anchor elements", () => {
    render(<Breadcrumbs items={items} />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders last item without link when no href", () => {
    render(<Breadcrumbs items={items} />);
    const lastItem = screen.getByText("Components");
    expect(lastItem.tagName).not.toBe("A");
  });

  it("applies custom className", () => {
    const { container } = render(<Breadcrumbs items={items} className="my-custom" />);
    expect(container.firstChild).toHaveClass("my-custom");
  });

  it("renders as nav landmark", () => {
    render(<Breadcrumbs items={items} aria-label="breadcrumb" />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders single item", () => {
    render(<Breadcrumbs items={[{ label: "Home" }]} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
