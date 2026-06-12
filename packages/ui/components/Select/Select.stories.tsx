import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Select } from "./Select";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
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
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    options,
    label: "Pick a fruit",
    id: "fruit",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Pick a fruit" });

    // Select is present and has the correct role
    await expect(select).toBeInTheDocument();

    // Select is keyboard-focusable
    await userEvent.tab();
    await expect(select).toHaveFocus();

    // selectOptions is more reliable than keyboard {ArrowDown} for native
    // <select> elements: macOS Chromium opens the popup on ArrowDown rather
    // than advancing the selection inline, causing the assertion to fail.
    await userEvent.selectOptions(select, "banana");
    await expect(select).toHaveValue("banana");
  },
};

export const WithLabel: Story = {
  args: {
    options,
    label: "Pick a fruit",
    id: "fruit",
  },
};

export const Primary: Story = {
  args: {
    options,
    label: "Primary",
    variant: "primary",
  },
};

export const WithError: Story = {
  args: {
    options,
    label: "Required",
    error: "Please select an option",
  },
};

export const Disabled: Story = {
  args: {
    options,
    label: "Disabled",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Select size="xs" options={options} aria-label="Extra small select" />
      <Select size="sm" options={options} aria-label="Small select" />
      <Select size="md" options={options} aria-label="Medium select" />
      <Select size="lg" options={options} aria-label="Large select" />
    </div>
  ),
};
