import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    "aria-label": "breadcrumb",
    items: [
      { label: "Home", href: "/" },
      { label: "Documents", href: "/documents" },
      { label: "Add Document" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "breadcrumb" });
    await expect(nav).toBeInTheDocument();
    const links = canvas.getAllByRole("link");
    await expect(links).toHaveLength(2);
    await expect(links[0]).toHaveTextContent("Home");
    await expect(links[1]).toHaveTextContent("Documents");
    await expect(canvas.getByText("Add Document")).toBeInTheDocument();
    await userEvent.tab();
    await expect(links[0]).toHaveFocus();
    await userEvent.tab();
    await expect(links[1]).toHaveFocus();
  },
};

export const WithLinks: Story = {
  args: {
    "aria-label": "breadcrumb",
    items: [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Breadcrumbs", href: "/components/breadcrumbs" },
    ],
  },
};

export const SingleItem: Story = {
  args: {
    "aria-label": "breadcrumb",
    items: [{ label: "Home" }],
  },
};

export const LongPath: Story = {
  args: {
    "aria-label": "breadcrumb",
    items: [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category" },
      { label: "Subcategory", href: "/category/sub" },
      { label: "Item", href: "/category/sub/item" },
      { label: "Detail" },
    ],
  },
};
