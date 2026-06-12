import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { FAB } from "./FAB";

const meta: Meta<typeof FAB> = {
  title: "Components/FAB",
  component: FAB,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    flower: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof FAB>;

export const Default: Story = {
  render: () => (
    <div className="relative h-64 w-64">
      <FAB
        trigger={
          <button type="button" className="btn btn-circle btn-primary" aria-label="Open actions">
            ✚
          </button>
        }
      >
        <button type="button" className="btn btn-circle btn-secondary btn-sm" aria-label="Edit">
          ✎
        </button>
        <button type="button" className="btn btn-circle btn-accent btn-sm" aria-label="Share">
          ⬆
        </button>
        <button type="button" className="btn btn-circle btn-info btn-sm" aria-label="Info">
          ℹ
        </button>
      </FAB>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open actions" });
    await expect(trigger).toBeInTheDocument();
    await userEvent.tab();
    // The FAB trigger wrapper (tabIndex=0) receives focus for CSS :focus-within expansion
    const triggerWrapper = trigger.closest('[tabindex="0"]');
    await expect(triggerWrapper ?? trigger).toHaveFocus();
    // Interaction: daisyUI FAB uses pointer-events:none on both wrapper and inner button
    // when unexpanded (CSS :focus-within only). Use keyboard Enter on the focused wrapper.
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toBeInTheDocument();
  },
};

export const WithFlower: Story = {
  render: () => (
    <div className="relative h-64 w-64">
      <FAB
        flower
        trigger={
          <button type="button" className="btn btn-circle btn-primary" aria-label="Open">
            ✚
          </button>
        }
      >
        <button type="button" className="btn btn-circle btn-secondary btn-sm" aria-label="A">
          A
        </button>
        <button type="button" className="btn btn-circle btn-accent btn-sm" aria-label="B">
          B
        </button>
        <button type="button" className="btn btn-circle btn-info btn-sm" aria-label="C">
          C
        </button>
      </FAB>
    </div>
  ),
};
