import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
    value: { control: { type: "range", min: 0, max: 100 } },
    max: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Primary: Story = {
  args: {
    variant: "primary",
    value: 40,
    max: 100,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeInTheDocument();
    await expect(progressbar).toHaveAttribute("value", "40");
    await expect(progressbar).toHaveAttribute("max", "100");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(progressbar);
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    value: 75,
    max: 100,
  },
};

export const Indeterminate: Story = {
  args: {
    variant: "primary",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      {(["primary", "secondary", "accent", "info", "success", "warning", "error"] as const).map(
        (v) => (
          <Progress key={v} variant={v} value={50} max={100} />
        )
      )}
    </div>
  ),
};
