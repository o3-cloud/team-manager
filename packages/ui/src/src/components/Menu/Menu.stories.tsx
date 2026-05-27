import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Menu } from "./Menu";

const meta: Meta<typeof Menu> = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
    direction: {
      control: "select",
      options: ["vertical", "horizontal"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

const defaultItems = [{ label: "Item 1" }, { label: "Item 2" }, { label: "Item 3" }];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    await expect(list).toBeInTheDocument();
    const firstLink = canvas.getByRole("link", { name: "Item 1" });
    await expect(firstLink).toBeInTheDocument();
    await userEvent.tab();
    await expect(firstLink).toHaveFocus();
  },
};

export const WithActiveItem: Story = {
  args: {
    items: [{ label: "Home", active: true }, { label: "About" }, { label: "Contact" }],
  },
};

export const WithDisabledItem: Story = {
  args: {
    items: [
      { label: "Available" },
      { label: "Disabled", disabled: true },
      { label: "Also Available" },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    items: defaultItems,
    direction: "horizontal",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold mb-1">XS</p>
        <Menu items={defaultItems} size="xs" />
      </div>
      <div>
        <p className="text-sm font-bold mb-1">SM</p>
        <Menu items={defaultItems} size="sm" />
      </div>
      <div>
        <p className="text-sm font-bold mb-1">MD (default)</p>
        <Menu items={defaultItems} size="md" />
      </div>
      <div>
        <p className="text-sm font-bold mb-1">LG</p>
        <Menu items={defaultItems} size="lg" />
      </div>
    </div>
  ),
};

export const WithLinks: Story = {
  args: {
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Profile", href: "/profile" },
    ],
  },
};
