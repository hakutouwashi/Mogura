import test from 'node:test';
import assert from 'node:assert/strict';
import { SpawnController } from '../renderer/js/game/SpawnController.js';

test('spawns again when the board has no visible riddles', () => {
  const spawned = [];
  const cell = {
    index: 0,
    lastClearedAt: -Infinity,
    spawn(riddle) { spawned.push(riddle.id); }
  };
  const board = { active: [], empty: [cell] };
  const settings = {
    gameDurationSec: 60,
    spawnIntervalStartSec: 2,
    spawnIntervalMinSec: 2,
    maxActive: 3,
    moleRatioPercent: 60,
    riddleLifetimeSec: 5
  };
  const picker = { pick: () => ({ id: 'mole/one.webp', isCorrect: true }) };
  const spawner = new SpawnController(board, settings, picker, () => 0);

  spawner.start(0);
  spawner.update(500);
  assert.equal(spawned.length, 1);

  board.active = [{ riddle: { id: 'mole/one.webp' } }];
  board.empty = [];
  spawner.update(700);
  assert.equal(spawned.length, 1);

  board.active = [];
  board.empty = [cell];
  cell.lastClearedAt = 750;
  spawner.update(800);
  assert.equal(spawned.length, 2);
});
