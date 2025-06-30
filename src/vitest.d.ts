import 'vitest';

interface CustomMatchers<R = unknown> {
  toMatchXml: () => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {
    toMatchXml(expected: string): T;
  }
}
