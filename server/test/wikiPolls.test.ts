import { describe, it, expect } from 'vitest';
import { findHeaderIndex, parsePercent, normalizeDate } from '../src/adapters/wikiPolls.js';

describe('wikiPolls helpers', () => {
  it('findHeaderIndex finds candidate', () => {
    const idx = findHeaderIndex(['date', 'pollster', 'Ap'], ['date', 'fieldwork']);
    expect(idx).toBe(0);
  });

  it('parsePercent handles commas and dashes', () => {
    expect(parsePercent('23,5%')).toBeCloseTo(23.5, 1);
    expect(parsePercent('—')).toBeNull();
    expect(parsePercent('')).toBeNull();
  });

  it('normalizeDate parses full and partial dates', () => {
    expect(normalizeDate('1 Sep 2021 – 3 Sep 2021', 2021)).toBe('2021-09-01');
    const ym = normalizeDate('Sep 2021', 2021);
    expect(ym?.startsWith('2021-')).toBe(true);
  });
});
