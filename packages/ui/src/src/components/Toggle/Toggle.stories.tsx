import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Components/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {
    "aria-label": "Toggle feature",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("checkbox");

    await expect(toggle).toBeInTheDocument();

    await userEvent.tab();
    await expect(toggle).toHaveFocus();

    await userEvent.keyboard(" ");
    await expect(toggle).toBeChecked();

    await userEvent.keyboard(" ");
    await expect(toggle).not.toBeChecked();
  },
};

export const WithLabel: Story = {
  args: {
    label: "Enable notifications",
    id: "notif",
  },
};

export const Primary: Story = {
  args: {
    label: "Primary toggle",
    variant: "primary",
  },
};

export const Checked: Story = {
  args: {
    label: "On by default",
    checked: true,
    onChange: () => undefined,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["primary", "secondary", "accent", "info", "success", "warning", "error"] as const).map(
        (v) => (
          <Toggle key={v} label={v} variant={v} />
        )
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Toggle size="xs" label="xs" />
      <Toggle size="sm" label="sm" />
      <Toggle size="md" label="md" />
      <Toggle size="lg" label="lg" />
    </div>
  ),
};
