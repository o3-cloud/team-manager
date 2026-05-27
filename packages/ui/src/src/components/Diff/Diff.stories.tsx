import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Diff } from "./Diff";

const meta: Meta<typeof Diff> = {
  title: "Components/Diff",
  component: Diff,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Diff>;

export const Default: Story = {
  args: {
    itemOne: (
      <div className="bg-base-200 w-full h-full flex items-center justify-center">
        <p>Original</p>
      </div>
    ),
    itemTwo: (
      <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center">
        <p>Modified</p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const original = canvas.getByText("Original");
    await expect(original).toBeInTheDocument();
    const modified = canvas.getByText("Modified");
    await expect(modified).toBeInTheDocument();
    // Display-only; daisyUI Diff uses pointer-events:none on content — click canvas root instead
    await userEvent.click(canvasElement);
  },
};

export const TextComparison: Story = {
  args: {
    itemOne: (
      <div className="bg-base-100 w-full h-full flex flex-col items-center justify-center gap-2 p-4">
        <h2 className="text-xl font-bold">Before</h2>
        <p className="text-sm text-center">This is the original version of the content.</p>
      </div>
    ),
    itemTwo: (
      <div className="bg-secondary text-secondary-content w-full h-full flex flex-col items-center justify-center gap-2 p-4">
        <h2 className="text-xl font-bold">After</h2>
        <p className="text-sm text-center">This is the updated version of the content.</p>
      </div>
    ),
  },
};
