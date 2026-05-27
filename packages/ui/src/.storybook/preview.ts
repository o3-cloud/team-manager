import type { Preview } from '@storybook/react';
import '../src/index.css';
import './a11y-overrides.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
      // Reads violations from addon-a11y and fails the test — avoids "Axe is already running" race
      test: 'error',
    },
  },
};

export default preview;
