import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MockupFrame } from "./MockupFrame";

const meta: Meta<typeof MockupFrame> = {
  title: "Components/MockupFrame",
  component: MockupFrame,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockupFrame>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex h-full items-center justify-center bg-base-200 p-4">
        Phone display content
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Phone display content");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-phone");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "border-primary border-4",
    children: (
      <div className="flex h-full items-center justify-center bg-base-200 p-4">
        Custom class frame
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Custom class frame");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-phone.border-primary.border-4");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};
