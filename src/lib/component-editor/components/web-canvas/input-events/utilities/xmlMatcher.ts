import { expect } from 'vitest';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser();

expect.extend({
  toMatchXml(received, expected) {
    const parsedReceived = parser.parse(received);
    const parsedExpected = parser.parse(expected);

    const pass = this.equals(parsedReceived, parsedExpected);
    if (pass) {
      return {
        message: () => `expected ${received} not to match XML ${expected}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to match XML ${expected}`,
        pass: false,
      };
    }
  },
});