import test from 'node:test';
import assert from 'node:assert/strict';
import { Cell } from '../renderer/js/game/Cell.js';

function createCell() {
  let finishDecode;
  const image = {
    hidden: true,
    decode: () => new Promise(resolve => { finishDecode = resolve; }),
    removeAttribute(name) { if (name === 'src') delete this.src; }
  };
  const path = { style: {} };
  const svg = { classList: { remove() {} }, querySelector: () => path };
  const element = {
    dataset: { state: 'empty' },
    classList: { remove() {} },
    querySelector: selector => selector === 'img' ? image : svg,
    querySelectorAll: () => [],
    setAttribute() {}
  };
  return { cell: new Cell(0, element, { emit() {} }), image, element, decode: () => finishDecode() };
}

test('the image and its time bar appear only after decoding', async () => {
  const { cell, image, element, decode } = createCell();
  cell.spawn({ url: 'riddle.webp', isCorrect: true }, 5000);
  cell.update(performance.now());
  assert.equal(cell.state, 'LOADING');
  assert.equal(image.hidden, true);
  assert.equal(element.dataset.state, 'empty');
  assert.equal(cell.frame.running, false);

  decode();
  await Promise.resolve();
  assert.equal(cell.state, 'ACTIVE');
  assert.equal(image.hidden, false);
  assert.equal(element.dataset.state, 'active');
  assert.equal(cell.frame.running, true);
});

test('decoding cannot reveal an image after the cell is reset', async () => {
  const { cell, image, element, decode } = createCell();
  cell.spawn({ url: 'riddle.webp', isCorrect: true }, 5000);
  cell.reset();
  decode();
  await Promise.resolve();
  assert.equal(cell.state, 'EMPTY');
  assert.equal(image.hidden, true);
  assert.equal(element.dataset.state, 'empty');
  assert.equal(cell.frame.running, false);
});
