import { MODES, RIDDLE_GROUPS } from '../core/Modes.js';

export class TitleScene {
  constructor(context) {
    this.context = context;
    this.element = document.getElementById('title-scene');
    this.board = document.getElementById('title-board');
  }
  select(offset) {
    const index = MODES.findIndex(mode => mode.group === this.context.mode);
    this.context.mode = MODES[(index + offset + MODES.length) % MODES.length].group;
    this.updateSelection();
    this.board.classList.remove('title-switch-previous', 'title-switch-next');
    void this.board.offsetWidth;
    this.board.classList.add(offset < 0 ? 'title-switch-previous' : 'title-switch-next');
  }
  updateSelection() {
    const { riddles, settings, mode } = this.context;
    const index = MODES.findIndex(item => item.group === mode);
    const selected = MODES[index];
    const previous = MODES[(index - 1 + MODES.length) % MODES.length];
    const next = MODES[(index + 1) % MODES.length];
    const correct = riddles[mode]?.length || 0;
    const incorrect = RIDDLE_GROUPS.filter(group => group !== mode)
      .reduce((total, group) => total + (riddles[group]?.length || 0), 0);
    this.canStart = correct > 0 && incorrect > 0;
    document.getElementById('target-name').textContent = selected.label;
    document.getElementById('previous-target-name').textContent = previous.label;
    document.getElementById('next-target-name').textContent = next.label;
    const warning = document.getElementById('title-warning');
    warning.textContent = !correct
      ? `riddles/${mode} に画像を入れてください。`
      : !incorrect
        ? '正解以外の画像が必要です。ほかの riddles フォルダーに画像を入れてください。'
        : correct + incorrect <= settings.maxActive
          ? `画像が少ないため、同時表示時に同じ画像が出る場合があります。現在 ${correct + incorrect} 枚 / 同時表示 ${settings.maxActive} 枚`
          : '';
    warning.hidden = !warning.textContent;
    this.board.querySelectorAll('[data-title-action]').forEach(button => {
      const action = button.dataset.titleAction;
      if (action === 'start') button.disabled = !this.canStart;
      button.setAttribute('aria-label', action === 'start'
        ? `${selected.label}でゲームをはじめる`
        : `${action === 'previous' ? previous.label : next.label}にきりかえる`);
    });
  }
  enter() {
    this.element.hidden = false;
    this.updateSelection();
    this.onBoardClick = event => {
      const button = event.target.closest('[data-title-action]');
      if (!button || !this.board.contains(button) || button.disabled) return;
      if (button.dataset.titleAction === 'previous') this.select(-1);
      else if (button.dataset.titleAction === 'next') this.select(1);
      else if (this.canStart) this.context.machine.change('PLAYING');
    };
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
        !(['Space', 'Enter'].includes(event.code) && event.target?.closest?.('[data-title-action]'))) {
        event.preventDefault(); this.context.machine.change('PLAYING');
      }
    };
    window.addEventListener('keydown', this.onKey);
    this.board.addEventListener('click', this.onBoardClick);
  }
  update() {}
  exit() {
    this.element.hidden = true;
    window.removeEventListener('keydown', this.onKey);
    this.board.removeEventListener('click', this.onBoardClick);
  }
}
