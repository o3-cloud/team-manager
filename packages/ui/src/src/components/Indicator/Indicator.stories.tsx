import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Indicator } from "./Indicator";

const meta: Meta<typeof Indicator> = {
  title: "Layout/Indicator",
  component: Indicator,
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-right",
        "top-left",
        "top-center",
        "middle-right",
        "middle-left",
        "middle-center",
        "bottom-right",
        "bottom-left",
        "bottom-center",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Indicator>;

export const Default: Story = {
  render: () => (
    <Indicator badge={<span className="badge badge-secondary">99+</span>}>
      <Button>Inbox</Button>
    </Indicator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("99+");
    await expect(badge).toBeInTheDocument();
    const button = canvas.getByRole("button", { name: "Inbox" });
    await expect(button).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(badge);
  },
};

export const OnCard: Story = {
  render: () => (
    <Indicator badge={<Badge variant="primary">New</Badge>}>
      <div className="card bg-base-300 w-48">
        <div className="card-body">
          <p>Card content</p>
        </div>
      </div>
    </Indicator>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 p-8">
      {(
        [
          "top-left",
          "top-center",
          "top-right",
          "middle-left",
          "middle-center",
          "middle-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ] as const
      ).map((pos) => (
        <Indicator
          key={pos}
          position={pos}
          badge={<span className="badge badge-primary badge-xs" />}
        >
          <div className="bg-base-300 w-24 h-16 rounded flex items-center justify-center text-xs">
            {pos}
          </div>
        </Indicator>
      ))}
    </div>
  ),
};
