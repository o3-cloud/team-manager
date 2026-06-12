import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Fieldset } from "./Fieldset";

const meta: Meta<typeof Fieldset> = {
  title: "Components/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
  argTypes: {
    legend: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  args: {
    legend: "Account Settings",
    children: (
      <div className="flex flex-col gap-2">
        <label className="fieldset-label">
          Username
          <input type="text" className="input input-bordered" placeholder="johndoe" />
        </label>
        <label className="fieldset-label">
          Email
          <input type="email" className="input input-bordered" placeholder="john@example.com" />
        </label>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fieldset = canvas.getByRole("group");

    await expect(fieldset).toBeInTheDocument();

    const legend = canvas.getByText("Account Settings");
    await expect(legend).toBeInTheDocument();

    const inputs = canvas.getAllByRole("textbox");
    await expect(inputs).toHaveLength(2);

    const usernameInput = canvas.getByPlaceholderText("johndoe");
    // First input is keyboard-focusable via tab
    await userEvent.tab();
    await expect(usernameInput).toHaveFocus();
    await userEvent.type(usernameInput, "johndoe");
    await expect(usernameInput).toHaveValue("johndoe");
  },
};

export const WithoutLegend: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-2">
        <label className="fieldset-label">
          Password
          <input type="password" className="input input-bordered" placeholder="••••••••" />
        </label>
        <label className="fieldset-label">
          Confirm Password
          <input type="password" className="input input-bordered" placeholder="••••••••" />
        </label>
      </div>
    ),
  },
};

export const WithHelperText: Story = {
  render: () => (
    <Fieldset legend="Profile">
      <label className="fieldset-label" htmlFor="display-name">
        Display Name
      </label>
      <input
        id="display-name"
        type="text"
        className="input input-bordered w-full"
        placeholder="Your name"
      />
      <p className="fieldset-label text-xs">This is shown publicly on your profile.</p>
    </Fieldset>
  ),
};
