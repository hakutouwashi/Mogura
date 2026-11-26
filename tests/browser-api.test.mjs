import test from 'node:test';
import assert from 'node:assert/strict';

test('browser riddle URLs use the Unicode form served by GitHub Pages', async () => {
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    fetch: globalThis.fetch
  };
  const name = 'あなご_本_v1.webp';
  globalThis.window = {};
  globalThis.document = { baseURI: 'https://example.com/Mogura/' };
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ mole: [], fish: [name], fruit: [], other: [] })
  });
  try {
    await import('../renderer/js/browserApi.js');
    const riddles = await window.api.getRiddles();
    assert.equal(riddles.fish[0].id, `fish/${name}`);
    assert.equal(riddles.fish[0].url,
      `https://example.com/Mogura/riddles/fish/${encodeURIComponent(name.normalize('NFC'))}`);
  } finally {
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.fetch = previous.fetch;
  }
});
