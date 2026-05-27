import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Navbar } from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Navigation/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    a11y: {
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

export const Default: Story = {
  args: {
    className: "bg-base-100 shadow",
    start: <span className="text-xl font-bold">Brand</span>,
    end: (
      <button type="button" className="btn btn-ghost">
        Login
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Brand")).toBeInTheDocument();
    const loginButton = canvas.getByRole("button", { name: "Login" });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.tab();
    await expect(loginButton).toHaveFocus();
  },
};

export const WithCenterNav: Story = {
  args: {
    className: "bg-base-100 shadow",
    start: <span className="text-xl font-bold">Brand</span>,
    center: (
      <nav className="flex gap-2">
        <button type="button" className="btn btn-ghost btn-sm">
          Home
        </button>
        <button type="button" className="btn btn-ghost btn-sm">
          About
        </button>
        <button type="button" className="btn btn-ghost btn-sm">
          Contact
        </button>
      </nav>
    ),
    end: (
      <button type="button" className="btn btn-primary btn-sm">
        Get Started
      </button>
    ),
  },
};

export const StartOnly: Story = {
  args: {
    className: "bg-base-100 shadow",
    start: <span className="text-xl font-bold">My App</span>,
  },
};

export const Colored: Story = {
  args: {
    className: "bg-primary text-primary-content",
    start: <span className="text-xl font-bold">Brand</span>,
    end: (
      <button type="button" className="btn btn-ghost">
        Menu
      </button>
    ),
  },
};
