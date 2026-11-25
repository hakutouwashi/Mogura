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
    if (now - this.lastSpawn < this.getIntervalMs(now - this.startTime)) return;
    if (this.board.active.length >= this.settings.maxActive) return;
    let empty = this.board.empty;
    if (empty.length > 1) empty = empty.filter(cell => cell.index !== this.lastCell);
    if (!empty.length) return;
    const cell = empty[Math.floor(this.random() * empty.length)];
    const riddle = this.picker.pick(this.board.active.map(item => item.riddle.id));
    if (!riddle) return;
    cell.spawn(riddle, this.settings.riddleLifetimeSec * 1000, now);
    this.lastCell = cell.index;
    this.lastSpawn = now;
  }
}
