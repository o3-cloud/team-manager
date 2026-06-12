import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Table } from "./Table";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

const columns = [
  { key: "name", header: "Name" },
  { key: "job", header: "Job" },
  { key: "favoriteColor", header: "Favorite Color" },
];

const rows = [
  { name: "Cy Ganderton", job: "Quality Control Specialist", favoriteColor: "Blue" },
  { name: "Hart Hagerty", job: "Desktop Support Technician", favoriteColor: "Purple" },
  { name: "Brice Swyre", job: "Tax Accountant", favoriteColor: "Red" },
];

export const Default: Story = {
  args: {
    columns,
    rows,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table");
    await expect(table).toBeInTheDocument();
    const nameHeader = canvas.getByRole("columnheader", { name: "Name" });
    await expect(nameHeader).toBeInTheDocument();
    const firstRow = canvas.getByRole("cell", { name: "Cy Ganderton" });
    await expect(firstRow).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(firstRow);
  },
};

export const Zebra: Story = {
  args: {
    columns,
    rows,
    zebra: true,
  },
};

export const WithSize: Story = {
  args: {
    columns,
    rows,
    size: "sm",
  },
};

export const PinRows: Story = {
  args: {
    columns,
    rows: [
      ...rows,
      { name: "Cy Ganderton", job: "Quality Control Specialist", favoriteColor: "Blue" },
      { name: "Hart Hagerty", job: "Desktop Support Technician", favoriteColor: "Purple" },
      { name: "Brice Swyre", job: "Tax Accountant", favoriteColor: "Red" },
    ],
    pinRows: true,
  },
};
