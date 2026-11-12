import { act } from 'react';
import { expect, test, vi } from 'vitest';

test('the browser entry mounts a usable initial screen without calendar data', async () => {
  document.body.innerHTML = '<div id="root"></div>';
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('indexedDB', undefined);
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline test')));

  await act(async () => {
    await import('./main');
  });

  const main = document.querySelector('main');
  expect(main).not.toBeNull();
  expect(main?.querySelectorAll('h1')).toHaveLength(1);
  expect(main?.textContent).toContain('This calendar data is not saved here.');
  const skipLink = document.querySelector<HTMLAnchorElement>('a');
  expect(skipLink?.getAttribute('href')).toBe(`#${main?.id}`);
  expect(main?.tabIndex).toBe(-1);
  vi.unstubAllGlobals();
});
