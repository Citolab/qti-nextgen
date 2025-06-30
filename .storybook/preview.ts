import '../src/styles.css';
// https://github.com/storybookjs/storybook-addon-console/issues/83#issuecomment-2041107008
// import { withConsole } from '@storybook/addon-console';
import type { Preview } from '@storybook/web-components';

// import { setCustomElementsManifest } from '@storybook/web-components';
// import customElements from '../custom-elements.json';
// setCustomElementsManifest(customElements);

// import { withTests } from '@storybook/addon-jest';
// import results from '../.jest-test-results.json';

// import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
// import '@shoelace-style/shoelace/dist/components/tab/tab.js';
// import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';

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
