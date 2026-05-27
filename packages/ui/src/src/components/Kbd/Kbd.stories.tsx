import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Kbd } from "./Kbd";

const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {
  args: {
    children: "A",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kbd = canvas.getByText("A");
    await expect(kbd).toBeInTheDocument();
    await expect(kbd.tagName.toLowerCase()).toBe("kbd");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(kbd);
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Kbd size="xs">xs</Kbd>
      <Kbd size="sm">sm</Kbd>
      <Kbd size="md">md</Kbd>
      <Kbd size="lg">lg</Kbd>
    </div>
  ),
};

export const KeyCombination: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <span>+</span>
      <Kbd>C</Kbd>
    </div>
  ),
};
