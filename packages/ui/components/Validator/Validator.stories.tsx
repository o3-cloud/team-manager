import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Validator } from "./Validator";

const meta: Meta<typeof Validator> = {
  title: "Components/Validator",
  component: Validator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Validator>;

export const Default: Story = {
  render: () => (
    <Validator hint="This field is required">
      <input
        type="text"
        className="input"
        required
        placeholder="Required field"
        aria-label="Required field"
      />
    </Validator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Required field" });
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass("validator", "input");

    // Input is keyboard-focusable
    await userEvent.tab();
    await expect(input).toHaveFocus();

    // Typing into the validated input updates its value
    await userEvent.type(input, "hello");
    await expect(input).toHaveValue("hello");

    const hint = canvasElement.querySelector(".validator-hint");
    await expect(hint).toHaveTextContent("This field is required");
  },
};

export const EmailValidator: Story = {
  render: () => (
    <Validator hint="Enter a valid email address">
      <input
        type="email"
        className="input"
        required
        placeholder="you@example.com"
        aria-label="Email address"
      />
    </Validator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Email address" });
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass("validator");
    await expect(input).toHaveAttribute("type", "email");

    await userEvent.tab();
    await expect(input).toHaveFocus();

    await userEvent.type(input, "user@example.com");
    await expect(input).toHaveValue("user@example.com");
  },
};

export const WithTextarea: Story = {
  render: () => (
    <Validator hint="Message is required">
      <textarea
        className="textarea"
        required
        placeholder="Your message"
        rows={4}
        aria-label="Your message"
      />
    </Validator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Your message" });
    await expect(textarea).toBeInTheDocument();
    await expect(textarea).toHaveClass("validator", "textarea");

    await userEvent.tab();
    await expect(textarea).toHaveFocus();

    await userEvent.type(textarea, "Hello world");
    await expect(textarea).toHaveValue("Hello world");

    const hint = canvasElement.querySelector(".validator-hint");
    await expect(hint).toHaveTextContent("Message is required");
  },
};

export const WithSelect: Story = {
  render: () => (
    <Validator hint="Please select an option">
      <select className="select" required aria-label="Select an option">
        <option value="">Pick one</option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </select>
    </Validator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: "Select an option" });
    await expect(select).toBeInTheDocument();
    await expect(select).toHaveClass("validator", "select");

    await userEvent.tab();
    await expect(select).toHaveFocus();

    await userEvent.selectOptions(select, "a");
    await expect(select).toHaveValue("a");

    const hint = canvasElement.querySelector(".validator-hint");
    await expect(hint).toHaveTextContent("Please select an option");
  },
};

export const NoHint: Story = {
  render: () => (
    <Validator>
      <input
        type="text"
        className="input"
        required
        placeholder="Validates on submit"
        aria-label="Validates on submit"
      />
    </Validator>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Validates on submit" });
    await expect(input).toBeInTheDocument();
    await expect(input).toHaveClass("validator");

    await userEvent.tab();
    await expect(input).toHaveFocus();

    await userEvent.type(input, "test value");
    await expect(input).toHaveValue("test value");

    await expect(canvasElement.querySelector(".validator-hint")).not.toBeInTheDocument();
  },
};
