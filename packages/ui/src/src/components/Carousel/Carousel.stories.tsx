import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  args: {
    items: [
      {
        id: "slide1",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
            alt="Slide 1"
          />
        ),
      },
      {
        id: "slide2",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            alt="Slide 2"
          />
        ),
      },
      {
        id: "slide3",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
            alt="Slide 3"
          />
        ),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slide1 = canvas.getByAltText("Slide 1");
    await expect(slide1).toBeInTheDocument();
    const slide2 = canvas.getByAltText("Slide 2");
    await expect(slide2).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(slide1);
  },
};

export const Vertical: Story = {
  args: {
    direction: "vertical",
    items: [
      {
        id: "item1",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
            alt="Item 1"
          />
        ),
      },
      {
        id: "item2",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            alt="Item 2"
          />
        ),
      },
    ],
  },
};

export const MultipleItems: Story = {
  args: {
    items: [
      {
        id: "a",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
            alt="Slide A"
          />
        ),
      },
      {
        id: "b",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
            alt="Slide B"
          />
        ),
      },
      {
        id: "c",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp"
            alt="Slide C"
          />
        ),
      },
      {
        id: "d",
        children: (
          <img
            src="https://img.daisyui.com/images/stock/photo-1494253109108-2e30c049369b.webp"
            alt="Slide D"
          />
        ),
      },
    ],
  },
};
