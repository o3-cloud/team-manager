import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Mask } from "./Mask";

const meta: Meta<typeof Mask> = {
  title: "Layout/Mask",
  component: Mask,
  tags: ["autodocs"],
  argTypes: {
    shape: {
      control: "select",
      options: [
        "squircle",
        "hexagon",
        "hexagon-2",
        "decal",
        "circle",
        "heart",
        "half-1",
        "half-2",
        "parallelogram",
        "parallelogram-2",
        "parallelogram-3",
        "parallelogram-4",
        "star",
        "star-2",
        "triangle",
        "triangle-2",
        "triangle-3",
        "triangle-4",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Mask>;

const IMG = "https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp";

export const Squircle: Story = {
  args: {
    src: IMG,
    alt: "Squircle mask",
    shape: "squircle",
    className: "w-24",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByAltText("Squircle mask");
    await expect(image).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(image);
  },
};

export const AllShapes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      {(
        [
          "squircle",
          "hexagon",
          "hexagon-2",
          "circle",
          "heart",
          "star",
          "star-2",
          "triangle",
        ] as const
      ).map((shape) => (
        <div key={shape} className="flex flex-col items-center gap-1">
          <Mask src={IMG} alt={shape} shape={shape} className="w-16 h-16 object-cover" />
          <span className="text-xs">{shape}</span>
        </div>
      ))}
    </div>
  ),
};

export const HalfMasks: Story = {
  render: () => (
    <div className="flex gap-0">
      <Mask src={IMG} alt="half-1" shape="half-1" className="w-16 h-16 object-cover" />
      <Mask src={IMG} alt="half-2" shape="half-2" className="w-16 h-16 object-cover" />
    </div>
  ),
};
