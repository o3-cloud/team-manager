import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MockupPhone } from "./MockupPhone";

const meta: Meta<typeof MockupPhone> = {
  title: "Components/MockupPhone",
  component: MockupPhone,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockupPhone>;

export const Default: Story = {
  args: {
    children: <div className="p-4 text-center">Hello, Phone!</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Hello, Phone!");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-phone");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};

export const WithContent: Story = {
  args: {
    children: (
      <div className="card bg-base-200 m-4 p-4 shadow">
        <h2 className="card-title">App Screen</h2>
        <p>This is a richer card inside the phone mockup.</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("App Screen");
    await expect(title).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-phone");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(title);
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "my-8 mx-auto",
    children: <div className="p-4 text-center">Custom class phone</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Custom class phone");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".mockup-phone.my-8.mx-auto");
    await expect(wrapper).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};
