import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { ThemeShowcase } from "./ThemeShowcase";

const meta: Meta<typeof ThemeShowcase> = {
  title: "Showcase/Themes",
  component: ThemeShowcase,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeShowcase>;

export const AllThemes: Story = {
  name: "All 35 Themes",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Heading is visible
    const heading = canvas.getByRole("heading", { name: "daisyUI Themes" });
    await expect(heading).toBeInTheDocument();

    // Theme count subtitle is present
    await expect(canvas.getByText("35 themes")).toBeInTheDocument();

    // First theme swatch renders
    await expect(canvas.getByText("light")).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(heading);
  },
};

export const LightThemes: Story = {
  name: "Light Themes",
  args: {
    title: "Light Themes",
    themes: [
      "light",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "retro",
      "valentine",
      "garden",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "cmyk",
      "autumn",
      "lemonade",
      "winter",
      "nord",
      "caramellatte",
      "silk",
    ],
  },
};

export const DarkThemes: Story = {
  name: "Dark Themes",
  args: {
    title: "Dark Themes",
    themes: [
      "dark",
      "synthwave",
      "cyberpunk",
      "halloween",
      "forest",
      "black",
      "luxury",
      "dracula",
      "business",
      "acid",
      "night",
      "coffee",
      "dim",
      "sunset",
      "abyss",
    ],
  },
};
