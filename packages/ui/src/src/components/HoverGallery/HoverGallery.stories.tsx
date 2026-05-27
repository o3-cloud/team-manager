import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { HoverGallery } from "./HoverGallery";

const meta: Meta<typeof HoverGallery> = {
  title: "Components/HoverGallery",
  component: HoverGallery,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HoverGallery>;

export const Default: Story = {
  args: {
    images: [
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-1.webp",
        alt: "Hat 1",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-2.webp",
        alt: "Hat 2",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-3.webp",
        alt: "Hat 3",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-4.webp",
        alt: "Hat 4",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const imgs = canvas.getAllByRole("img");
    await expect(imgs).toHaveLength(4);
    await expect(imgs[0]).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    // biome-ignore lint/style/noNonNullAssertion: imgs length asserted above
    await userEvent.click(imgs[0]!);
  },
};

export const TwoImages: Story = {
  args: {
    images: [
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-1.webp",
        alt: "Hat 1",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-2.webp",
        alt: "Hat 2",
      },
    ],
  },
};

export const MaxImages: Story = {
  args: {
    images: [
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-1.webp",
        alt: "Hat 1",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-2.webp",
        alt: "Hat 2",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-3.webp",
        alt: "Hat 3",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-4.webp",
        alt: "Hat 4",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-1.webp",
        alt: "Hat 5",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-2.webp",
        alt: "Hat 6",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-3.webp",
        alt: "Hat 7",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-4.webp",
        alt: "Hat 8",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-1.webp",
        alt: "Hat 9",
      },
      {
        src: "https://img.daisyui.com/images/stock/daisyui-hat-2.webp",
        alt: "Hat 10",
      },
    ],
  },
};
