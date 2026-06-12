import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Calendar>;

export const Default: Story = {
  args: {
    "aria-label": "Select a date",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Select a date");

    await expect(input).toBeInTheDocument();
    await expect(input).toHaveAttribute("type", "date");

    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const WithValue: Story = {
  args: {
    value: "2026-04-12",
    onChange: () => {
      /* no-op stub for Storybook story */
    },
    "aria-label": "Selected date",
  },
};

export const WithRange: Story = {
  args: {
    min: "2026-01-01",
    max: "2026-12-31",
    "aria-label": "Date in 2026",
  },
};

export const InForm: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <label className="label" htmlFor="appt-date">
        Appointment Date
      </label>
      <Calendar id="appt-date" aria-label="Appointment date" />
      <p className="text-xs text-base-content/60">Select your preferred appointment date</p>
    </div>
  ),
};
