import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Navigation/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "accent", "neutral", "success", "warning", "info", "error"],
    },
  },
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
type Story = StoryObj<typeof Link>;

export const Primary: Story = {
  args: {
    children: "Primary link",
    variant: "primary",
    href: "#",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Primary link" });
    await expect(link).toBeInTheDocument();
    await userEvent.tab();
    await expect(link).toHaveFocus();
    // Interaction: click the link (href="#" — same-page anchor) and verify it remains in the document
    await userEvent.click(link);
    await expect(link).toBeInTheDocument();
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary link",
    variant: "secondary",
    href: "#",
  },
};

export const Accent: Story = {
  args: {
    children: "Accent link",
    variant: "accent",
    href: "#",
  },
};

export const Neutral: Story = {
  args: {
    children: "Neutral link",
    variant: "neutral",
    href: "#",
  },
};

export const HoverOnly: Story = {
  args: {
    children: "Hover to see underline",
    hover: true,
    href: "#",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {(
        [
          "primary",
          "secondary",
          "accent",
          "neutral",
          "success",
          "warning",
          "info",
          "error",
        ] as const
      ).map((variant) => (
        <Link key={variant} variant={variant} href="#">
          {variant}
        </Link>
      ))}
    </div>
  ),
};
