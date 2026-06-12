import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Layout/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    // daisyUI Drawer uses a native <input type="checkbox"> and <label> with aria-label
    // for CSS-only open/close. Axe flags aria-prohibited-attr on these elements.
    a11y: { config: { rules: [{ id: "aria-prohibited-attr", enabled: false }] } },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    function DrawerDemo() {
      const [open, setOpen] = useState(false);
      return (
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          className="h-64"
          side={
            <ul className="menu bg-base-200 text-base-content min-h-full w-48 p-4">
              <li>
                <a href="/">Sidebar Item 1</a>
              </li>
              <li>
                <a href="/">Sidebar Item 2</a>
              </li>
              <li>
                <a href="/">Sidebar Item 3</a>
              </li>
            </ul>
          }
        >
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-base-100">
            <p>Page content here</p>
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              Open Drawer
            </Button>
          </div>
        </Drawer>
      );
    }
    return <DrawerDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openButton = canvas.getByRole("button", { name: "Open Drawer" });
    await expect(openButton).toBeInTheDocument();
    await userEvent.tab();
    await expect(openButton).toHaveFocus();
    await userEvent.click(openButton);
    const sidebarItem = canvas.getByText("Sidebar Item 1");
    await expect(sidebarItem).toBeInTheDocument();
  },
};

export const EndDrawer: Story = {
  render: () => {
    function DrawerDemo() {
      const [open, setOpen] = useState(false);
      return (
        <Drawer
          end
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          className="h-64"
          side={
            <ul className="menu bg-base-200 text-base-content min-h-full w-48 p-4">
              <li>
                <a href="/">Right Sidebar 1</a>
              </li>
              <li>
                <a href="/">Right Sidebar 2</a>
              </li>
            </ul>
          }
        >
          <div className="flex flex-col items-center justify-center h-full gap-4 bg-base-100">
            <p>Content area</p>
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              Open End Drawer
            </Button>
          </div>
        </Drawer>
      );
    }
    return <DrawerDemo />;
  },
};

export const AlwaysVisible: Story = {
  render: () => (
    <Drawer
      open
      className="h-64 lg:drawer-open"
      side={
        <ul className="menu bg-base-200 text-base-content min-h-full w-48 p-4">
          <li>
            <a href="/">Always visible</a>
          </li>
          <li>
            <a href="/">Sidebar link</a>
          </li>
        </ul>
      }
    >
      <div className="flex items-center justify-center h-full bg-base-100">
        <p>Main content with permanent sidebar</p>
      </div>
    </Drawer>
  ),
};
