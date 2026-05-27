import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {
  render: () => (
    <Footer className="bg-neutral text-neutral-content p-10">
      <nav>
        <h6 className="footer-title">Services</h6>
        <a className="link link-hover" href="/">
          Branding
        </a>
        <a className="link link-hover" href="/">
          Design
        </a>
        <a className="link link-hover" href="/">
          Marketing
        </a>
      </nav>
      <nav>
        <h6 className="footer-title">Company</h6>
        <a className="link link-hover" href="/">
          About us
        </a>
        <a className="link link-hover" href="/">
          Contact
        </a>
        <a className="link link-hover" href="/">
          Jobs
        </a>
      </nav>
    </Footer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footer = canvas.getByRole("contentinfo");
    await expect(footer).toBeInTheDocument();
    const brandingLink = canvas.getByRole("link", { name: "Branding" });
    await expect(brandingLink).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(footer);
  },
};

export const Centered: Story = {
  render: () => (
    <Footer center className="bg-base-300 text-base-content p-10">
      <aside>
        <p>Copyright © 2024 - All right reserved</p>
      </aside>
    </Footer>
  ),
};

export const WithCopyright: Story = {
  render: () => (
    <div>
      <Footer className="bg-neutral text-neutral-content p-10">
        <nav>
          <h6 className="footer-title">Links</h6>
          <a className="link link-hover" href="/">
            Home
          </a>
          <a className="link link-hover" href="/">
            About
          </a>
        </nav>
      </Footer>
      <Footer center className="bg-base-200 text-base-content border-t border-base-300 p-4">
        <aside>
          <p>Copyright © 2024 Acme Inc.</p>
        </aside>
      </Footer>
    </div>
  ),
};
