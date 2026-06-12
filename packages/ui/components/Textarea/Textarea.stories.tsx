import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
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
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    "aria-label": "Message",
    placeholder: "Type here…",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");

    // Textarea is present and has the correct role
    await expect(textarea).toBeInTheDocument();

    // Textarea is keyboard-focusable
    await userEvent.tab();
    await expect(textarea).toHaveFocus();

    // Typing inserts text into the textarea
    await userEvent.type(textarea, "Hello, world!");
    await expect(textarea).toHaveValue("Hello, world!");
  },
};

export const WithLabel: Story = {
  args: {
    label: "Your message",
    placeholder: "Enter your message",
    id: "message",
  },
};

export const Primary: Story = {
  args: {
    label: "Primary",
    variant: "primary",
    placeholder: "Primary variant",
  },
};

export const WithError: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    error: "Bio must be at least 10 characters",
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only",
    placeholder: "Cannot edit",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Textarea size="xs" aria-label="Extra small textarea" placeholder="Extra small" />
      <Textarea size="sm" aria-label="Small textarea" placeholder="Small" />
      <Textarea size="md" aria-label="Medium textarea" placeholder="Medium (default)" />
      <Textarea size="lg" aria-label="Large textarea" placeholder="Large" />
    </div>
  ),
};
