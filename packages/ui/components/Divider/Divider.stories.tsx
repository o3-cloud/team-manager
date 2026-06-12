import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
    color: {
      control: "select",
      options: ["primary", "secondary", "accent", "neutral", "success", "warning", "error", "info"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  args: {
    "aria-label": "Section divider",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const divider = canvas.getByLabelText("Section divider");
    await expect(divider).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(divider);
  },
};

export const WithText: Story = {
  args: {
    children: "OR",
  },
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-24 items-center">
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const Colored: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Divider color="primary">Primary</Divider>
      <Divider color="secondary">Secondary</Divider>
      <Divider color="accent">Accent</Divider>
      <Divider color="success">Success</Divider>
      <Divider color="warning">Warning</Divider>
      <Divider color="error">Error</Divider>
      <Divider color="info">Info</Divider>
    </div>
  ),
};

export const NoContent: Story = {
  args: {
    children: undefined,
  },
};
