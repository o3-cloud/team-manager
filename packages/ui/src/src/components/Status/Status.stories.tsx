import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Status } from "./Status";

const meta: Meta<typeof Status> = {
  title: "Components/Status",
  component: Status,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "neutral", "info", "success", "warning", "error"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Default: Story = {
  args: {
    variant: "neutral",
    size: "md",
    "aria-label": "Status indicator",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicator = canvas.getByLabelText("Status indicator");
    await expect(indicator).toBeInTheDocument();
    await expect(indicator).toHaveClass("status-neutral", "status-md");
    await expect(indicator).toHaveAttribute("aria-label", "Status indicator");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(indicator);
  },
};

export const Online: Story = {
  args: {
    variant: "success",
    size: "md",
    "aria-label": "Online",
  },
};

export const Offline: Story = {
  args: {
    variant: "error",
    size: "md",
    "aria-label": "Offline",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      {(
        [
          "primary",
          "secondary",
          "accent",
          "neutral",
          "info",
          "success",
          "warning",
          "error",
        ] as const
      ).map((variant) => (
        <div key={variant} className="flex items-center gap-1">
          <Status variant={variant} aria-label={variant} />
          <span className="text-sm capitalize">{variant}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <Status variant="primary" size={size} aria-label={`Size ${size}`} />
          <span className="text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};
