import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Loading } from "./Loading";

const meta: Meta<typeof Loading> = {
  title: "Components/Loading",
  component: Loading,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["spinner", "dots", "ring", "ball", "bars", "infinity"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Loading>;

export const Spinner: Story = {
  args: {
    variant: "spinner",
    size: "md",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole("status", { name: "Loading" });
    await expect(spinner).toBeInTheDocument();
    await expect(spinner).toHaveClass("loading", "loading-md");
    // Display-only; Loading spinner has pointer-events:none — click canvas root instead
    await userEvent.click(canvasElement);
    await expect(spinner).toBeInTheDocument();
  },
};

export const Dots: Story = {
  args: {
    variant: "dots",
    size: "md",
  },
};

export const Ring: Story = {
  args: {
    variant: "ring",
    size: "md",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Loading variant="spinner" />
      <Loading variant="dots" />
      <Loading variant="ring" />
      <Loading variant="ball" />
      <Loading variant="bars" />
      <Loading variant="infinity" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Loading size="xs" />
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
    </div>
  ),
};
