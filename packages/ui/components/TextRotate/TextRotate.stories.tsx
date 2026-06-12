import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { TextRotate } from "./TextRotate";

const meta: Meta<typeof TextRotate> = {
  title: "Components/TextRotate",
  component: TextRotate,
  tags: ["autodocs"],
  argTypes: {
    duration: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TextRotate>;

export const Default: Story = {
  args: {
    items: ["React", "Vue", "Svelte", "Angular"],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // TextRotate renders each item as a <span> inside a .text-rotate container
    await expect(canvas.getByText("React")).toBeInTheDocument();
    await expect(canvas.getByText("Vue")).toBeInTheDocument();
    await expect(canvas.getByText("Svelte")).toBeInTheDocument();
    await expect(canvas.getByText("Angular")).toBeInTheDocument();
    const rotateContainer = canvasElement.querySelector(".text-rotate");
    await expect(rotateContainer).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(canvas.getByText("React"));
  },
};

export const SlowRotation: Story = {
  args: {
    items: ["Fast", "Reliable", "Accessible", "Beautiful"],
    duration: "20s",
  },
};

export const InHeading: Story = {
  render: () => (
    <h1 className="text-4xl font-bold">
      Build with{" "}
      <TextRotate items={["React", "daisyUI", "Tailwind", "TypeScript"]} className="text-primary" />
    </h1>
  ),
};
