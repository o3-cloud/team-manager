import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Collapse } from "./Collapse";

const meta: Meta<typeof Collapse> = {
  title: "Components/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["arrow", "plus", "none"],
    },
    defaultOpen: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Collapse>;

export const WithArrow: Story = {
  args: {
    title: "Click to expand",
    variant: "arrow",
    children: "This content is revealed when the section is expanded.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const summary = canvas.getByText("Click to expand");
    await expect(summary).toBeInTheDocument();
    // Summary element is keyboard-focusable via tab
    await userEvent.tab();
    await expect(summary).toHaveFocus();
    await userEvent.click(summary);
    const content = canvas.getByText("This content is revealed when the section is expanded.");
    await expect(content).toBeInTheDocument();
  },
};

export const WithPlus: Story = {
  args: {
    title: "Click to expand",
    variant: "plus",
    children: "This content is revealed when the section is expanded.",
  },
};

export const OpenByDefault: Story = {
  args: {
    title: "Already open",
    variant: "arrow",
    defaultOpen: true,
    children: "This section starts in the open state.",
  },
};

export const MultipleCollapse: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-96">
      <Collapse title="What is daisyUI?" variant="arrow" className="bg-base-200">
        daisyUI is a pure-CSS component library built on Tailwind CSS with 65 ready-to-use
        components.
      </Collapse>
      <Collapse title="Does it work with React?" variant="arrow" className="bg-base-200">
        Yes! daisyUI is framework-agnostic CSS — it works perfectly with React, Vue, Svelte, or
        plain HTML.
      </Collapse>
      <Collapse title="How many themes are included?" variant="arrow" className="bg-base-200">
        daisyUI v5 ships with 35 built-in themes, all configurable via the <code>data-theme</code>{" "}
        attribute.
      </Collapse>
    </div>
  ),
};
