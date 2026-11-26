import test from 'node:test';
import assert from 'node:assert/strict';
import { preloadImages } from '../renderer/js/game/preloadImages.js';

test('preloads and keeps images decoded before gameplay', async () => {
  const item = { id: 'mole/one.webp', url: 'riddle.webp' };
  let finishDecode;
  const image = {
    decode: () => new Promise(resolve => { finishDecode = resolve; })
  };
  const pending = preloadImages({ mole: [item] }, () => image);
  let finished = false;
  pending.then(() => { finished = true; });

  await Promise.resolve();
  assert.equal(finished, false);
  finishDecode();

  const { riddles, preloadedImages } = await pending;
  assert.deepEqual(riddles.mole, [item]);
  assert.equal(preloadedImages.get(item.url), image);
  assert.equal(image.src, item.url);
});
