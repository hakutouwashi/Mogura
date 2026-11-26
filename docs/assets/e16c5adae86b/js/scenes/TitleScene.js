import { MODES, RIDDLE_GROUPS } from '../core/Modes.js';

export class TitleScene {
  constructor(context) { this.context = context; this.element = document.getElementById('title-scene'); }
  select(offset) {
    const index = MODES.findIndex(mode => mode.group === this.context.mode);
    this.context.mode = MODES[(index + offset + MODES.length) % MODES.length].group;
    this.updateSelection();
  }
  updateSelection() {
    const { riddles, settings, mode } = this.context;
    const selected = MODES.find(item => item.group === mode);
    const correct = riddles[mode]?.length || 0;
    const incorrect = RIDDLE_GROUPS.filter(group => group !== mode)
      .reduce((total, group) => total + (riddles[group]?.length || 0), 0);
    this.canStart = correct > 0 && incorrect > 0;
    document.getElementById('target-name').textContent = selected.label;
    const warning = document.getElementById('title-warning');
    warning.textContent = !correct
      ? `riddles/${mode} に画像を入れてください。`
      : !incorrect
        ? '正解以外の画像が必要です。ほかの riddles フォルダーに画像を入れてください。'
        : correct + incorrect <= settings.maxActive
          ? `画像が少ないため、同時表示時に同じ画像が出る場合があります。現在 ${correct + incorrect} 枚 / 同時表示 ${settings.maxActive} 枚`
          : '';
    warning.hidden = !warning.textContent;
    document.getElementById('start-button').disabled = !this.canStart;
  }
  enter() {
    this.element.hidden = false;
    this.updateSelection();
    this.onPrevious = () => this.select(-1);
    this.onNext = () => this.select(1);
    this.onKey = event => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.code === 'KeyZ' && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        event.preventDefault(); this.context.machine.change('OPTIONS');
      } else if (event.code === 'ArrowLeft' || /^(Digit|Numpad)[147]$/.test(event.code)) {
        event.preventDefault(); this.select(-1);
      } else if (event.code === 'ArrowRight' || /^(Digit|Numpad)[369]$/.test(event.code)) {
        event.preventDefault(); this.select(1);
      } else if (this.canStart &&
        (['Space', 'Enter'].includes(event.code) || /^(Digit|Numpad)[258]$/.test(event.code)) &&
        !(['Space', 'Enter'].includes(event.code) && event.target?.classList?.contains('mode-arrow'))) {
        event.preventDefault(); this.context.machine.change('PLAYING');
      }
    };
    this.onClick = () => { if (this.canStart) this.context.machine.change('PLAYING'); };
    window.addEventListener('keydown', this.onKey);
    document.getElementById('previous-target').addEventListener('click', this.onPrevious);
    document.getElementById('next-target').addEventListener('click', this.onNext);
    document.getElementById('start-button').addEventListener('click', this.onClick);
  }
  update() {}
  exit() {
    this.element.hidden = true;
    window.removeEventListener('keydown', this.onKey);
    document.getElementById('previous-target').removeEventListener('click', this.onPrevious);
    document.getElementById('next-target').removeEventListener('click', this.onNext);
    document.getElementById('start-button').removeEventListener('click', this.onClick);
  }
}
