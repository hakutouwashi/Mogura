export class ResultScene {
  constructor(context) { this.context = context; this.element = document.getElementById('result-scene'); }
  enter({ score = 0 } = {}) {
    this.element.hidden = false;
    this.score = score;
    this.startTime = performance.now();
    this.scoreElement = document.getElementById('result-score');
    this.scoreElement.textContent = '0';
    this.onKey = event => {
      if (!event.repeat && !event.ctrlKey && !event.altKey && event.target.tagName !== 'BUTTON' && ['Space', 'Enter'].includes(event.code)) {
        event.preventDefault(); this.context.machine.change('TITLE');
      }
    };
    this.onClick = () => this.context.machine.change('TITLE');
    window.addEventListener('keydown', this.onKey);
    this.element.addEventListener('click', this.onClick);
  }
  update(now) {
    const settings = this.context.settings;
    const countMs = settings.resultCountUpSec * 1000;
    const progress = countMs ? Math.min(1, (now - this.startTime) / countMs) : 1;
    this.scoreElement.textContent = Math.round(this.score * (1 - (1 - progress) ** 3)).toLocaleString('ja-JP');
    const returnMs = settings.resultAutoReturnSec * 1000;
    if (returnMs && now - this.startTime >= returnMs) this.context.machine.change('TITLE');
  }
  exit() {
    window.removeEventListener('keydown', this.onKey);
    this.element.removeEventListener('click', this.onClick);
    this.element.hidden = true;
  }
}
