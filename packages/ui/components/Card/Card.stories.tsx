import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: "Card Title",
    children: "This card has a simple title and body text.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { name: "Card Title" });
    await expect(heading).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(heading);
  },
};

export const WithImage: Story = {
  args: {
    title: "Scenic Mountains",
    image: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
    imageAlt: "Scenic mountain landscape",
    children: "A beautiful view of the mountains.",
  },
};

export const Compact: Story = {
  args: {
    title: "Compact Card",
    compact: true,
    children: "This card uses the compact style with reduced padding.",
  },
};

export const Bordered: Story = {
  args: {
    title: "Bordered Card",
    bordered: true,
    children: "This card has a visible border.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Card with Actions",
    children: "This card includes action buttons in the footer.",
    actions: (
      <>
        <button type="button" className="btn btn-ghost">
          Cancel
        </button>
        <button type="button" className="btn btn-primary">
          Confirm
        </button>
      </>
    ),
  },
};
