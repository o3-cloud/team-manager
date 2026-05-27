import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Stack } from "./Stack";

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Cards: Story = {
  render: () => (
    <Stack className="w-48">
      <div className="card bg-primary text-primary-content w-full">
        <div className="card-body">
          <p>Card 1</p>
        </div>
      </div>
      <div className="card bg-secondary text-secondary-content w-full">
        <div className="card-body">
          <p>Card 2</p>
        </div>
      </div>
      <div className="card bg-accent text-accent-content w-full">
        <div className="card-body">
          <p>Card 3</p>
        </div>
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card1 = canvas.getByText("Card 1");
    await expect(card1).toBeInTheDocument();
    const card2 = canvas.getByText("Card 2");
    await expect(card2).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(card1);
  },
};

export const Images: Story = {
  render: () => (
    <Stack className="w-24">
      <img
        className="rounded"
        src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
        alt="Layer 1"
      />
      <img
        className="rounded"
        src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
        alt="Layer 2"
      />
      <img
        className="rounded"
        src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
        alt="Layer 3"
      />
    </Stack>
  ),
};
