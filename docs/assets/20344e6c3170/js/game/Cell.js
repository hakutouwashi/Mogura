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
    this.number = index + 1;
  }
  updateLabel() {
    this.element.setAttribute('aria-label', `${this.number}番のマス${this.state === 'ACTIVE' ? '、なぞが表示中' : ''}`);
  }
  spawn(riddle, lifetimeMs, now) {
    if (this.state !== 'EMPTY') return false;
    this.element.classList.remove('tapped');
    this.riddle = riddle;
    this.state = 'ACTIVE';
    this.image.src = riddle.url;
    this.image.hidden = false;
    this.element.dataset.state = 'active';
    this.updateLabel();
    this.frame.start(lifetimeMs, now);
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
    this.state = this.riddle.isMole ? 'HIT' : 'MISS';
    this.effectUntil = now + EFFECT_MS;
    this.element.dataset.state = this.state.toLowerCase();
    this.updateLabel();
    this.bus.emit(this.riddle.isMole ? 'riddle:hit' : 'riddle:miss',
      { index: this.index, riddle: this.riddle });
    return true;
  }
  update(now) {
    if (this.tapUntil && now >= this.tapUntil) {
      this.tapUntil = 0;
      this.element.classList.remove('tapped');
    }
    if (this.state === 'ACTIVE') this.frame.update(now);
    else if (this.state !== 'EMPTY' && now >= this.effectUntil) this.reset();
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
  reset() {
    this.frame.stop();
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
