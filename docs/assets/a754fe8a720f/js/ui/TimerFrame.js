export class TimerFrame {
  constructor(svgElement) {
    this.svg = svgElement;
    this.rect = svgElement.querySelector('path');
    this.perimeter = 4 * 95;
    this.rect.style.strokeDasharray = String(this.perimeter);
    this.onComplete = null;
    this.running = false;
  }
  start(lifetimeMs, now) {
    this.startTime = now;
    this.lifetimeMs = lifetimeMs;
    this.running = true;
    this.svg.classList.remove('urgent');
    this.rect.style.strokeDashoffset = '0';
    this.rect.style.stroke = 'var(--timer-yellow)';
  }
  update(now) {
    if (!this.running) return;
    const progress = Math.max(0, Math.min(1, (now - this.startTime) / this.lifetimeMs));
    this.rect.style.strokeDashoffset = String(this.perimeter * progress);
    this.rect.style.stroke = progress < 0.55 ? 'var(--timer-yellow)'
      : progress < 0.8 ? 'var(--timer-orange)' : 'var(--accent)';
    this.svg.classList.toggle('urgent', progress >= 0.8);
    if (progress >= 1) { this.running = false; this.onComplete?.(); }
  }
  stop() {
    this.running = false;
    this.svg.classList.remove('urgent');
    this.rect.style.strokeDashoffset = String(this.perimeter);
    this.rect.style.stroke = 'none';
  }
}
