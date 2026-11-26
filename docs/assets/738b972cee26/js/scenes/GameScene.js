import { Board } from '../game/Board.js';
import { GameTimer } from '../game/GameTimer.js';
import { RiddlePicker } from '../game/RiddlePicker.js';
import { ScoreManager } from '../game/ScoreManager.js';
import { SpawnController } from '../game/SpawnController.js';
import { InputManager } from '../input/InputManager.js';
import { MouseSource } from '../input/MouseSource.js';
import { KeySource } from '../input/KeySource.js';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';

export class GameScene {
  constructor(context) {
    this.context = context;
    this.element = document.getElementById('game-scene');
    this.board = new Board(document.getElementById('board'), context.bus);
    this.scoreDisplay = new ScoreDisplay(document.getElementById('score-value'));
  }
  enter() {
    this.element.hidden = false;
    this.element.classList.add('playing');
    const { settings, riddles, bus } = this.context;
    this.board.reset();
    this.board.setKeyLayout(settings.keyLayout);
    this.score = new ScoreManager(settings.allowNegativeScore);
    this.scoreDisplay.set(0);
    this.timer = new GameTimer(settings.gameDurationSec * 1000, bus);
    this.spawner = new SpawnController(this.board, settings,
      new RiddlePicker(riddles, settings.moleRatioPercent));
    const now = performance.now();
    this.timer.start(now);
    this.spawner.start(now);
    this.timeElement = document.getElementById('time-value');
    this.timeElement.textContent = String(settings.gameDurationSec);
    this.timeElement.classList.remove('low');
    this.input = new InputManager(bus);
    this.input.registerSource(new MouseSource(this.board.element));
    this.input.registerSource(new KeySource(() => this.context.settings));
    this.input.start();
    this.onLeave = () => this.context.machine.change('TITLE');
    this.onKey = event => {
      if (!event.repeat && event.code === 'Escape') {
        event.preventDefault();
        this.onLeave();
      }
    };
    window.addEventListener('keydown', this.onKey);
    this.unsubscribe = [
      bus.on('cell:hit', ({ index }) => this.board.cells[index]?.hit(performance.now())),
      bus.on('riddle:hit', ({ index }) => {
        this.record(index, settings.scoreHitMole);
        this.clearOrphanedOthers(performance.now());
      }),
      bus.on('riddle:miss', ({ index }) => this.record(index, -settings.scoreHitOther)),
      bus.on('riddle:expired', ({ riddle }) => {
        if (riddle.isMole) this.clearOrphanedOthers(performance.now());
      }),
      bus.on('game:timeup', () => {
        const finalScore = this.score.total;
        this.context.machine.change('RESULT', { score: finalScore });
      })
    ];
  }
  record(index, points) {
    this.score.add(points);
    this.scoreDisplay.set(this.score.total);
    this.scoreDisplay.react(points >= 0);
    this.board.cells[index].showPoints(points);
  }
  clearOrphanedOthers(now) {
    const active = this.board.active;
    if (active.some(cell => cell.riddle.isMole)) return;
    active.forEach(cell => cell.reset(now));
  }
  update(now) {
    this.timer.update(now);
    if (this.context.machine.current !== this) return;
    this.board.update(now);
    this.spawner.update(now);
    const seconds = Math.ceil(this.timer.remainingMs(now) / 1000);
    this.timeElement.textContent = String(seconds);
    this.timeElement.classList.toggle('low', seconds <= 10);
  }
  exit() {
    window.removeEventListener('keydown', this.onKey);
    this.input.stop();
    this.unsubscribe.forEach(off => off());
    this.board.reset();
    this.element.classList.remove('playing');
    this.element.hidden = true;
  }
}
