/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

export default {
  plugins: [
    require('@tailwindcss/typography'),
    /* PK: created a plugin for the ::part psuedo selector which tailwind
    does not support out of the box, specific for webcomponents, could add slotted also
    usage : part-[selector]:bg-red-400
    */
    plugin(function ({ matchVariant }) {
      matchVariant(
        'part',
        (value) => {
          return `&::part(${value})`;
        }
      );
    }),
  ],
}



