export class SpawnController {
  constructor(board, settings, picker, random = Math.random, easing = t => t) {
    Object.assign(this, { board, settings, picker, random, easing });
    this.durationMs = settings.gameDurationSec * 1000;
    this.lastCell = -1;
  }
  start(now) { this.startTime = now; this.lastSpawn = now - this.settings.spawnIntervalStartSec * 1000 + 500; this.lastCell = -1; }
  getIntervalMs(elapsedMs) {
    const t = Math.max(0, Math.min(1, elapsedMs / this.durationMs));
    return (this.settings.spawnIntervalStartSec +
      (this.settings.spawnIntervalMinSec - this.settings.spawnIntervalStartSec) * this.easing(t)) * 1000;
  }
  update(now) {
    const intervalMs = this.getIntervalMs(now - this.startTime);
    if (now - this.lastSpawn < intervalMs) return;
    if (this.board.active.length >= this.settings.maxActive) return;
    let empty = this.board.empty;
    const available = empty.filter(cell => now - cell.lastClearedAt >= intervalMs);
    if (available.length) empty = available;
    else if (this.settings.maxActive !== 9 || empty.length !== 1 || this.board.active.length !== 8) return;
    if (empty.length > 1) empty = empty.filter(cell => cell.index !== this.lastCell);
    if (!empty.length) return;
    const cell = empty[Math.floor(this.random() * empty.length)];
    const active = this.board.active;
    const riddle = this.picker.pick(active.map(item => item.riddle.id),
      !active.some(item => item.riddle.isMole));
    if (!riddle) return;
    cell.spawn(riddle, this.settings.riddleLifetimeSec * 1000, now);
    this.lastCell = cell.index;
    this.lastSpawn = now;
  }
}
