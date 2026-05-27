import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { FloatingLabel, Label } from "./Label";

const meta: Meta = {
  title: "Components/Label",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="username">Username</Label>
      <input id="username" type="text" className="input input-bordered" placeholder="johndoe" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText("Username");
    await expect(label).toBeInTheDocument();
    const input = canvas.getByRole("textbox");
    await expect(input).toBeInTheDocument();
    await userEvent.click(label);
    await expect(input).toHaveFocus();
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <div>
        <Label htmlFor="email">Email address</Label>
        <input id="email" type="email" className="input input-bordered w-full" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <input id="password" type="password" className="input input-bordered w-full" />
      </div>
    </div>
  ),
};

export const FloatingLabelDemo: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <FloatingLabel>
        <input type="text" placeholder=" " className="input input-bordered w-full" />
        <span>Name</span>
      </FloatingLabel>
      <FloatingLabel>
        <input type="email" placeholder=" " className="input input-bordered w-full" />
        <span>Email</span>
      </FloatingLabel>
    </div>
  ),
};

export const InputAddon: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-72">
      <div className="input input-bordered flex items-center gap-0">
        <span className="label">https://</span>
        <input type="text" placeholder="yoursite.com" className="grow" aria-label="Website URL" />
      </div>
      <div className="input input-bordered flex items-center gap-0">
        <input type="text" placeholder="username" className="grow" aria-label="Username" />
        <span className="label">@example.com</span>
      </div>
    </div>
  ),
};
