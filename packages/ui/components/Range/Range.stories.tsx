import type { Meta, StoryObj } from "@storybook/react";
import { expect, fireEvent, within } from "@storybook/test";
import { Range } from "./Range";

const meta: Meta<typeof Range> = {
  title: "Components/Range",
  component: Range,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Range>;

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    "aria-label": "Volume",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");

    // Slider is present in the document
    await expect(slider).toBeInTheDocument();

    // Focus the slider directly — userEvent.tab() does not reliably produce
    // a focused state that is respected by subsequent keyboard events in
    // Playwright's synthetic-event context for native range inputs.
    slider.focus();
    await expect(slider).toHaveFocus();

    // Chromium only processes default keyboard actions (value increment) for
    // trusted events (isTrusted: true). Synthetic events from userEvent.keyboard
    // or fireEvent.keyDown have isTrusted: false and do not increment range value.
    // fireEvent.change is the Testing Library-recommended approach for range inputs:
    // it sets the native value and dispatches the change event.
    fireEvent.change(slider, { target: { value: "52" } });
    await expect(slider).toHaveValue("52");
  },
};

export const Primary: Story = {
  args: {
    variant: "primary",
    min: 0,
    max: 100,
    "aria-label": "Primary range",
  },
};

export const WithStep: Story = {
  args: {
    min: 0,
    max: 100,
    step: 25,
    "aria-label": "Range with step",
  },
};

export const Disabled: Story = {
  args: {
    min: 0,
    max: 100,
    disabled: true,
    "aria-label": "Disabled range",
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["primary", "secondary", "accent", "info", "success", "warning", "error"] as const).map(
        (v) => (
          <Range key={v} variant={v} min={0} max={100} aria-label={`${v} range`} />
        )
      )}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Range size="xs" min={0} max={100} aria-label="Extra small range" />
      <Range size="sm" min={0} max={100} aria-label="Small range" />
      <Range size="md" min={0} max={100} aria-label="Medium range" />
      <Range size="lg" min={0} max={100} aria-label="Large range" />
    </div>
  ),
};
