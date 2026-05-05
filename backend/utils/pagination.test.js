const { parsePagination, buildPageMeta } = require('./pagination');

describe('parsePagination', () => {
  test('returns defaults when query is empty', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });

  test('parses valid page and limit from strings', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({
      page: 3,
      limit: 10,
      skip: 20
    });
  });

  test('clamps invalid (negative/zero) values to safe minimums', () => {
    expect(parsePagination({ page: '-5', limit: '0' })).toEqual({
      page: 1,
      limit: 1,
      skip: 0
    });
  });

  test('caps limit at 100 to prevent huge requests', () => {
    const result = parsePagination({ limit: '5000' });
    expect(result.limit).toBe(100);
  });

  test('falls back to defaults when values are non-numeric', () => {
    expect(parsePagination({ page: 'abc', limit: 'xyz' })).toEqual({
      page: 1,
      limit: 20,
      skip: 0
    });
  });
});

describe('buildPageMeta', () => {
  test('computes total pages correctly', () => {
    expect(buildPageMeta(45, 1, 20)).toEqual({
      total: 45,
      page: 1,
      pages: 3,
      limit: 20
    });
  });

  test('returns at least 1 page when there are zero records', () => {
    expect(buildPageMeta(0, 1, 20).pages).toBe(1);
  });

  test('rounds up partial pages', () => {
    expect(buildPageMeta(21, 1, 20).pages).toBe(2);
  });
});
