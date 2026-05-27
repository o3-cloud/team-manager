import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "User avatar",
    size: "md",
    shape: "circle",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole("img", { name: "User avatar" });
    await expect(img).toBeInTheDocument();
    await expect(img).toHaveAttribute("src");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(img);
  },
};

export const Initials: Story = {
  args: {
    initials: "JD",
    size: "md",
    shape: "circle",
  },
};

export const Online: Story = {
  args: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "Online user",
    online: true,
    size: "md",
  },
};

export const Offline: Story = {
  args: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "Offline user",
    offline: true,
    size: "md",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="xs"
        size="xs"
      />
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="sm"
        size="sm"
      />
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="md"
        size="md"
      />
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="lg"
        size="lg"
      />
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="circle"
        shape="circle"
      />
      <Avatar
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        alt="square"
        shape="square"
      />
    </div>
  ),
};
