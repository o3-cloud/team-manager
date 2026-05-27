import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { List, ListCol, ListRow } from "./List";

const meta: Meta = {
  title: "Components/List",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const SimpleList: Story = {
  render: () => (
    <List className="bg-base-100 rounded-box shadow-md w-80">
      <ListRow>
        <ListCol grow>Item one</ListCol>
        <ListCol>Action</ListCol>
      </ListRow>
      <ListRow>
        <ListCol grow>Item two</ListCol>
        <ListCol>Action</ListCol>
      </ListRow>
      <ListRow>
        <ListCol grow>Item three</ListCol>
        <ListCol>Action</ListCol>
      </ListRow>
    </List>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const itemOne = canvas.getByText("Item one");
    await expect(itemOne).toBeInTheDocument();
    const itemTwo = canvas.getByText("Item two");
    await expect(itemTwo).toBeInTheDocument();
    const itemThree = canvas.getByText("Item three");
    await expect(itemThree).toBeInTheDocument();
    // Display-only component — no focusable elements, keyboard focus N/A
    await userEvent.click(itemOne);
  },
};

export const WithAvatar: Story = {
  render: () => (
    <List className="bg-base-100 rounded-box shadow-md w-96">
      {["Alice", "Bob", "Carol"].map((name) => (
        <ListRow key={name}>
          <ListCol>
            <div className="avatar">
              <div className="rounded-full w-10 h-10 bg-primary flex items-center justify-center text-primary-content font-bold">
                {name[0]}
              </div>
            </div>
          </ListCol>
          <ListCol grow>
            <div className="font-semibold">{name}</div>
            <div className="text-xs text-base-content/60">Member</div>
          </ListCol>
          <ListCol>
            <button type="button" className="btn btn-ghost btn-xs">
              Follow
            </button>
          </ListCol>
        </ListRow>
      ))}
    </List>
  ),
};

export const WithWrappedCol: Story = {
  render: () => (
    <List className="bg-base-100 rounded-box shadow-md w-80">
      <ListRow>
        <ListCol grow>Main title</ListCol>
        <ListCol>Badge</ListCol>
        <ListCol wrap>
          <span className="text-xs text-base-content/60">Subtitle that wraps to a new row</span>
        </ListCol>
      </ListRow>
      <ListRow>
        <ListCol grow>Another title</ListCol>
        <ListCol>Badge</ListCol>
        <ListCol wrap>
          <span className="text-xs text-base-content/60">Another subtitle</span>
        </ListCol>
      </ListRow>
    </List>
  ),
};
