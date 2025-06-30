/** @type {import('tailwindcss').Config} */
/* eslint-env node */

/* 
This config is only used to develop the theme in the story. 
This css file imports this configuration '@config "../../tailwind.config.theme.cjs"'
and watches the classes used in the *.stories.ts for developing the UI components
*/
const tailwindconfig = require('./tailwind.config.cjs')

/* PK: extend the default config with content of the themes storie */
export default {
  ...tailwindconfig,
  content: ['src/**/*.stories.ts']
}
