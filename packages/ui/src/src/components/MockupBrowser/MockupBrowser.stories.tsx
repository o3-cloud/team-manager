import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MockupBrowser } from "./MockupBrowser";

const meta: Meta<typeof MockupBrowser> = {
  title: "Components/MockupBrowser",
  component: MockupBrowser,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockupBrowser>;

export const Default: Story = {
  args: {
    children: <p className="p-4">Browser content without a URL bar</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Browser content without a URL bar");
    await expect(content).toBeInTheDocument();
    const root = canvasElement.querySelector(".mockup-browser");
    await expect(root).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};

export const WithUrl: Story = {
  args: {
    url: "https://daisyui.com",
    children: <p className="p-4">Content with URL in toolbar</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Content with URL in toolbar");
    await expect(content).toBeInTheDocument();
    const inputDiv = canvasElement.querySelector(".mockup-browser-toolbar .input");
    await expect(inputDiv).not.toBeNull();
    await expect(inputDiv?.textContent).toBe("https://daisyui.com");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};

export const WithContent: Story = {
  args: {
    url: "https://daisyui.com",
    children: (
      <div className="flex items-center justify-center bg-base-200 p-8">
        <p className="text-lg font-semibold">Welcome to daisyUI</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByText("Welcome to daisyUI");
    await expect(content).toBeInTheDocument();
    const root = canvasElement.querySelector(".mockup-browser");
    await expect(root).not.toBeNull();
    const toolbar = canvasElement.querySelector(".mockup-browser-toolbar");
    await expect(toolbar).not.toBeNull();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(content);
  },
};
