import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/server/data', () => ({
  getServerProducts: vi.fn(async () => [
    { slug: 'panel', updated_at: '2026-10-20T12:00:00Z' },
    { slug: 'battery', updated_at: null },
    { slug: 'inverter', updated_at: 'invalid' },
  ]),
}));
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  it('lists canonical pages without filters or invented modification dates', async () => {
    const entries = await sitemap();
    expect(entries).toHaveLength(10);
    expect(entries.every(({ url }) => !url.includes('?'))).toBe(true);
    expect(entries[0].lastModified).toBeUndefined();
    expect(entries[7].lastModified).toEqual(new Date('2026-10-20T12:00:00Z'));
    expect(entries[8].lastModified).toBeUndefined();
    expect(entries[9].lastModified).toBeUndefined();
  });
});
