import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { BottomNav } from "./BottomNav";

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <title>Home</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <title>Search</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <title>Profile</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const meta: Meta<typeof BottomNav> = {
  title: "Navigation/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", icon: <HomeIcon />, active: true },
      { label: "Search", icon: <SearchIcon /> },
      { label: "Profile", icon: <ProfileIcon /> },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(3);
    await expect(buttons[0]).toBeInTheDocument();
    await expect(buttons[1]).toBeInTheDocument();
    await expect(buttons[2]).toBeInTheDocument();
    // Use selector to target the label span, avoiding collision with SVG <title> elements
    await expect(canvas.getByText("Home", { selector: ".btm-nav-label" })).toBeInTheDocument();
    await expect(canvas.getByText("Search", { selector: ".btm-nav-label" })).toBeInTheDocument();
    await expect(canvas.getByText("Profile", { selector: ".btm-nav-label" })).toBeInTheDocument();
    await userEvent.tab();
    await expect(buttons[0]).toHaveFocus();
    // Interaction: click the first button and verify it retains focus
    // biome-ignore lint/style/noNonNullAssertion: length asserted above (toHaveLength(3))
    await userEvent.click(buttons[0]!);
    await expect(buttons[0]).toHaveFocus();
  },
};

export const WithoutIcons: Story = {
  args: {
    items: [{ label: "Home", active: true }, { label: "Search" }, { label: "Profile" }],
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    items: [
      { label: "Home", icon: <HomeIcon />, active: true },
      { label: "Search", icon: <SearchIcon /> },
      { label: "Profile", icon: <ProfileIcon /> },
    ],
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    items: [
      { label: "Home", icon: <HomeIcon />, active: true },
      { label: "Search", icon: <SearchIcon /> },
      { label: "Profile", icon: <ProfileIcon /> },
    ],
  },
};
