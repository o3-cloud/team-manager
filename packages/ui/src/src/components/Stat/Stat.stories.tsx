import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Stat } from "./Stat";

const meta: Meta<typeof Stat> = {
  title: "Components/Stat",
  component: Stat,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: {
    items: [
      {
        title: "Total Page Views",
        value: "89,400",
        description: "21% more than last month",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Total Page Views")).toBeInTheDocument();
    await expect(canvas.getByText("89,400")).toBeInTheDocument();
    await expect(canvas.getByText("21% more than last month")).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(canvas.getByText("Total Page Views"));
  },
};

export const Multiple: Story = {
  args: {
    items: [
      { title: "Downloads", value: "31K", description: "Jan 1st - Feb 1st" },
      { title: "New Users", value: "4,200", description: "↗︎ 400 (22%)" },
      { title: "New Registers", value: "1,200", description: "↘︎ 90 (14%)" },
    ],
  },
};

export const WithFigure: Story = {
  args: {
    items: [
      {
        title: "Total Likes",
        value: "25.6K",
        description: "21% more than last month",
        figure: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block h-8 w-8 stroke-current"
            aria-label="Heart icon"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        ),
      },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    horizontal: true,
    items: [
      { title: "Downloads", value: "31K" },
      { title: "Users", value: "4,200" },
    ],
  },
};
