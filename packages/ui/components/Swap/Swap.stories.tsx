import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Swap } from "./Swap";

const meta: Meta<typeof Swap> = {
  title: "Components/Swap",
  component: Swap,
  tags: ["autodocs"],
  argTypes: {
    effect: {
      control: "select",
      options: [undefined, "rotate", "flip"],
    },
    active: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Swap>;

export const Default: Story = {
  args: {
    onContent: "ON",
    offContent: "OFF",
    active: false,
    "aria-label": "Toggle content",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Swap renders a <label> wrapping a hidden checkbox
    const checkbox = canvas.getByRole("checkbox");
    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();
    // Checkbox is keyboard-focusable via tab
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    // The off content should be visible in the DOM
    const offContent = canvas.getByText("OFF");
    await expect(offContent).toBeInTheDocument();
  },
};

export const Active: Story = {
  args: {
    onContent: "ON",
    offContent: "OFF",
    active: true,
  },
};

export const RotateEffect: Story = {
  args: {
    onContent: "🌞",
    offContent: "🌚",
    effect: "rotate",
    active: false,
  },
};

export const FlipEffect: Story = {
  args: {
    onContent: "👍",
    offContent: "👎",
    effect: "flip",
    active: false,
  },
};

export const IconToggle: Story = {
  args: {
    "aria-label": "Toggle menu",
    onContent: (
      <svg
        className="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    offContent: (
      <svg
        className="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    ),
    effect: "rotate",
  },
};
