import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    color: {
      control: "select",
      options: [undefined, "primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
    open: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    tip: "Tooltip content",
    children: (
      <button type="button" className="btn">
        Hover me
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Hover me" });
    await expect(button).toBeInTheDocument();
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Hovering the trigger activates the tooltip (CSS-driven via data-tip)
    await userEvent.hover(button);
    const tooltipWrapper = canvasElement.querySelector(".tooltip");
    await expect(tooltipWrapper).toHaveAttribute("data-tip", "Tooltip content");
  },
};

export const AlwaysOpen: Story = {
  args: {
    tip: "I am always visible",
    open: true,
    children: (
      <button type="button" className="btn">
        Button
      </button>
    ),
  },
};

export const Positions: Story = {
  render: () => (
    <div className="flex items-center justify-center gap-8 p-16">
      <Tooltip tip="Top" position="top">
        <button type="button" className="btn">
          Top
        </button>
      </Tooltip>
      <Tooltip tip="Bottom" position="bottom">
        <button type="button" className="btn">
          Bottom
        </button>
      </Tooltip>
      <Tooltip tip="Left" position="left">
        <button type="button" className="btn">
          Left
        </button>
      </Tooltip>
      <Tooltip tip="Right" position="right">
        <button type="button" className="btn">
          Right
        </button>
      </Tooltip>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center justify-center gap-4 p-8">
      {(["primary", "secondary", "accent", "info", "success", "warning", "error"] as const).map(
        (color) => (
          <Tooltip key={color} tip={`${color} tooltip`} color={color} open>
            <button type="button" className={`btn btn-${color}`}>
              {color}
            </button>
          </Tooltip>
        )
      )}
    </div>
  ),
};
