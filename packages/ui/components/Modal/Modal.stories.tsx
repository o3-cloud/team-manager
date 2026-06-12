import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Open: Story = {
  args: {
    open: true,
    title: "Dialog Title",
    children: "This is the modal body content.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Modal renders a native dialog element with implicit role="dialog"
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    const title = canvas.getByRole("heading", { name: "Dialog Title" });
    await expect(title).toBeInTheDocument();
    const body = canvas.getByText("This is the modal body content.");
    await expect(body).toBeInTheDocument();
  },
};

export const WithClose: Story = {
  args: {
    open: true,
    title: "Closeable Dialog",
    children: "Click Close or the backdrop to dismiss.",
    onClose: () => {
      /* no-op stub for Storybook story */
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Modal renders a native dialog element with implicit role="dialog"
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeInTheDocument();

    // Close button is keyboard-reachable via Tab
    const closeButton = canvas.getByRole("button", { name: "Close" });
    await userEvent.tab();
    await expect(closeButton).toHaveFocus();

    // Clicking the close button invokes the onClose handler
    await userEvent.click(closeButton);
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Open Modal
        </button>
        <Modal
          open={open}
          title="Interactive Modal"
          onClose={() => {
            setOpen(false);
          }}
        >
          <p>This modal can be opened and closed interactively.</p>
        </Modal>
      </div>
    );
  },
};
