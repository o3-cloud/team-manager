import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Rating } from "./Rating";

const meta: Meta<typeof Rating> = {
  title: "Components/Rating",
  component: Rating,
  tags: ["autodocs"],
  argTypes: {
    max: {
      control: { type: "number", min: 1, max: 10 },
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  args: {
    name: "rating-default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios).toHaveLength(5);
    await expect(radios[0]).toBeInTheDocument();
    await userEvent.tab();
    await expect(radios[0]).toHaveFocus();
  },
};

export const WithValue: Story = {
  args: {
    name: "rating-value",
    value: 3,
    onChange: () => undefined,
  },
};

export const ThreeStar: Story = {
  args: {
    name: "rating-3",
    max: 3,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Rating name="xs" size="xs" />
      <Rating name="sm" size="sm" />
      <Rating name="md" size="md" />
      <Rating name="lg" size="lg" />
    </div>
  ),
};
