import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
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
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    label: "Accept terms",
    id: "terms",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox");

    // Checkbox is present in the document
    await expect(checkbox).toBeInTheDocument();

    // Checkbox is keyboard-focusable
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    // Space key toggles the checkbox
    await userEvent.keyboard(" ");
    await expect(checkbox).toBeChecked();

    // Space key unchecks the checkbox
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

export const WithLabel: Story = {
  args: {
    label: "Accept terms and conditions",
    id: "terms",
  },
};

export const Primary: Story = {
  args: {
    label: "Primary",
    variant: "primary",
  },
};

export const Checked: Story = {
  args: {
    label: "Checked by default",
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
          <Checkbox key={v} label={v} variant={v} />
        )
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Checkbox size="xs" label="xs" />
      <Checkbox size="sm" label="sm" />
      <Checkbox size="md" label="md" />
      <Checkbox size="lg" label="lg" />
    </div>
  ),
};
