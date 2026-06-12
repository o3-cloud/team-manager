import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Filter, FilterReset } from "./Filter";

const meta: Meta = {
  title: "Components/Filter",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const ColorFilter: Story = {
  render: () => (
    <Filter>
      <FilterReset name="color" aria-label="Reset filter" />
      <input type="radio" name="color" className="btn" aria-label="Red" value="red" />
      <input type="radio" name="color" className="btn" aria-label="Green" value="green" />
      <input type="radio" name="color" className="btn" aria-label="Blue" value="blue" />
      <input type="radio" name="color" className="btn" aria-label="Purple" value="purple" />
    </Filter>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const resetFilter = canvas.getByRole("radio", { name: "Reset filter" });
    await expect(resetFilter).toBeInTheDocument();
    // First radio in group is keyboard-focusable via tab
    await userEvent.tab();
    await expect(resetFilter).toHaveFocus();
    const redFilter = canvas.getByRole("radio", { name: "Red" });
    await userEvent.click(redFilter);
    await expect(redFilter).toBeChecked();
  },
};

export const CategoryFilter: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Filter>
        <FilterReset name="category" aria-label="All categories" />
        <input type="radio" name="category" className="btn" aria-label="Design" value="design" />
        <input type="radio" name="category" className="btn" aria-label="Code" value="code" />
        <input
          type="radio"
          name="category"
          className="btn"
          aria-label="Business"
          value="business"
        />
        <input type="radio" name="category" className="btn" aria-label="Docs" value="docs" />
      </Filter>
    </div>
  ),
};
