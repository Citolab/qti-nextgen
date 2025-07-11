/* eslint-disable import/no-nodejs-modules */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// import viteConfig from './vite.config';

export default defineConfig({
  base: process.env.VITEST ? undefined : './src',

  test: {
    browser: {
      headless: false,
      screenshotFailures: false,
    },
    coverage: {
      include: ['src/lib/component-editor/web-canvas/input-events/**/*.ts'],
      provider: 'v8' // or 'v8'
    },
    onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
      return !log.includes('Lit is in dev mode');
    },
    // dangerouslyIgnoreUnhandledErrors: true,
    // PK: Debugging browser mode does not work as expected, stalls with those options
    // see https://vitest.dev/guide/debugging#browser-mode for more info
    // inspectBrk: true,
    // fileParallelism: false,

    projects: [
      /*
      {
        plugins: [
          storybookTest({
            tags: {
              // include: ['test'],
              exclude: ['skip-test', 'no-tests']
            },
            // The location of your Storybook config, main.js|ts
            configDir: path.join(dirname, '.storybook'),
            // This should match your package.json script to run Storybook
            // The --ci flag will skip prompts and not open a browser
            storybookScript: 'npm run storybook -- --ci'
          })
        ],
        test: {
          name: 'stories',
          setupFiles: ['./.storybook/vitest.setup.ts'],
          globals: true,
          includeTaskLocation: true,
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true,
            instances: [
              {
                browser: 'chromium',
                headless: true // Both modes work fine
                // provide: {
                //   launch: {
                //     args: ['--remote-debugging-port=9222']
                //   }
                // }
              }
            ]
          }
        }
      },
      */
      /* this is for the normal spec files, which do not need storybook */
      {
        test: {
          name: 'tests',
          setupFiles: ['./test/setup/index.js'],
          include: [
            'src/lib/component-editor/components/web-canvas/input-events/**/*.spec.ts',
            'src/lib/component-editor/components/web-canvas/input-events/**/*.test.ts'
          ],
          globals: true,
          includeTaskLocation: true,
          browser: {
            enabled: true,
            provider: 'playwright',
            headless: true, // Both modes work fine
            viewport: { width: 320, height: 568 },
            instances: [{browser: 'chromium'},
            ]
          }
        }
      }
    ]
  }
});
