export class MouseSource {
  constructor(boardElement) { this.boardElement = boardElement; }
  attach(emit) {
    const strike = event => {
      const cell = event.target.closest('[data-cell-index]');
      if (cell && this.boardElement.contains(cell)) emit(Number(cell.dataset.cellIndex));
    };
    this.handler = strike;
    this.keyboardClick = event => { if (event.detail === 0) strike(event); };
    this.boardElement.addEventListener('pointerdown', this.handler);
    this.boardElement.addEventListener('click', this.keyboardClick);
  }
  detach() {
    this.boardElement.removeEventListener('pointerdown', this.handler);
    this.boardElement.removeEventListener('click', this.keyboardClick);
  }
}
