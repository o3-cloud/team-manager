import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
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
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    name: "demo",
    value: "a",
    label: "Option A",
    id: "opt-a",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole("radio", { name: "Option A" });

    // Radio button is present and has the correct role
    await expect(radio).toBeInTheDocument();

    // Radio button is keyboard-focusable
    await userEvent.tab();
    await expect(radio).toHaveFocus();

    // Space key selects the radio button
    await userEvent.keyboard(" ");
    await expect(radio).toBeChecked();
  },
};

export const WithLabel: Story = {
  args: {
    name: "demo",
    value: "a",
    label: "Option A",
    id: "opt-a",
  },
};

export const Primary: Story = {
  args: {
    name: "demo",
    value: "a",
    label: "Primary",
    variant: "primary",
  },
};

export const Disabled: Story = {
  args: {
    name: "demo",
    value: "a",
    label: "Disabled",
    disabled: true,
  },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Radio name="group" value="a" label="Option A" variant="primary" />
      <Radio name="group" value="b" label="Option B" variant="primary" />
      <Radio name="group" value="c" label="Option C" variant="primary" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["primary", "secondary", "accent", "info", "success", "warning", "error"] as const).map(
        (v) => (
          <Radio key={v} name={`demo-${v}`} value={v} label={v} variant={v} />
        )
      )}
    </div>
  ),
};
