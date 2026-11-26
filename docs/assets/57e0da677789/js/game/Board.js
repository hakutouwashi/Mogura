import { Cell } from './Cell.js';

export class Board {
  constructor(element, bus) {
    this.element = element;
    this.cells = Array.from({ length: 9 }, (_, index) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.cellIndex = String(index);
      cell.dataset.state = 'empty';
      cell.setAttribute('aria-label', `${index + 1}番のマス`);
      cell.innerHTML = `<img alt="" hidden draggable="false"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M 50 2.5 H 97.5 V 97.5 H 2.5 V 2.5 H 50" pathLength="380"/></svg>`;
      element.append(cell);
      return new Cell(index, cell, bus);
    });
  }
  update(now) { this.cells.forEach(cell => cell.update(now)); }
  reset() { this.cells.forEach(cell => cell.reset()); }
  setKeyLayout(layout) {
    this.cells.forEach((cell, index) => {
      const number = layout === 'phone'
        ? (2 - Math.floor(index / 3)) * 3 + index % 3 + 1
        : index + 1;
      cell.number = number;
      cell.updateLabel();
    });
  }
  get active() { return this.cells.filter(cell => cell.state === 'ACTIVE'); }
  get empty() { return this.cells.filter(cell => cell.state === 'EMPTY'); }
}
