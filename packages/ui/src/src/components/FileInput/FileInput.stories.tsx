import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { FileInput } from "./FileInput";

const meta: Meta<typeof FileInput> = {
  title: "Components/FileInput",
  component: FileInput,
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
type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
  args: {
    label: "Upload a file",
    id: "upload",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // File input is labelled and present in the document
    const fileInput = canvas.getByLabelText("Upload a file");
    await expect(fileInput).toBeInTheDocument();
    await expect(fileInput).toHaveAttribute("type", "file");

    // File input is keyboard-focusable
    await userEvent.tab();
    await expect(fileInput).toHaveFocus();
    // Interaction: click the file input and verify it retains focus
    await userEvent.click(fileInput);
    await expect(fileInput).toHaveFocus();
  },
};

export const WithLabel: Story = {
  args: {
    label: "Upload a file",
    id: "upload",
  },
};

export const Primary: Story = {
  args: {
    label: "Primary",
    variant: "primary",
  },
};

export const AcceptImages: Story = {
  args: {
    label: "Upload image",
    accept: "image/*",
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <FileInput size="xs" aria-label="Extra small file input" />
      <FileInput size="sm" aria-label="Small file input" />
      <FileInput size="md" aria-label="Medium file input" />
      <FileInput size="lg" aria-label="Large file input" />
    </div>
  ),
};
