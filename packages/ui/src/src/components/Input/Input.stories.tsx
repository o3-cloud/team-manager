import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
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
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    "aria-label": "Search",
    placeholder: "Type here…",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Search" });

    // Input has an accessible name via aria-label
    await expect(input).toBeInTheDocument();

    // Input is keyboard-focusable
    await userEvent.tab();
    await expect(input).toHaveFocus();

    // Typing into the input updates its value
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    id: "email",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Label is programmatically associated with the input
    const input = canvas.getByLabelText("Email address");
    await expect(input).toBeInTheDocument();

    // Input is keyboard-focusable
    await userEvent.tab();
    await expect(input).toHaveFocus();

    // Typing works
    await userEvent.type(input, "user@example.com");
    await expect(input).toHaveValue("user@example.com");
  },
};

export const Primary: Story = {
  args: {
    label: "Username",
    variant: "primary",
    placeholder: "Enter username",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    id: "password",
    placeholder: "Enter password",
    error: "Password must be at least 8 characters",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Password");

    // Input is marked invalid
    await expect(input).toHaveAttribute("aria-invalid", "true");

    // Error message is linked via aria-describedby
    const errorId = input.getAttribute("aria-describedby");
    await expect(errorId).toBeTruthy();
    if (!errorId) throw new Error("Expected aria-describedby attribute on error input");
    const errorEl = canvasElement.querySelector(`#${errorId}`);
    await expect(errorEl).toHaveTextContent("Password must be at least 8 characters");
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only field",
    placeholder: "Cannot edit",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Disabled input has correct ARIA attributes
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute("aria-disabled", "true");

    // Disabled input is not focusable via Tab
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Input size="xs" aria-label="Extra small input" placeholder="Extra small" />
      <Input size="sm" aria-label="Small input" placeholder="Small" />
      <Input size="md" aria-label="Medium input" placeholder="Medium (default)" />
      <Input size="lg" aria-label="Large input" placeholder="Large" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All size variants have accessible names
    await expect(canvas.getByRole("textbox", { name: "Extra small input" })).toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Small input" })).toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Medium input" })).toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Large input" })).toBeInTheDocument();
  },
};
