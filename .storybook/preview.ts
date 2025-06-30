import '../src/styles.css';
// https://github.com/storybookjs/storybook-addon-console/issues/83#issuecomment-2041107008
// import { withConsole } from '@storybook/addon-console';
import type { Preview } from '@storybook/web-components-vite';

// import { setCustomElementsManifest } from '@storybook/web-components-vite';
// import customElements from '../custom-elements.json';
// setCustomElementsManifest(customElements);

export const decorators = [
  // withTests({
  //   results,
  // }),
];

const preview: Preview = {
  globalTypes: {
    pseudo: {}
  }
  // decorators: [(Story, context) => withConsole()(Story)(context)]
};

export default preview;
