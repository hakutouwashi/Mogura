export class ScoreDisplay {
  constructor(element) { this.element = element; }
  set(value) { this.element.textContent = Math.round(value).toLocaleString('ja-JP'); }
  react(correct) {
    const stat = this.element.closest('.score-stat');
    stat.classList.remove('score-up', 'score-down');
    void stat.offsetWidth;
    stat.classList.add(correct ? 'score-up' : 'score-down');
  }
}
