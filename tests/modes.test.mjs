import test from 'node:test';
import assert from 'node:assert/strict';
import { RiddlePicker } from '../renderer/js/game/RiddlePicker.js';
import { TitleScene } from '../renderer/js/scenes/TitleScene.js';
import { MODES, RIDDLE_GROUPS } from '../renderer/js/core/Modes.js';

const images = Object.fromEntries(RIDDLE_GROUPS.map(group => [group, [{ id: `${group}/01.webp` }]]));

test('each mode marks only its own images as correct', () => {
  for (const { group } of MODES) {
    const picker = new RiddlePicker(images, group, 100, () => 0);
    assert.equal(picker.pick().id, `${group}/01.webp`);
    assert.equal(picker.pick().isCorrect, true);
    assert.deepEqual(
      picker.groups.incorrect.map(image => image.id).sort(),
      RIDDLE_GROUPS.filter(item => item !== group).map(item => `${item}/01.webp`).sort()
    );
    const wrong = new RiddlePicker(images, group, 0, () => 0).pick();
    assert.equal(wrong.isCorrect, false);
    assert.notEqual(wrong.id, `${group}/01.webp`);
  }
});

test('title keys switch modes and block starting without selected images', () => {
  const elements = Object.fromEntries(
    ['title-scene', 'title-warning', 'target-name', 'previous-target-name', 'next-target-name',
      'start-button', 'previous-target', 'next-target', 'title-board']
      .map(id => [id, {
        hidden: true, disabled: false, textContent: '', listeners: {},
        setAttribute(name, value) { this[name] = value; },
        addEventListener(type, handler) { this.listeners[type] = handler; },
        removeEventListener(type) { delete this.listeners[type]; }
      }])
  );
  elements['title-board'].classList = { add() {}, remove() {} };
  elements['title-board'].querySelectorAll = selector => selector === '[data-title-action]'
    ? [elements['previous-target'], elements['start-button'], elements['next-target']] : [];
  elements['title-board'].contains = button => Object.values(elements).includes(button);
  elements['previous-target'].dataset = { titleAction: 'previous' };
  elements['next-target'].dataset = { titleAction: 'next' };
  elements['start-button'].dataset = { titleAction: 'start' };
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const keyListeners = {};
  globalThis.document = { getElementById: id => elements[id] };
  globalThis.window = {
    addEventListener(type, handler) { keyListeners[type] = handler; },
    removeEventListener(type) { delete keyListeners[type]; }
  };
  const changes = [];
  const context = {
    mode: 'mole',
    riddles: { mole: images.mole, fish: [], fruit: [], other: images.other },
    settings: { maxActive: 3 },
    machine: { change: scene => changes.push(scene) }
  };
  const scene = new TitleScene(context);
  const press = code => keyListeners.keydown({
    code, repeat: false, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
    preventDefault() {}
  });
  try {
    scene.enter();
    assert.equal(elements['target-name'].textContent, 'もぐら');
    assert.equal(elements['previous-target-name'].textContent, 'くだもの');
    assert.equal(elements['next-target-name'].textContent, 'さかな');
    for (const code of ['Digit3', 'Digit6', 'Numpad9']) {
      context.mode = 'mole';
      press(code);
      assert.equal(context.mode, 'fish');
      assert.equal(elements['target-name'].textContent, 'さかな');
      assert.equal(elements['next-target-name'].textContent, 'くだもの');
      assert.equal(elements['start-button'].disabled, true);
      press('Digit2');
      elements['title-board'].listeners.click({ target: {
        closest: () => elements['start-button']
      } });
      assert.deepEqual(changes, []);
    }
    for (const code of ['Digit1', 'Digit4', 'Numpad7']) {
      context.mode = 'mole';
      press(code);
      assert.equal(context.mode, 'fruit');
      assert.equal(elements['start-button'].disabled, true);
    }
    context.riddles.fish = images.fish;
    press('ArrowRight');
    assert.equal(context.mode, 'mole');
    press('Digit3');
    assert.equal(context.mode, 'fish');
    assert.equal(elements['start-button'].disabled, false);
    press('Numpad5');
    assert.deepEqual(changes, ['PLAYING']);
    elements['title-board'].listeners.click({ target: {
      closest: () => elements['next-target']
    } });
    assert.equal(context.mode, 'fruit');
  } finally {
    scene.exit();
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});
