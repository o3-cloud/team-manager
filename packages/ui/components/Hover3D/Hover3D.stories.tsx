import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Hover3D } from "./Hover3D";

const meta: Meta<typeof Hover3D> = {
  title: "Components/Hover3D",
  component: Hover3D,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Hover3D>;

export const Default: Story = {
  args: {
    children: (
      <figure className="max-w-100 rounded-2xl bg-base-200 p-4">Hover me for 3D effect</figure>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Hover me for 3D effect");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".hover-3d");
    await expect(wrapper).not.toBeNull();
  },
};

export const WithLink: Story = {
  args: {
    href: "https://daisyui.com",
    children: <figure className="max-w-100 rounded-2xl bg-base-200 p-4">Click this 3D card</figure>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link");
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute("href", "https://daisyui.com");
    // Anchor link is keyboard-focusable via tab
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "my-12 mx-2",
    children: (
      <figure className="max-w-100 rounded-2xl bg-base-200 p-4">Custom class 3D card</figure>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Custom class 3D card");
    await expect(content).toBeInTheDocument();
    const wrapper = canvasElement.querySelector(".hover-3d.my-12.mx-2");
    await expect(wrapper).not.toBeNull();
  },
};
