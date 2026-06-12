import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  argTypes: {
    currentPage: { control: "number" },
    totalPages: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(5);
    await expect(canvas.getByRole("button", { name: "1" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "2" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "5" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(buttons[0]).toHaveFocus();
    await userEvent.tab();
    await expect(buttons[1]).toHaveFocus();
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 5,
    totalPages: 5,
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
  },
};

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
  },
};
