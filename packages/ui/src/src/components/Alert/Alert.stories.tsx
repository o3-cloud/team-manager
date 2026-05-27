import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    children: "This is an info alert.",
    variant: "info",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    await expect(alert).toBeInTheDocument();
    await expect(alert).toHaveTextContent("This is an info alert.");
  },
};

export const Success: Story = {
  args: {
    children: "Your changes have been saved.",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Please review before proceeding.",
    variant: "warning",
  },
};

export const ErrorVariant: Story = {
  name: "Error",
  args: {
    children: "Something went wrong.",
    variant: "error",
  },
};

export const Dismissible: Story = {
  args: {
    children: "Click the button to dismiss this alert.",
    variant: "info",
    onDismiss: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alertEl = canvas.getByRole("alert");
    await expect(alertEl).toBeInTheDocument();
    const dismissButton = canvas.getByRole("button", { name: "Dismiss" });
    // Dismiss button is keyboard-focusable via tab
    await userEvent.tab();
    await expect(dismissButton).toHaveFocus();
    await userEvent.click(dismissButton);
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Alert variant="info">Info alert</Alert>
      <Alert variant="success">Success alert</Alert>
      <Alert variant="warning">Warning alert</Alert>
      <Alert variant="error">Error alert</Alert>
    </div>
  ),
};
