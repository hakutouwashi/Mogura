export class SpawnController {
  constructor(board, settings, picker, random = Math.random, easing = t => t) {
    Object.assign(this, { board, settings, picker, random, easing });
    this.durationMs = settings.gameDurationSec * 1000;
    this.lastCell = -1;
    this.wrongStreak = 0;
  }
  start(now) { this.startTime = now; this.lastSpawn = now - this.settings.spawnIntervalStartSec * 1000 + 500; this.lastCell = -1; this.wrongStreak = 0; }
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
    const baseRatio = this.settings.moleRatioPercent / 100;
    const progress = Math.min(1, this.wrongStreak / Math.max(1, this.settings.maxActive - 1));
    const correctRatio = baseRatio + (1 - baseRatio) * progress;
    const riddle = this.picker.pick(this.board.active.map(item => item.riddle.id), correctRatio);
    if (!riddle) return;
    cell.spawn(riddle, this.settings.riddleLifetimeSec * 1000);
    this.wrongStreak = riddle.isCorrect ? 0 : this.wrongStreak + 1;
    this.lastCell = cell.index;
    this.lastSpawn = now;
  }
}
