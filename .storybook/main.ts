import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';
import * as tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {}
  },
  docs: {},
  
  // viteFinal: async config => {
  //   return {
  //     ...config,
  //     optimizeDeps: {
  //       ...config.optimizeDeps
  //     },
  //     plugins: [...config.plugins!, tsconfigPaths.default()],
  //     resolve: { ...config.resolve, alias: { ...config!.resolve!.alias, path: require.resolve('path-browserify') } }
  //   };
  // }
};
export default config;
