import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Artboard } from "./Artboard";

const meta: Meta<typeof Artboard> = {
  title: "Layout/Artboard",
  component: Artboard,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["phone-1", "phone-2", "phone-3", "phone-4", "phone-5", "phone-6"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Artboard>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex items-center justify-center h-full">
        <p>Artboard content</p>
      </div>
    ),
    size: "phone-1",
    demo: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByText("Artboard content");
    await expect(text).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(text);
  },
};

export const PhoneSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-start">
      {(["phone-1", "phone-2", "phone-3", "phone-4", "phone-5", "phone-6"] as const).map((size) => (
        <Artboard key={size} size={size} demo>
          <div className="flex items-center justify-center h-full text-sm">{size}</div>
        </Artboard>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  args: {
    children: (
      <div className="flex items-center justify-center h-full">
        <p>Horizontal layout</p>
      </div>
    ),
    size: "phone-1",
    demo: true,
    horizontal: true,
  },
};
