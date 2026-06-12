import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Countdown } from "./Countdown";

const meta: Meta<typeof Countdown> = {
  title: "Components/Countdown",
  component: Countdown,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Countdown>;

export const Default: Story = {
  args: {
    hours: 10,
    minutes: 24,
    seconds: 0,
    "aria-label": "Countdown timer",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Countdown container is identified by its aria-label
    const container = canvas.getByLabelText("Countdown timer");
    await expect(container).toBeInTheDocument();
    // Three countdown segments rendered as children (hours, minutes, seconds)
    await expect(container.children).toHaveLength(3);
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(container);
    await expect(container).toBeInTheDocument();
  },
};

export const WithLabels: Story = {
  args: {
    hours: 10,
    minutes: 24,
    seconds: 0,
    showLabels: true,
  },
};

export const SecondsOnly: Story = {
  args: {
    seconds: 59,
    showLabels: true,
  },
};

export const FullTimer: Story = {
  args: {
    hours: 1,
    minutes: 30,
    seconds: 45,
    showLabels: true,
  },
};
