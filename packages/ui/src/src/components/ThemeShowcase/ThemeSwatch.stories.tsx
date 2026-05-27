import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { ThemeSwatch } from "./ThemeSwatch";

const meta: Meta<typeof ThemeSwatch> = {
  title: "Showcase/ThemeSwatch",
  component: ThemeSwatch,
  tags: ["autodocs"],
  parameters: {
    // daisyUI theme swatches may have color-contrast issues depending on the host theme
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeSwatch>;

export const Default: Story = {
  args: {
    theme: "light",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Swatch container is labelled with the theme name
    const swatch = canvas.getByLabelText("Theme: light");
    await expect(swatch).toBeInTheDocument();

    // Primary button is focusable via keyboard
    const primaryBtn = canvas.getByRole("button", { name: "Primary" });
    await userEvent.tab();
    await expect(primaryBtn).toHaveFocus();

    // Clicking the Primary button does not throw
    await userEvent.click(primaryBtn);
    await expect(primaryBtn).toBeInTheDocument();
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
};

export const CupcakeTheme: Story = {
  args: {
    theme: "cupcake",
  },
};
