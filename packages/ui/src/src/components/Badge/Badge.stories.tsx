import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "ghost", "info", "success", "warning", "error"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: {
    children: "Badge",
    variant: "primary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveClass("badge-primary");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(badge);
  },
};

export const Secondary: Story = {
  args: {
    children: "Badge",
    variant: "secondary",
  },
};

export const Success: Story = {
  args: {
    children: "New",
    variant: "success",
  },
};

export const ErrorVariant: Story = {
  name: "Error",
  args: {
    children: "Error",
    variant: "error",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "primary",
    outline: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="xs">XS</Badge>
      <Badge size="sm">SM</Badge>
      <Badge size="md">MD</Badge>
      <Badge size="lg">LG</Badge>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(
        ["primary", "secondary", "accent", "ghost", "info", "success", "warning", "error"] as const
      ).map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  ),
};
