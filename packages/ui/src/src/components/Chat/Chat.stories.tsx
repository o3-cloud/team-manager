import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Chat } from "./Chat";

const meta: Meta<typeof Chat> = {
  title: "Components/Chat",
  component: Chat,
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: "select",
      options: ["start", "end"],
    },
    bubbleVariant: {
      control: "select",
      options: ["primary", "secondary", "accent", "info", "success", "warning", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chat>;

export const ChatStart: Story = {
  args: {
    message: "Hello there!",
    side: "start",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Chat is a display-only component — no interactive elements, no keyboard focus expected
    const article = canvas.getByRole("article");
    await expect(article).toBeInTheDocument();
    await expect(canvas.getByText("Hello there!")).toBeInTheDocument();
    // Interaction: click the article and verify it remains in the document
    await userEvent.click(article);
    await expect(article).toBeInTheDocument();
  },
};

export const ChatEnd: Story = {
  args: {
    message: "Hi, how are you?",
    side: "end",
  },
};

export const WithAvatar: Story = {
  args: {
    message: "I have an avatar!",
    side: "start",
    avatarSrc: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    avatarAlt: "User avatar",
  },
};

export const WithHeader: Story = {
  args: {
    message: "Message with a header.",
    side: "start",
    header: "Alice",
  },
};

export const WithFooter: Story = {
  args: {
    message: "Message with a footer.",
    side: "end",
    footer: "Delivered",
  },
};

export const BubbleVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Chat message="Primary bubble" side="start" bubbleVariant="primary" />
      <Chat message="Secondary bubble" side="start" bubbleVariant="secondary" />
      <Chat message="Accent bubble" side="start" bubbleVariant="accent" />
      <Chat message="Info bubble" side="start" bubbleVariant="info" />
      <Chat message="Success bubble" side="start" bubbleVariant="success" />
      <Chat message="Warning bubble" side="start" bubbleVariant="warning" />
      <Chat message="Error bubble" side="start" bubbleVariant="error" />
    </div>
  ),
};
