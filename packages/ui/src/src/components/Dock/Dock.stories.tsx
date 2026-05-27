import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Dock } from "./Dock";

const meta: Meta<typeof Dock> = {
  title: "Components/Dock",
  component: Dock,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    size: {
      control: "select",
      options: [undefined, "xs", "sm", "md", "lg", "xl"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dock>;

export const Default: Story = {
  args: {
    items: [
      { icon: "🏠", label: "Home", active: true, "aria-label": "Go to home" },
      { icon: "🔍", label: "Search", "aria-label": "Search" },
      { icon: "💬", label: "Messages", "aria-label": "Messages" },
      { icon: "👤", label: "Profile", "aria-label": "Profile" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation");

    await expect(nav).toBeInTheDocument();

    const homeButton = canvas.getByRole("button", { name: "Go to home" });
    await expect(homeButton).toBeInTheDocument();
    await expect(homeButton).toHaveAttribute("aria-current", "page");

    // Dock buttons are keyboard-focusable via tab
    await userEvent.tab();
    await expect(homeButton).toHaveFocus();

    const searchButton = canvas.getByRole("button", { name: "Search" });
    await userEvent.click(searchButton);
    await expect(searchButton).toBeInTheDocument();
  },
};

export const NoLabels: Story = {
  args: {
    items: [
      { icon: "🏠", active: true, "aria-label": "Home" },
      { icon: "🔍", "aria-label": "Search" },
      { icon: "💬", "aria-label": "Messages" },
      { icon: "👤", "aria-label": "Profile" },
    ],
  },
};

export const SizeVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="relative h-20 border border-base-300">
          <Dock
            size={size}
            items={[
              { icon: "🏠", label: "Home", active: true, "aria-label": "Home" },
              { icon: "🔍", label: "Search", "aria-label": "Search" },
              { icon: "👤", label: "Profile", "aria-label": "Profile" },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};
