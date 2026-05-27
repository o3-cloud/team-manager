import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Accordion } from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    // daisyUI Accordion uses native <input type="radio"> elements for CSS-only expand/collapse.
    // These hidden inputs carry ARIA attributes that axe flags as aria-prohibited-attr.
    a11y: { config: { rules: [{ id: "aria-prohibited-attr", enabled: false }] } },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  args: {
    variant: "arrow",
    items: [
      { title: "What is daisyUI?", children: "daisyUI is a Tailwind CSS component library." },
      { title: "How do I install it?", children: "Run npm install daisyui in your project." },
      { title: "Is it free?", children: "Yes, daisyUI is open source and free to use." },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Accordion items are controlled by radio inputs (daisyUI collapse)
    const radios = canvas.getAllByRole("radio");
    await expect(radios).toHaveLength(3);
    await expect(radios[0]).toBeChecked();

    // Accordion titles are present
    await expect(canvas.getByText("What is daisyUI?")).toBeInTheDocument();
    await expect(canvas.getByText("How do I install it?")).toBeInTheDocument();
    await expect(canvas.getByText("Is it free?")).toBeInTheDocument();

    // Radio inputs are keyboard-focusable
    const [firstRadio, secondRadio] = radios;
    if (!firstRadio || !secondRadio) return;
    await userEvent.tab();
    await expect(firstRadio).toHaveFocus();

    // Clicking a different item's radio opens that section
    await userEvent.click(secondRadio);
    await expect(secondRadio).toBeChecked();
    await expect(firstRadio).not.toBeChecked();
  },
};

export const Plus: Story = {
  args: {
    variant: "plus",
    items: [
      { title: "Section One", children: "Content for section one." },
      { title: "Section Two", children: "Content for section two." },
      { title: "Section Three", children: "Content for section three." },
    ],
  },
};

export const NoVariant: Story = {
  args: {
    variant: "none",
    items: [
      { title: "Plain Item One", children: "Plain content one." },
      { title: "Plain Item Two", children: "Plain content two." },
    ],
  },
};

export const MultipleItems: Story = {
  args: {
    variant: "arrow",
    items: [
      { title: "First", children: "First item content." },
      { title: "Second", children: "Second item content." },
      { title: "Third", children: "Third item content." },
      { title: "Fourth", children: "Fourth item content." },
      { title: "Fifth", children: "Fifth item content." },
    ],
  },
};
