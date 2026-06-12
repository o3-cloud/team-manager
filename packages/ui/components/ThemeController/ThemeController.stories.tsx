import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { ThemeController } from "./ThemeController";

const meta: Meta<typeof ThemeController> = {
  title: "Components/ThemeController",
  component: ThemeController,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["checkbox", "radio"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeController>;

export const Default: Story = {
  args: {
    theme: "dark",
    type: "checkbox",
    "aria-label": "Toggle dark theme",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Toggle dark theme" });
    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();

    // Checkbox is keyboard-focusable
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();

    // Clicking toggles the theme controller
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
  },
};

export const AsToggle: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ThemeController theme="dark" id="theme-toggle" className="toggle" />
      <label htmlFor="theme-toggle" className="label-text cursor-pointer">
        Dark mode
      </label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Label is associated with the toggle via htmlFor/id
    const toggle = canvas.getByRole("checkbox", { name: "Dark mode" });
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).not.toBeChecked();

    // Toggle is keyboard-focusable
    await userEvent.tab();
    await expect(toggle).toHaveFocus();

    // Clicking the toggle switches the theme
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

export const RadioGroup: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {(["light", "dark", "cupcake", "cyberpunk"] as const).map((theme) => (
        <div key={theme} className="flex items-center gap-2">
          <ThemeController theme={theme} type="radio" id={`theme-${theme}`} name="theme-picker" />
          <label htmlFor={`theme-${theme}`} className="label-text capitalize cursor-pointer">
            {theme}
          </label>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios).toHaveLength(4);
    for (const radio of radios) {
      await expect(radio).toHaveClass("theme-controller");
    }

    // Radio inputs are keyboard-focusable
    const [firstRadio, secondRadio] = radios;
    if (!firstRadio || !secondRadio) return;
    await userEvent.tab();
    await expect(firstRadio).toHaveFocus();

    // Clicking a radio selects its theme
    await userEvent.click(secondRadio);
    await expect(secondRadio).toBeChecked();
  },
};
