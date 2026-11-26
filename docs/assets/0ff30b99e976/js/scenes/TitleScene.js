export class TitleScene {
  constructor(context) { this.context = context; this.element = document.getElementById('title-scene'); }
  enter() {
    this.element.hidden = false;
    const { riddles, settings } = this.context;
    const warning = document.getElementById('title-warning');
    const count = riddles.mole.length + riddles.other.length;
    const missing = !riddles.mole.length || !riddles.other.length;
    warning.textContent = missing
      ? `画像が不足しています。riddles/mole と riddles/other の両方に画像を入れてください。現在: モグラ ${riddles.mole.length} 枚 / その他 ${riddles.other.length} 枚`
      : count <= settings.maxActive
        ? `画像が少ないため、同時表示時に同じ画像が出る場合があります。現在 ${count} 枚 / 同時表示 ${settings.maxActive} 枚`
        : '';
    warning.hidden = !warning.textContent;
    document.getElementById('start-button').disabled = missing;
    this.onKey = event => {
      if (event.repeat) return;
      if (event.code === 'KeyZ' && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        event.preventDefault(); this.context.machine.change('OPTIONS');
      } else if (!missing && !event.ctrlKey && !event.altKey && !event.metaKey &&
        (['Space', 'Enter'].includes(event.code) || /^(Digit|Numpad)[1-9]$/.test(event.code))) {
        event.preventDefault(); this.context.machine.change('PLAYING');
      }
    };
    this.onClick = () => { if (!missing) this.context.machine.change('PLAYING'); };
    window.addEventListener('keydown', this.onKey);
    document.getElementById('start-button').addEventListener('click', this.onClick);
  }
  update() {}
  exit() {
    this.element.hidden = true;
    window.removeEventListener('keydown', this.onKey);
    document.getElementById('start-button').removeEventListener('click', this.onClick);
  }
}
