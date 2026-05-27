import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "../Button/Button";
import { Join } from "./Join";

const meta: Meta<typeof Join> = {
  title: "Layout/Join",
  component: Join,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Join>;

export const HorizontalButtons: Story = {
  render: () => (
    <Join>
      <Button variant="primary">Left</Button>
      <Button variant="primary">Center</Button>
      <Button variant="primary">Right</Button>
    </Join>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leftButton = canvas.getByRole("button", { name: "Left" });
    await expect(leftButton).toBeInTheDocument();
    const centerButton = canvas.getByRole("button", { name: "Center" });
    await expect(centerButton).toBeInTheDocument();
    await userEvent.tab();
    await expect(leftButton).toHaveFocus();
  },
};

export const VerticalButtons: Story = {
  render: () => (
    <Join vertical>
      <Button variant="primary">Top</Button>
      <Button variant="primary">Middle</Button>
      <Button variant="primary">Bottom</Button>
    </Join>
  ),
};

export const InputWithButton: Story = {
  render: () => (
    <Join>
      <input className="input input-bordered join-item" placeholder="Email" />
      <Button variant="primary">Subscribe</Button>
    </Join>
  ),
};

export const RadioGroup: Story = {
  render: () => (
    <Join>
      <input
        className="join-item btn"
        type="radio"
        name="options"
        aria-label="Radio 1"
        defaultChecked
      />
      <input className="join-item btn" type="radio" name="options" aria-label="Radio 2" />
      <input className="join-item btn" type="radio" name="options" aria-label="Radio 3" />
    </Join>
  ),
};
