import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
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
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
    variant: "primary",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    // Button has an accessible name and correct role
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute("type", "button");

    // Button is keyboard-focusable
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Enter key activates the button
    await userEvent.keyboard("{Enter}");

    // Space key activates the button
    await userEvent.keyboard(" ");
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    variant: "secondary",
  },
};

export const Accent: Story = {
  args: {
    children: "Button",
    variant: "accent",
  },
};

export const Ghost: Story = {
  args: {
    children: "Button",
    variant: "ghost",
  },
};

export const Disabled: Story = {
  args: {
    children: "Button",
    variant: "primary",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    // Disabled button has correct ARIA attributes
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-disabled", "true");

    // Disabled button is not focusable via Tab
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All size variants have accessible names
    await expect(canvas.getByRole("button", { name: "XS" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "SM" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "MD" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "LG" })).toBeInTheDocument();
  },
};
