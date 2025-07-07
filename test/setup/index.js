import { expect as expectInVitest } from 'vitest';
import { expect as expectInStorybook } from 'storybook/test';

import { toEqualXml } from './toEqualXml';

export const customMatchers = {
  toEqualXml
};

expectInVitest.extend(customMatchers);
expectInStorybook.extend(customMatchers);
