import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "../Button/Button";
import { Hero } from "./Hero";

const meta: Meta<typeof Hero> = {
  title: "Layout/Hero",
  component: Hero,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {
  render: () => (
    <Hero className="bg-base-200 min-h-[300px]">
      <div className="text-center">
        <h1 className="text-5xl font-bold">Hello there</h1>
        <p className="py-6">
          Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi
          exercitationem quasi.
        </p>
        <Button>Get Started</Button>
      </div>
    </Hero>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole("heading", { name: "Hello there" });
    await expect(heading).toBeInTheDocument();
    const button = canvas.getByRole("button", { name: "Get Started" });
    await expect(button).toBeInTheDocument();
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const WithOverlay: Story = {
  render: () => (
    <Hero
      className="min-h-[300px]"
      backgroundImage="https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp"
      overlay
    >
      <div className="text-center text-neutral-content">
        <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
        <p className="mb-5">Provident cupiditate voluptatem et in.</p>
        <Button>Get Started</Button>
      </div>
    </Hero>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Hero className="bg-base-200 min-h-[300px]">
      <img
        src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
        alt="hero"
        className="max-w-sm rounded-lg shadow-2xl"
      />
      <div>
        <h1 className="text-5xl font-bold">Box Office News!</h1>
        <p className="py-6">Provident cupiditate voluptatem et in.</p>
        <Button>Get Started</Button>
      </div>
    </Hero>
  ),
};
