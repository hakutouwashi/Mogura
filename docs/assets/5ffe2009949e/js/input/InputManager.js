export class InputManager {
  constructor(bus) { this.bus = bus; this.sources = []; }
  registerSource(source) { this.sources.push(source); }
  start() { for (const source of this.sources) source.attach(index => this.bus.emit('cell:hit', { index })); }
  stop() { for (const source of this.sources) source.detach(); }
}
