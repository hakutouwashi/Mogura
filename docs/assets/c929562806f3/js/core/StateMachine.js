export class StateMachine {
  constructor() { this.scenes = new Map(); this.current = null; this.name = null; }
  register(name, scene) { this.scenes.set(name, scene); }
  change(name, params) {
    const next = this.scenes.get(name);
    if (!next) throw new Error(`Unknown scene: ${name}`);
    this.current?.exit();
    this.current = next;
    this.name = name;
    next.enter(params);
  }
  update(now) { this.current?.update(now); }
}
