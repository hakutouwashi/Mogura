export class GameTimer {
  constructor(durationMs, bus) { this.durationMs = durationMs; this.bus = bus; this.started = false; this.finished = false; }
  start(now) { this.startTime = now; this.started = true; this.finished = false; }
  remainingMs(now) { return Math.max(0, Math.min(this.durationMs, this.durationMs - (now - this.startTime))); }
  update(now) {
    if (!this.started || this.finished) return;
    if (this.remainingMs(now) <= 0) { this.finished = true; this.bus.emit('game:timeup'); }
  }
}
