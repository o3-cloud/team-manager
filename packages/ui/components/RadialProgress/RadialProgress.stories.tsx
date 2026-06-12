import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { RadialProgress } from "./RadialProgress";

const meta: Meta<typeof RadialProgress> = {
  title: "Components/RadialProgress",
  component: RadialProgress,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "text" },
    thickness: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof RadialProgress>;

export const Default: Story = {
  args: {
    value: 70,
    "aria-label": "70% complete",
    children: "70%",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar", { name: "70% complete" });
    await expect(progressbar).toBeInTheDocument();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "70");
    await userEvent.tab();
    await expect(progressbar).toHaveFocus();
  },
};

export const WithLabel: Story = {
  args: {
    value: 45,
    "aria-label": "45% complete",
    children: "45%",
  },
};

export const CustomSize: Story = {
  args: {
    value: 60,
    size: "8rem",
    "aria-label": "60% complete",
    children: "60%",
  },
};

export const CustomThickness: Story = {
  args: {
    value: 80,
    thickness: "1rem",
    "aria-label": "80% complete",
    children: "80%",
  },
};

export const VariousValues: Story = {
  render: () => (
    <div className="flex items-center gap-6 flex-wrap">
      {[0, 25, 50, 75, 100].map((value) => (
        <RadialProgress key={value} value={value} aria-label={`${String(value)}% complete`}>
          {value}%
        </RadialProgress>
      ))}
    </div>
  ),
};
