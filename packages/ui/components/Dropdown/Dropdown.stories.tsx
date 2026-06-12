import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Menu } from "../Menu/Menu";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: "select",
      options: ["start", "end"],
    },
    hover: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const menuItems = [{ label: "Profile" }, { label: "Settings" }, { label: "Logout" }];

export const Default: Story = {
  args: {
    trigger: (
      <button type="button" className="btn btn-primary">
        Open Menu
      </button>
    ),
    children: <Menu items={menuItems} className="bg-base-100 w-52 p-2 rounded-box shadow" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open Menu" });
    await expect(trigger).toBeInTheDocument();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
  },
};

export const AlignEnd: Story = {
  args: {
    align: "end",
    trigger: (
      <button type="button" className="btn btn-primary">
        Align End
      </button>
    ),
    children: <Menu items={menuItems} className="bg-base-100 w-52 p-2 rounded-box shadow" />,
  },
};

export const PositionTop: Story = {
  args: {
    position: "top",
    trigger: (
      <button type="button" className="btn btn-primary">
        Open Up
      </button>
    ),
    children: <Menu items={menuItems} className="bg-base-100 w-52 p-2 rounded-box shadow" />,
  },
};

export const HoverMode: Story = {
  args: {
    hover: true,
    trigger: (
      <button type="button" className="btn btn-secondary">
        Hover Me
      </button>
    ),
    children: <Menu items={menuItems} className="bg-base-100 w-52 p-2 rounded-box shadow" />,
  },
};

export const WithTextContent: Story = {
  args: {
    trigger: (
      <button type="button" className="btn btn-accent">
        More Info
      </button>
    ),
    children: (
      <div className="bg-base-100 rounded-box shadow-sm p-4 w-64">
        <h3 className="font-bold text-lg">Info</h3>
        <p className="py-2 text-sm">This dropdown contains arbitrary content, not just menus.</p>
      </div>
    ),
  },
};
