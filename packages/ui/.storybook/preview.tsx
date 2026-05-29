import type { Preview } from '@storybook/react';
import '../src/theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date/i,
      },
    },
  },
  decorators: [
    (Story) => {
      document.documentElement.setAttribute('data-theme', 'team-manager');
      return <Story />;
    },
  ],
};

export default preview;
