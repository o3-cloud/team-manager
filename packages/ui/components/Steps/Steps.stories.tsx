import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Steps } from "./Steps";

const meta: Meta<typeof Steps> = {
  title: "Navigation/Steps",
  component: Steps,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Steps>;

export const Default: Story = {
  args: {
    items: [
      { label: "Register" },
      { label: "Choose plan" },
      { label: "Purchase" },
      { label: "Receive Product" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    await expect(list).toBeInTheDocument();
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(4);
    await expect(canvas.getByText("Register")).toBeInTheDocument();
    await expect(canvas.getByText("Choose plan")).toBeInTheDocument();
    await expect(canvas.getByText("Purchase")).toBeInTheDocument();
    await expect(canvas.getByText("Receive Product")).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(list);
  },
};

export const WithVariants: Story = {
  args: {
    items: [
      { label: "Step 1", variant: "primary" },
      { label: "Step 2", variant: "primary" },
      { label: "Step 3" },
      { label: "Step 4" },
    ],
  },
};

export const WithContent: Story = {
  args: {
    items: [
      { label: "Register", variant: "primary", content: "✓" },
      { label: "Choose plan", variant: "primary", content: "✓" },
      { label: "Purchase", content: "?" },
      { label: "Receive Product" },
    ],
  },
};

export const Vertical: Story = {
  args: {
    vertical: true,
    items: [
      { label: "Register", variant: "primary" },
      { label: "Choose plan", variant: "secondary" },
      { label: "Purchase" },
      { label: "Receive Product" },
    ],
  },
};

export const AllVariants: Story = {
  render: () => (
    <Steps
      items={[
        { label: "Primary", variant: "primary" },
        { label: "Secondary", variant: "secondary" },
        { label: "Accent", variant: "accent" },
        { label: "Success", variant: "success" },
        { label: "Warning", variant: "warning" },
        { label: "Error", variant: "error" },
      ]}
    />
  ),
};
