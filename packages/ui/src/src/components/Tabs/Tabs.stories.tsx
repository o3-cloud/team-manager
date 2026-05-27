import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["boxed", "lifted", "bordered"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    tabs: [{ label: "Tab 1", active: true }, { label: "Tab 2" }, { label: "Tab 3" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole("tablist");
    await expect(tablist).toBeInTheDocument();
    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(3);
    await expect(tabs[0]).toHaveTextContent("Tab 1");
    await expect(tabs[1]).toHaveTextContent("Tab 2");
    await expect(tabs[2]).toHaveTextContent("Tab 3");
    await expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    await userEvent.tab();
    await expect(tabs[0]).toHaveFocus();
    await userEvent.tab();
    await expect(tabs[1]).toHaveFocus();
    // Interaction: click Tab 2 and verify it receives focus
    // biome-ignore lint/style/noNonNullAssertion: length asserted above (toHaveLength(3))
    await userEvent.click(tabs[1]!);
    await expect(tabs[1]).toHaveFocus();
  },
};

export const Boxed: Story = {
  args: {
    variant: "boxed",
    tabs: [{ label: "Tab 1", active: true }, { label: "Tab 2" }, { label: "Tab 3" }],
  },
};

export const Lifted: Story = {
  args: {
    variant: "lifted",
    tabs: [{ label: "Tab 1", active: true }, { label: "Tab 2" }, { label: "Tab 3" }],
  },
};

export const Bordered: Story = {
  args: {
    variant: "bordered",
    tabs: [{ label: "Tab 1", active: true }, { label: "Tab 2" }, { label: "Tab 3" }],
  },
};

export const WithDisabled: Story = {
  args: {
    tabs: [
      { label: "Tab 1", active: true },
      { label: "Tab 2" },
      { label: "Tab 3", disabled: true },
    ],
  },
};
