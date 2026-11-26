export class ScoreManager {
  constructor(allowNegative = false) { this.allowNegative = allowNegative; this.reset(); }
  add(points) { this.value = this.allowNegative ? this.value + points : Math.max(0, this.value + points); return this.value; }
  get total() { return this.value; }
  reset() { this.value = 0; }
}
