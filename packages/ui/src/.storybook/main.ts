import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // Storybook 10 absorbs `addon-essentials` and `addon-interactions` into core.
  addons: ['@storybook/addon-a11y', '@storybook/addon-coverage'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
