import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Timeline } from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  args: {
    items: [
      { start: "2020", end: "Event One" },
      { start: "2021", end: "Event Two" },
      { start: "2022", end: "Event Three" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list");
    await expect(list).toBeInTheDocument();
    const eventOne = canvas.getByText("Event One");
    await expect(eventOne).toBeInTheDocument();
    const year2020 = canvas.getByText("2020");
    await expect(year2020).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(eventOne);
  },
};

export const Horizontal: Story = {
  args: {
    horizontal: true,
    items: [
      { start: "2020", end: "First" },
      { start: "2021", end: "Second" },
      { start: "2022", end: "Third" },
    ],
  },
};

export const WithMiddle: Story = {
  args: {
    items: [
      {
        start: "Jan 2024",
        middle: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-label="Checkmark"
            role="img"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        ),
        end: "Launched v1",
      },
      {
        start: "Mar 2024",
        middle: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-label="Checkmark"
            role="img"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        ),
        end: "Shipped v2",
      },
    ],
  },
};

export const SnapIcon: Story = {
  args: {
    snap: true,
    items: [
      { start: "2020", end: "Event One" },
      { start: "2021", end: "Event Two" },
      { start: "2022", end: "Event Three" },
    ],
  },
};
