import { defaultSettings, normalizeSettings } from '../core/DefaultSettings.js';

const fields = [
  ['gameDurationSec', '制限時間', '秒', 10, 600, 1],
  ['scoreHitMole', 'モグラの加点', '点', 0, 10000, 1],
  ['scoreHitOther', 'その他の減点', '点', 0, 10000, 1],
  ['riddleLifetimeSec', '謎の表示時間', '秒', 0.5, 30, 0.1],
  ['maxActive', '同時表示数', '個', 1, 9, 1],
  ['spawnIntervalStartSec', '出現間隔・開始', '秒', 0.1, 10, 0.1],
  ['spawnIntervalMinSec', '出現間隔・最短', '秒', 0.1, 10, 0.1],
  ['moleRatioPercent', '正解の出現率', '%', 0, 100, 1]
];
const fieldByKey = new Map(fields.map(field => [field[0], field]));
const groups = [
  ['ゲームのルール', ['gameDurationSec', 'scoreHitMole', 'scoreHitOther', 'allowNegativeScore']],
  ['なぞの出現', ['riddleLifetimeSec', 'maxActive', 'spawnIntervalStartSec', 'spawnIntervalMinSec', 'moleRatioPercent']]
];

export class OptionsScene {
  constructor(context) {
    this.context = context;
    this.element = document.getElementById('options-scene');
    const form = document.getElementById('options-form');
    form.noValidate = true;
    for (const [title, keys] of groups) {
      const group = document.createElement('fieldset');
      group.className = 'settings-group';
      const legend = document.createElement('legend');
      legend.textContent = title;
      group.append(legend);
      for (const key of keys) {
        const row = document.createElement('label');
        row.className = 'setting-row';
        if (key === 'allowNegativeScore') {
          row.innerHTML = '<span>マイナス点を許可</span><select name="allowNegativeScore"><option value="false">許可しない</option><option value="true">許可する</option></select>';
        } else {
          const [, label, unit, min, max, step] = fieldByKey.get(key);
          row.innerHTML = `<span>${label}<small>${unit}</small></span><input name="${key}" type="number" min="${min}" max="${max}" step="${step}" required>`;
        }
        group.append(row);
      }
      form.append(group);
    }
    form.append(form.querySelector('.options-actions'));
  }
  fill(values) {
    for (const [key, value] of Object.entries(values)) {
      const field = this.form.elements.namedItem(key);
      if (field) field.value = String(value);
    }
  }
  enter() {
    this.element.hidden = false;
    this.form = document.getElementById('options-form');
    this.fill(this.context.settings);
    this.message = document.getElementById('options-message');
    this.message.textContent = '';
    this.onKey = event => {
      if (event.code === 'Escape') { event.preventDefault(); this.context.machine.change('TITLE'); }
    };
    this.onReset = () => this.fill(defaultSettings);
    this.onCancel = () => this.context.machine.change('TITLE');
    this.onSubmit = async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(this.form));
      data.allowNegativeScore = data.allowNegativeScore === 'true';
      try {
        this.context.settings = this.context.preview
          ? normalizeSettings(data) : await window.api.saveSettings(data);
        this.context.machine.change('TITLE');
      } catch (error) { this.message.textContent = `保存できませんでした: ${error.message}`; }
    };
    window.addEventListener('keydown', this.onKey);
    this.form.addEventListener('submit', this.onSubmit);
    document.getElementById('reset-button').addEventListener('click', this.onReset);
    document.getElementById('cancel-button').addEventListener('click', this.onCancel);
  }
  update() {}
  exit() {
    window.removeEventListener('keydown', this.onKey);
    this.form.removeEventListener('submit', this.onSubmit);
    document.getElementById('reset-button').removeEventListener('click', this.onReset);
    document.getElementById('cancel-button').removeEventListener('click', this.onCancel);
    this.element.hidden = true;
  }
}
