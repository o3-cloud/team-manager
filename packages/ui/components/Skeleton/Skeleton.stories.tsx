import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: "200px",
    height: "20px",
    "aria-label": "Loading content",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole("img", { name: "Loading content" });
    await expect(skeleton).toBeInTheDocument();
    await expect(skeleton).toHaveStyle({ width: "200px", height: "20px" });
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(skeleton);
    await expect(skeleton).toBeInTheDocument();
  },
};

export const Circle: Story = {
  args: {
    width: "64px",
    height: "64px",
    className: "rounded-full",
  },
};

export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <Skeleton width="64px" height="64px" className="rounded-full" />
      <Skeleton width="100%" height="16px" />
      <Skeleton width="80%" height="16px" />
      <Skeleton width="90%" height="16px" />
    </div>
  ),
};
