import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  argTypes: {
    vertical: {
      control: "select",
      options: ["top", "middle", "bottom"],
    },
    horizontal: {
      control: "select",
      options: ["start", "center", "end"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const BottomEnd: Story = {
  args: {
    vertical: "bottom",
    horizontal: "end",
    children: (
      <div className="alert alert-success">
        <span>File saved!</span>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("File saved!")).toBeInTheDocument();
    const toast = canvasElement.querySelector(".toast");
    await expect(toast).toHaveClass("toast-bottom", "toast-end");
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(canvas.getByText("File saved!"));
  },
};

export const TopCenter: Story = {
  args: {
    vertical: "top",
    horizontal: "center",
    children: (
      <div className="alert alert-info">
        <span>New update available.</span>
      </div>
    ),
  },
};

export const TopStart: Story = {
  args: {
    vertical: "top",
    horizontal: "start",
    children: (
      <div className="alert alert-warning">
        <span>Low disk space.</span>
      </div>
    ),
  },
};

export const WithError: Story = {
  args: {
    vertical: "bottom",
    horizontal: "center",
    children: (
      <div className="alert alert-error">
        <span>Upload failed.</span>
      </div>
    ),
  },
};
