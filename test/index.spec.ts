import { describe, it, expect } from 'vitest';

describe('index', () => {
  it('noop', () => {
    expect('hello').toMatch('hello');
  });
});
