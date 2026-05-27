import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MockupWindow } from "./MockupWindow";

const meta: Meta<typeof MockupWindow> = {
  title: "Components/MockupWindow",
  component: MockupWindow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockupWindow>;

export const Default: Story = {
  args: {
    children: <p className="p-4">Hello from inside the window!</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Hello from inside the window!");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-window");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-bold">Window Title</h2>
        <p>This is richer content inside the mockup window.</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText("Window Title");
    await expect(heading).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-window");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(heading);
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "border border-base-300 bg-base-100",
    children: <p className="p-4">Window with custom class applied</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Window with custom class applied");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(
      ".mockup-window.border.border-base-300.bg-base-100"
    );
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};
