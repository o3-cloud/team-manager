import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { MockupCode } from "./MockupCode";

const meta: Meta<typeof MockupCode> = {
  title: "Components/MockupCode",
  component: MockupCode,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockupCode>;

export const Default: Story = {
  args: {
    lines: [{ prefix: "$", code: "npm install" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvasElement.querySelector(".mockup-code");
    await expect(wrapper).not.toBeNull();
    const code = canvas.getByText("npm install");
    await expect(code).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(code);
  },
};

export const MultiLine: Story = {
  args: {
    lines: [
      { prefix: "$", code: "git clone https://github.com/example/repo.git" },
      { prefix: "$", code: "cd repo" },
      { prefix: "$", code: "bun install" },
      { prefix: "$", code: "bun run dev" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvasElement.querySelector(".mockup-code");
    await expect(wrapper).not.toBeNull();
    const firstLine = canvas.getByText("git clone https://github.com/example/repo.git");
    await expect(firstLine).toBeInTheDocument();
    const lastLine = canvas.getByText("bun run dev");
    await expect(lastLine).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(firstLine);
  },
};

export const WithHighlight: Story = {
  args: {
    lines: [
      { prefix: "$", code: "bun install" },
      { prefix: "$", code: "bun run build", highlight: true },
      { prefix: "$", code: "bun test" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvasElement.querySelector(".mockup-code");
    await expect(wrapper).not.toBeNull();
    const highlightedCode = canvas.getByText("bun run build");
    await expect(highlightedCode).toBeInTheDocument();
    const highlightedPre = highlightedCode.closest("pre");
    await expect(highlightedPre).not.toBeNull();
    await expect(highlightedPre?.classList.contains("bg-warning")).toBe(true);
    await expect(highlightedPre?.classList.contains("text-warning-content")).toBe(true);
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(highlightedCode);
  },
};
