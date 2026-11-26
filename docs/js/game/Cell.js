import { TimerFrame } from '../ui/TimerFrame.js';

const EFFECT_MS = 380;
const EMPTY_TAP_MS = 130;
export class Cell {
  constructor(index, element, bus) {
    this.index = index;
    this.element = element;
    this.bus = bus;
    this.image = element.querySelector('img');
    this.frame = new TimerFrame(element.querySelector('svg'));
    this.frame.onComplete = () => this.expire();
    this.state = 'EMPTY';
    this.riddle = null;
    this.effectUntil = 0;
    this.tapUntil = 0;
    this.lastClearedAt = -Infinity;
    this.number = index + 1;
    this.spawnToken = 0;
  }
  updateLabel() {
    this.element.setAttribute('aria-label', `${this.number}番のマス${this.state === 'ACTIVE' ? '、なぞが表示中' : ''}`);
  }
  spawn(riddle, lifetimeMs) {
    if (this.state !== 'EMPTY') return false;
    this.element.classList.remove('tapped');
    this.riddle = riddle;
    this.state = 'LOADING';
    const token = ++this.spawnToken;
    this.image.src = riddle.url;
    this.image.decode().then(() => {
      if (this.spawnToken !== token || this.state !== 'LOADING') return;
      this.state = 'ACTIVE';
      this.image.hidden = false;
      this.frame.start(lifetimeMs, performance.now());
      this.element.dataset.state = 'active';
      this.updateLabel();
    }).catch(() => {
      if (this.spawnToken === token && this.state === 'LOADING') this.reset(performance.now());
    });
    return true;
  }
  hit(now) {
    if (this.state === 'EMPTY') {
      this.tapUntil = now + EMPTY_TAP_MS;
      this.element.classList.remove('tapped');
      void this.element.offsetWidth;
      this.element.classList.add('tapped');
      return false;
    }
    if (this.state !== 'ACTIVE') return false;
    this.frame.stop();
    this.state = this.riddle.isCorrect ? 'HIT' : 'MISS';
    this.effectUntil = now + EFFECT_MS;
    this.element.dataset.state = this.state.toLowerCase();
    this.updateLabel();
    this.bus.emit(this.riddle.isCorrect ? 'riddle:hit' : 'riddle:miss',
      { index: this.index, riddle: this.riddle });
    return true;
  }
  update(now) {
    if (this.tapUntil && now >= this.tapUntil) {
      this.tapUntil = 0;
      this.element.classList.remove('tapped');
    }
    if (this.state === 'ACTIVE') this.frame.update(now);
    else if (this.state === 'LOADING') return;
    else if (this.state !== 'EMPTY' && now >= this.effectUntil) this.reset(now);
  }
  expire() {
    if (this.state !== 'ACTIVE') return;
    this.state = 'EXPIRED';
    this.effectUntil = performance.now() + EFFECT_MS;
    this.element.dataset.state = 'expired';
    this.updateLabel();
    this.bus.emit('riddle:expired', { index: this.index, riddle: this.riddle });
  }
  showPoints(points) {
    const popup = document.createElement('span');
    popup.className = `point-popup ${points >= 0 ? 'positive' : 'negative'}`;
    popup.textContent = `${points >= 0 ? '+' : '−'}${Math.abs(points)}`;
    this.element.append(popup);
    popup.addEventListener('animationend', () => popup.remove(), { once: true });
  }
  reset(now) {
    this.spawnToken++;
    this.frame.stop();
    this.lastClearedAt = now ?? -Infinity;
    this.state = 'EMPTY';
    this.riddle = null;
    this.effectUntil = 0;
    this.tapUntil = 0;
    this.element.classList.remove('tapped');
    this.element.dataset.state = 'empty';
    this.updateLabel();
    this.image.hidden = true;
    this.image.removeAttribute('src');
    this.element.querySelectorAll('.point-popup').forEach(node => node.remove());
  }
}
