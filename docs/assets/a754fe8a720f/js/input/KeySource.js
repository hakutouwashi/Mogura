export class KeySource {
  constructor(getSettings) { this.getSettings = getSettings; }
  attach(emit) {
    this.handler = event => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      if (!/^(Digit|Numpad)[1-9]$/.test(event.code)) return;
      event.preventDefault();
      if (document.activeElement?.classList?.contains('cell')) document.activeElement.blur();
      const digit = Number(event.code.at(-1));
      const index = this.getSettings().keyLayout === 'phone'
        ? Math.floor((9 - digit) / 3) * 3 + (digit - 1) % 3 : digit - 1;
      emit(index);
    };
    window.addEventListener('keydown', this.handler);
  }
  detach() { window.removeEventListener('keydown', this.handler); }
}
